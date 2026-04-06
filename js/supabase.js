const SUPABASE_URL = "https://aqecgofdcngooqcxdieu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZWNnb2ZkY25nb29xY3hkaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTAyNDQsImV4cCI6MjA5MDYyNjI0NH0.HbsoNGvT6i3lERkskdrJfV1f4WLKT8dzRfaXtPJnJ7k";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Add this to the end of js/supabase.js
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verification test
console.log("Supabase initialized:", window.supabaseClient ? "Success" : "Failed");
