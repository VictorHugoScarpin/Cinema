// js/supabase.js
// URL e chave agora vêm de variáveis de ambiente (injetadas pelo Vite no build),
// nunca ficam escritas direto no código.
//
// A anon key do Supabase é feita pra ser pública (a segurança de verdade vem
// das políticas de RLS no banco) — mas mesmo assim é boa prática mantê-la
// fora do código-fonte versionado, configurada via .env local e via
// Environment Variables no painel da Vercel.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. Veja o .env.example.');
}

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Exposto no window porque auth.js e dashboard.js são carregados como
// scripts separados (não como imports de módulo) e esperam essa variável global.
window.supabaseClient = supabaseClient;
