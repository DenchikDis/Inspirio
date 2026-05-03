// Supabase Configuration
const SUPABASE_URL = 'https://vmaakwcqhfjzfupscccc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtYWFrd2NxaGZqemZ1cHNjY2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTE0NzcsImV4cCI6MjA4NjMyNzQ3N30.VaZwEaezCDSrgaCAyot4rDE9ViB7au3BcG58kCeeBkc';

// Initialize Supabase client
// The supabase library is loaded via script tag before this file
// So we can safely use it here
if (typeof supabase !== 'undefined') {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('Supabase library not loaded! Make sure the script tag is before this file.');
}

// Optional: direct uploads to Cloudflare R2 via Vercel /api (see ENV_UPLOAD.md).
// When UPLOAD_API_TOKEN is non-empty, admin uses presigned PUT instead of Supabase Storage.
window.UPLOAD_API_BASE = '';
window.UPLOAD_API_TOKEN = '';
window.R2_PUBLIC_BASE_URL = '';
window.MEDIA_SOURCE = 'dual';
