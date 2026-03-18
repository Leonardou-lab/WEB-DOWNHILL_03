(() => {
  const SUPABASE_URL = "https://ckerspumupzmksajgsur.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZXJzcHVtdXB6bWtzYWpnc3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTMzMTcsImV4cCI6MjA4NTcyOTMxN30.lJgpsOJ2es2JTD-jhQnMhveBYQWOXdKZ87vKJy1BgQY";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Supabase JS no esta disponible. Verifica el CDN.");
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
})();
