console.log("Login carregado!");

// ---------------------------------------------------
// LOGIN SIMPLES (usuário e senha fixos no código)
// ---------------------------------------------------
// IMPORTANTE: isso NÃO é seguro de verdade. Qualquer pessoa pode abrir
// o código-fonte desse arquivo e ver o usuário/senha corretos.
// Para um projeto real, o certo seria validar isso num servidor.
// Aqui serve só para simular o funcionamento de um login, já que
// não temos um backend nesse projeto.

const USUARIO_CORRETO = "admin";
const SENHA_CORRETA = "1234";

const loginForm = document.getElementById("loginForm");
const mensagemErro = document.getElementById("mensagemErro");

loginForm.addEventListener("submit", (event) => {

    // Impede o formulário de recarregar a página
    event.preventDefault();

    const usuarioDigitado = document.getElementById("usuario").value;
    const senhaDigitada = document.getElementById("senha").value;

    if (usuarioDigitado === USUARIO_CORRETO && senhaDigitada === SENHA_CORRETA) {

        // sessionStorage guarda informação só enquanto a aba do navegador
        // estiver aberta (diferente do localStorage, que fica salvo sempre).
        // Usamos ele aqui como uma "marcação" de que o admin está logado.
        sessionStorage.setItem("logado", "true");

        // Redireciona para a página do dashboard administrativo
        window.location.href = "admin.html";

    } else {

        // Mostra uma mensagem de erro na tela, sem recarregar a página
        mensagemErro.textContent = "Usuário ou senha incorretos.";

    }

});
