'use strict';

const crypto = require('crypto');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const IMAGE_MAX = 50 * 1024 * 1024;
const VIDEO_MAX = 500 * 1024 * 1024;

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

function timingSafeEqualString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const la = Buffer.byteLength(a, 'utf8');
  const lb = Buffer.byteLength(b, 'utf8');
  if (la !== lb) return false;
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return crypto.timingSafeEqual(ba, bb);
}

function verifyUploadToken(req) {
  const expected = process.env.UPLOAD_API_TOKEN || '';
  if (!expected) return { ok: false, error: 'Server UPLOAD_API_TOKEN is not configured' };
  const got = req.headers['x-inspire-upload-token'] || '';
  if (!timingSafeEqualString(got, expected)) return { ok: false, error: 'Unauthorized' };
  return { ok: true };
}

function extFromMime(mime) {
  const m = (mime || '').toLowerCase().split(';')[0].trim();
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return map[m] || 'bin';
}

function validateBlobInput({ mime, size_bytes }) {
  const m = (mime || '').toLowerCase().split(';')[0].trim();
  const isImage = m.startsWith('image/');
  const isVideo = m.startsWith('video/');
  if (!isImage && !isVideo) return { ok: false, error: 'Unsupported media type' };
  if (isImage) {
    if (!ALLOWED_IMAGE_MIMES.has(m)) return { ok: false, error: 'Image MIME not allowed' };
    if (size_bytes > IMAGE_MAX) return { ok: false, error: 'Image too large (max 50MB)' };
  }
  if (isVideo) {
    if (!ALLOWED_VIDEO_MIMES.has(m)) return { ok: false, error: 'Video MIME not allowed' };
    if (size_bytes > VIDEO_MAX) return { ok: false, error: 'Video too large (max 500MB)' };
  }
  return { ok: true, mime: m };
}

function getS3() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('R2 env vars missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET)');
  }
  const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
  return {
    client: new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    }),
    bucket,
  };
}

function publicBaseUrl() {
  const u = (process.env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
  return u;
}

function buildPublicUrl(key) {
  const base = publicBaseUrl();
  if (!base) throw new Error('R2_PUBLIC_BASE_URL is not set on server');
  return `${base}/${key.replace(/^\//, '')}`;
}

async function presignPut(key, mime) {
  const { client, bucket } = getS3();
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mime,
  });
  const upload_url = await getSignedUrl(client, cmd, { expiresIn: 300 });
  return {
    upload_url,
    upload_headers: { 'Content-Type': mime },
  };
}

async function headObject(key) {
  const { client, bucket } = getS3();
  return client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
}

module.exports = {
  verifyUploadToken,
  validateBlobInput,
  extFromMime,
  presignPut,
  headObject,
  publicBaseUrl,
  buildPublicUrl,
  IMAGE_MAX,
  VIDEO_MAX,
};
