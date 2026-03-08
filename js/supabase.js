// js/supabase.js

const supabaseUrl = 'https://rgjgxnhlfmazouqkzlxv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnamd4bmhsZm1hem91cWt6bHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTI2MzUsImV4cCI6MjA4ODU2ODYzNX0.NwB5VYr1r2T1RMwFys99pVu1JRg8Sqc7vYIko-5jDdw';

// Mudamos o nome para supabaseClient para não dar conflito com o script do HTML
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase inicializado com sucesso!");