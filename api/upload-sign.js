'use strict';

const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const {
  verifyUploadToken,
  validateBlobInput,
  extFromMime,
  presignPut,
  buildPublicUrl,
} = require('./lib/upload-core.js');

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-inspire-upload-token');
}

function json(res, statusCode, data) {
  setCors(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const auth = verifyUploadToken(req);
  if (!auth.ok) return json(res, 401, { error: auth.error });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return json(res, 400, { error: 'Invalid JSON' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 500, { error: 'Supabase server env not configured' });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  const flow = body.flow;
  if (flow === 'blob') {
    const v = validateBlobInput({
      mime: body.mime,
      size_bytes: Number(body.size_bytes),
    });
    if (!v.ok) return json(res, 400, { error: v.error });

    const ext = extFromMime(v.mime);
    const blobId = randomUUID();
    const key = `media/blob/${blobId}/original.${ext}`;

    try {
      const { upload_url, upload_headers } = await presignPut(key, v.mime);
      const public_url = buildPublicUrl(key);
      return json(res, 200, {
        flow: 'blob',
        key,
        upload_url,
        upload_headers,
        public_url,
      });
    } catch (e) {
      console.error(e);
      return json(res, 500, { error: e.message || 'Presign failed' });
    }
  }

  if (flow === 'media') {
    const sectionId = body.section_id;
    const projectId = body.project_id;
    const type = body.type === 'video' ? 'video' : 'image';
    const size_bytes = Number(body.size_bytes);
    const order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;

    if (!sectionId || !projectId) {
      return json(res, 400, { error: 'section_id and project_id required' });
    }

    const mimeGuess = type === 'video' ? 'video/mp4' : 'image/jpeg';
    const v = validateBlobInput({
      mime: body.mime || mimeGuess,
      size_bytes,
    });
    if (!v.ok) return json(res, 400, { error: v.error });

    const { data: sec, error: secErr } = await supabase
      .from('sections')
      .select('id, project_id')
      .eq('id', sectionId)
      .maybeSingle();
    if (secErr || !sec) return json(res, 400, { error: 'Section not found' });
    if (sec.project_id !== projectId) return json(res, 400, { error: 'Section does not belong to project' });

    const ext = extFromMime(v.mime);
    const placeholderUrl = `uploading://pending`;

    const insertPayload = {
      section_id: sectionId,
      type,
      url: placeholderUrl,
      thumbnail_url: null,
      order,
      bytes: size_bytes,
      mime: v.mime,
      storage_source: 'r2',
      r2_key: null,
      upload_status: 'uploading',
      variants: {},
    };

    const { data: row, error: insErr } = await supabase.from('media').insert(insertPayload).select().single();
    if (insErr) {
      console.error(insErr);
      return json(res, 500, {
        error: insErr.message || 'media insert failed',
        hint: 'Run sql/migration-r2-media-columns.sql if columns are missing',
      });
    }

    const mediaId = row.id;
    const key = `media/${projectId}/${sectionId}/${mediaId}/original.${ext}`;

    const { error: keyErr } = await supabase.from('media').update({ r2_key: key }).eq('id', mediaId);
    if (keyErr) return json(res, 500, { error: keyErr.message });

    try {
      const { upload_url, upload_headers } = await presignPut(key, v.mime);
      const public_url = buildPublicUrl(key);
      return json(res, 200, {
        flow: 'media',
        key,
        media_id: mediaId,
        upload_url,
        upload_headers,
        public_url,
      });
    } catch (e) {
      console.error(e);
      await supabase.from('media').delete().eq('id', mediaId);
      return json(res, 500, { error: e.message || 'Presign failed' });
    }
  }

  return json(res, 400, { error: 'Unknown flow (use blob or media)' });
};
