// js/auth.js

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Usando o supabaseClient agora
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert("Erro ao entrar: " + error.message);
            return;
        }

        console.log("Login realizado com sucesso!", data);
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error("Erro inesperado:", error);
    }
});

// Verificação de sessão também usando supabaseClient
async function checkCurrentSession() {
    // Usando try/catch para evitar erros se o cliente ainda estiver carregando
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            console.log("Usuário já está logado!");
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.log("Nenhuma sessão ativa encontrada.");
    }
}

checkCurrentSession();