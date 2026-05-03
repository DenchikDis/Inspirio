'use strict';

const { createClient } = require('@supabase/supabase-js');
const { verifyUploadToken, headObject, buildPublicUrl } = require('./lib/upload-core.js');

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

  const key = typeof body.key === 'string' ? body.key.trim() : '';
  if (!key || key.includes('..')) return json(res, 400, { error: 'Invalid key' });

  let meta;
  try {
    meta = await headObject(key);
  } catch (e) {
    console.error(e);
    return json(res, 400, { error: 'Object not found in R2 yet', detail: String(e.message || e) });
  }

  const public_url = buildPublicUrl(key);
  const size = Number(meta.ContentLength || 0);
  const mime = meta.ContentType || null;

  const flow = body.flow;
  if (flow === 'blob') {
    return json(res, 200, { ok: true, flow: 'blob', public_url, bytes: size, mime });
  }

  if (flow === 'media') {
    const mediaId = body.media_id;
    if (!mediaId) return json(res, 400, { error: 'media_id required' });

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return json(res, 500, { error: 'Supabase server env not configured' });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: existing, error: fetchErr } = await supabase.from('media').select('*').eq('id', mediaId).maybeSingle();
    if (fetchErr || !existing) return json(res, 404, { error: 'media row not found' });
    if (existing.r2_key && existing.r2_key !== key) {
      return json(res, 400, { error: 'Key does not match media row' });
    }

    const { data: updated, error: upErr } = await supabase
      .from('media')
      .update({
        url: public_url,
        r2_key: key,
        storage_source: 'r2',
        upload_status: 'ready',
        bytes: size || existing.bytes,
        mime: mime || existing.mime,
      })
      .eq('id', mediaId)
      .select()
      .single();

    if (upErr) {
      console.error(upErr);
      return json(res, 500, { error: upErr.message, hint: 'Run migration-r2-media-columns.sql if columns are missing' });
    }

    return json(res, 200, { ok: true, flow: 'media', media: updated, public_url });
  }

  return json(res, 400, { error: 'Unknown flow' });
};
