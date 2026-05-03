/**
 * Public URL helpers for media rows (sections) and string URLs.
 * Configure on window: R2_PUBLIC_BASE_URL, MEDIA_SOURCE (dual|supabase|r2).
 */
(function (global) {
  function r2Base() {
    return String(global.R2_PUBLIC_BASE_URL || '')
      .trim()
      .replace(/\/$/, '');
  }

  function mediaMode() {
    return String(global.MEDIA_SOURCE || 'dual').toLowerCase();
  }

  function buildMediaUrl(row) {
    if (!row) return '';
    if (typeof row === 'string') {
      const s = row.trim();
      if (s.startsWith('uploading://')) return '';
      return s;
    }

    const url = row.url != null ? String(row.url) : '';
    if (url.startsWith('uploading://')) return '';

    const base = r2Base();
    const mode = mediaMode();
    const key = row.r2_key != null ? String(row.r2_key).replace(/^\//, '') : '';

    if (url.startsWith('http')) {
      if (mode === 'r2' && key && base) return `${base}/${key}`;
      if (mode === 'dual' && row.storage_source === 'r2' && key && base) return `${base}/${key}`;
      return url;
    }

    if (key && base && (mode === 'r2' || row.storage_source === 'r2')) return `${base}/${key}`;
    return url;
  }

  function buildMediaThumbUrl(row) {
    if (!row) return '';
    const v = row.variants;
    if (v && typeof v === 'object' && typeof v.thumb === 'string' && v.thumb.startsWith('http')) return v.thumb;
    if (row.type === 'video' && row.thumbnail_url && String(row.thumbnail_url).startsWith('http')) {
      return String(row.thumbnail_url);
    }
    return buildMediaUrl(row);
  }

  /** String URL from sites.screenshots / videos — hides broken placeholders */
  function resolvePublicAssetUrl(href) {
    if (!href || typeof href !== 'string') return '';
    const s = href.trim();
    if (s.startsWith('uploading://')) return '';
    return s;
  }

  global.buildMediaUrl = buildMediaUrl;
  global.buildMediaThumbUrl = buildMediaThumbUrl;
  global.resolvePublicAssetUrl = resolvePublicAssetUrl;
})(typeof window !== 'undefined' ? window : globalThis);
