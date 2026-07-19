console.log("Admin carregado!");

// ---------------------------------------------------
// 1) PROTEGER A PÁGINA (checar se está logado)
// ---------------------------------------------------
// Se a pessoa tentar abrir admin.html direto pela URL, sem ter passado
// pelo login.html, o sessionStorage não vai ter "logado" = "true".
// Nesse caso, mandamos ela de volta para a tela de login.

const estaLogado = sessionStorage.getItem("logado");

if (estaLogado !== "true") {
    window.location.href = "login.html";
}


// ---------------------------------------------------
// 2) BOTÃO SAIR (logout)
// ---------------------------------------------------

const botaoSair = document.getElementById("botaoSair");

botaoSair.addEventListener("click", () => {

    // Remove a marcação de "logado" do sessionStorage
    sessionStorage.removeItem("logado");

    // Volta para a tela de login
    window.location.href = "login.html";

});


// ---------------------------------------------------
// 3) LISTA DE STATUS POSSÍVEIS
// ---------------------------------------------------
// Deixamos numa lista só, assim se precisar mudar/adicionar um status
// no futuro, muda só aqui.

const STATUS_POSSIVEIS = ["Agendado", "Confirmado", "Concluído", "Cancelado"];


// ---------------------------------------------------
// 4) CARDS DE RESUMO (Total, Pendentes, Concluídos, Cancelados)
// ---------------------------------------------------

// Essa função sempre olha TODOS os agendamentos salvos (sem levar em conta
// o filtro de data da tabela), porque o resumo deve refletir o total geral.
function atualizarCards() {

    const agendamentosSalvos = localStorage.getItem("agendamentos");
    const agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

    const total = agendamentos.length;

    // "Pendentes" = ainda não terminou nem foi cancelado
    const pendentes = agendamentos.filter(
        (agendamento) => agendamento.status === "Agendado" || agendamento.status === "Confirmado"
    ).length;

    const concluidos = agendamentos.filter(
        (agendamento) => agendamento.status === "Concluído"
    ).length;

    const cancelados = agendamentos.filter(
        (agendamento) => agendamento.status === "Cancelado"
    ).length;

    document.getElementById("cardTotal").textContent = total;
    document.getElementById("cardPendentes").textContent = pendentes;
    document.getElementById("cardConcluidos").textContent = concluidos;
    document.getElementById("cardCancelados").textContent = cancelados;

}


// ---------------------------------------------------
// 5) LER E MOSTRAR OS AGENDAMENTOS (com filtro por data)
// ---------------------------------------------------

const tabelaAgendamentos = document.getElementById("tabelaAgendamentos");
const mensagemVazia = document.getElementById("mensagemVazia");
const filtroData = document.getElementById("filtroData");
const botaoLimparFiltro = document.getElementById("botaoLimparFiltro");

// Essa função lê o localStorage, monta as linhas da tabela e mostra na tela.
// Recebe opcionalmente uma data (no formato dd/mm/aaaa) para filtrar.
function carregarAgendamentos(dataFiltro = "") {

    // Pega o texto salvo no localStorage e transforma de volta em array.
    // Se não existir nada salvo ainda, usamos um array vazio.
    const agendamentosSalvos = localStorage.getItem("agendamentos");
    let agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

    // Se foi passada uma data de filtro, mantemos só os agendamentos
    // daquele dia específico
    if (dataFiltro !== "") {
        agendamentos = agendamentos.filter((agendamento) => agendamento.data === dataFiltro);
    }

    // Limpa a tabela antes de desenhar de novo (evita duplicar linhas)
    tabelaAgendamentos.innerHTML = "";

    // Se não sobrou nenhum agendamento (seja porque não existe nenhum,
    // seja porque o filtro não encontrou nada), mostra a mensagem
    if (agendamentos.length === 0) {
        mensagemVazia.style.display = "block";
        mensagemVazia.textContent = dataFiltro
            ? "Nenhum agendamento encontrado para essa data."
            : "Nenhum agendamento encontrado ainda.";
        return;
    }

    mensagemVazia.style.display = "none";

    // Para cada agendamento salvo, criamos uma linha <tr> na tabela
    agendamentos.forEach((agendamento) => {

        const linha = document.createElement("tr");

        // Montamos as <option> do select de status dinamicamente,
        // marcando como "selected" a opção que já é o status atual
        const opcoesStatus = STATUS_POSSIVEIS.map((status) => {
            const selecionado = status === agendamento.status ? "selected" : "";
            return `<option value="${status}" ${selecionado}>${status}</option>`;
        }).join("");

        // template string para montar o HTML da linha de uma vez
        linha.innerHTML = `
            <td>${agendamento.nome}</td>
            <td>${agendamento.telefone}</td>
            <td>${agendamento.servico}</td>
            <td>${agendamento.data}</td>
            <td>${agendamento.horario}</td>
            <td>
                <select class="select-status" data-id="${agendamento.id}">
                    ${opcoesStatus}
                </select>
            </td>
            <td>
                <button class="botao-excluir" data-id="${agendamento.id}">
                    Excluir
                </button>
            </td>
        `;

        tabelaAgendamentos.appendChild(linha);

    });

    // Depois de criar tudo, ligamos os eventos dos selects e dos botões
    adicionarEventosStatus();
    adicionarEventosExcluir();

}


