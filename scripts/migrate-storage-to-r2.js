#!/usr/bin/env node
/**
 * Copy objects referenced by public.media (Supabase Storage URLs) and sites.screenshots/videos into R2,
 * then update DB. Requires: migration-r2-media-columns.sql applied.
 *
 * Usage:
 *   node scripts/migrate-storage-to-r2.js --dry-run
 *   node scripts/migrate-storage-to-r2.js
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 *      R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL (optional R2_ENDPOINT)
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');

const dryRun = process.argv.includes('--dry-run');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function mediasPathFromPublicUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/storage\/v1\/object\/public\/Medias\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function getS3() {
  const accountId = requireEnv('R2_ACCOUNT_ID');
  const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
  return {
    client: new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
        secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    }),
    bucket: requireEnv('R2_BUCKET'),
  };
}

async function putBuffer(client, bucket, key, body, contentType) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
    })
  );
}

async function migrate() {
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'));

  let client;
  let bucket;
  let publicBase = '';
  if (!dryRun) {
    const s3 = getS3();
    client = s3.client;
    bucket = s3.bucket;
    publicBase = requireEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, '');
  }

  let mediaProcessed = 0;
  let sitesProcessed = 0;

  const { data: mediaRows, error: mErr } = await supabase.from('media').select('id, url, type');
  if (mErr) throw mErr;

  for (const row of mediaRows || []) {
    const url = row.url;
    if (!url || typeof url !== 'string' || !url.includes('/storage/v1/object/public/Medias/')) continue;

    const oldPath = mediasPathFromPublicUrl(url);
    if (!oldPath) continue;

    const ext = oldPath.split('.').pop() || 'bin';
    const key = `media/migrated/${row.id}/original.${ext}`;

    if (dryRun) {
      console.log('[dry-run] media', row.id, '->', key);
      mediaProcessed += 1;
      continue;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.error('Skip media (download failed)', row.id, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get('content-type') || 'application/octet-stream';

    await putBuffer(client, bucket, key, buf, ct);
    const newUrl = `${publicBase}/${key}`;

    const { error: uErr } = await supabase
      .from('media')
      .update({
        url: newUrl,
        r2_key: key,
        storage_source: 'r2',
        upload_status: 'ready',
        mime: ct.split(';')[0].trim(),
        bytes: buf.length,
      })
      .eq('id', row.id);
    if (uErr) console.error('Update failed', row.id, uErr);
    else {
      mediaProcessed++;
      console.log('Migrated media', row.id);
    }
  }

  const { data: sites, error: sErr } = await supabase.from('sites').select('id, screenshots, videos');
  if (sErr) throw sErr;

  for (const site of sites || []) {
    const shots = Array.isArray(site.screenshots) ? [...site.screenshots] : [];
    const vids = Array.isArray(site.videos) ? [...site.videos] : [];

    async function mapUrl(u) {
      if (typeof u !== 'string' || !u.includes('/storage/v1/object/public/Medias/')) return { next: u, touched: false };
      const oldPath = mediasPathFromPublicUrl(u);
      if (!oldPath) return { next: u, touched: false };
      const ext = oldPath.split('.').pop() || 'bin';
      const key = `media/migrated/sites/${site.id}/${randomUUID()}.${ext}`;
      if (dryRun) {
        console.log('[dry-run] site', site.id, String(u).slice(0, 72), '->', key);
        return { next: u, touched: true };
      }
      const res = await fetch(u);
      if (!res.ok) {
        console.error('Skip site asset', site.id, res.status);
        return { next: u, touched: false };
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const ct = res.headers.get('content-type') || 'application/octet-stream';
      await putBuffer(client, bucket, key, buf, ct);
      return { next: `${publicBase}/${key}`, touched: true };
    }

    let changed = false;
    for (let i = 0; i < shots.length; i++) {
      const { next, touched } = await mapUrl(shots[i]);
      shots[i] = next;
      if (touched) changed = true;
    }
    for (let i = 0; i < vids.length; i++) {
      const { next, touched } = await mapUrl(vids[i]);
      vids[i] = next;
      if (touched) changed = true;
    }

    if (dryRun) {
      if (changed) sitesProcessed += 1;
      continue;
    }

    if (changed) {
      const { error: up } = await supabase.from('sites').update({ screenshots: shots, videos: vids }).eq('id', site.id);
      if (up) console.error('Site update failed', site.id, up);
      else {
        sitesProcessed += 1;
        console.log('Migrated site assets', site.id);
      }
    }
  }

  console.log(dryRun ? 'Dry run complete.' : 'Migration complete.', { mediaProcessed, sitesProcessed });
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