// ---------------------------------------------------
// 6) ALTERAR O STATUS DE UM AGENDAMENTO
// ---------------------------------------------------

function adicionarEventosStatus() {

    const selectsStatus = document.querySelectorAll(".select-status");

    selectsStatus.forEach((select) => {

        // "change" dispara sempre que o usuário escolhe uma opção diferente
        select.addEventListener("change", () => {

            const id = Number(select.getAttribute("data-id"));
            const novoStatus = select.value;

            // Pega a lista atual do localStorage
            const agendamentosSalvos = localStorage.getItem("agendamentos");
            const agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

            // Procura o agendamento certo pelo id e atualiza o status dele
            const agendamentosAtualizados = agendamentos.map((agendamento) => {
                if (agendamento.id === id) {
                    // { ...agendamento, status: novoStatus } cria uma cópia do
                    // objeto trocando só o campo "status"
                    return { ...agendamento, status: novoStatus };
                }
                return agendamento;
            });

            localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados));

            console.log(`Status do agendamento ${id} alterado para: ${novoStatus}`);

            // Atualiza os números dos cards, já que um status mudou
            atualizarCards();

        });

    });

}


// ---------------------------------------------------
// 7) EXCLUIR UM AGENDAMENTO
// ---------------------------------------------------

function adicionarEventosExcluir() {

    // Pega todos os botões com a classe "botao-excluir" que existem agora na tabela
    const botoesExcluir = document.querySelectorAll(".botao-excluir");

    botoesExcluir.forEach((botao) => {

        botao.addEventListener("click", () => {

            // Pegamos o id do agendamento guardado no atributo data-id do botão.
            // Como atributos HTML sempre vêm como texto, convertemos para Number
            // (o id foi criado com Date.now(), que é um número).
            const idParaExcluir = Number(botao.getAttribute("data-id"));

            const confirmar = confirm("Tem certeza que deseja excluir esse agendamento?");

            if (!confirmar) {
                return;
            }

            // Pega a lista atual do localStorage
            const agendamentosSalvos = localStorage.getItem("agendamentos");
            const agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

            // .filter() cria um novo array mantendo só os agendamentos
            // cujo id é DIFERENTE do que queremos excluir
            const agendamentosAtualizados = agendamentos.filter(
                (agendamento) => agendamento.id !== idParaExcluir
            );

            // Salva a lista já sem o agendamento excluído
            localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados));

            // Redesenha a tabela (mantendo o filtro de data que estiver ativo)
            carregarAgendamentos(converterDataParaBR(filtroData.value));

            // Atualiza os números dos cards, já que um agendamento sumiu
            atualizarCards();

        });

    });

}


// ---------------------------------------------------
// 8) FILTRO POR DATA
// ---------------------------------------------------

// O <input type="date"> sempre devolve o valor no formato "aaaa-mm-dd".
// Só que a gente guarda as datas no formato "dd/mm/aaaa" (foi assim que
// o script.js criou as datas). Essa função converte de um formato pro outro.
function converterDataParaBR(dataISO) {

    if (!dataISO) {
        return ""; // input vazio = sem filtro
    }

    const [ano, mes, dia] = dataISO.split("-");

    return `${dia}/${mes}/${ano}`;

}

// Sempre que o usuário escolhe uma data no campo de filtro, recarregamos
// a tabela já filtrada
filtroData.addEventListener("change", () => {
    const dataFormatada = converterDataParaBR(filtroData.value);
    carregarAgendamentos(dataFormatada);
});

// Botão para limpar o filtro e voltar a mostrar todos os agendamentos
botaoLimparFiltro.addEventListener("click", () => {
    filtroData.value = "";
    carregarAgendamentos();
});


// ---------------------------------------------------
// 9) CHAMAR AS FUNÇÕES AO CARREGAR A PÁGINA
// ---------------------------------------------------

carregarAgendamentos();
atualizarCards();
