console.log("Script carregado!");

const dateButton = document.querySelector(".date-button");
const dateText = document.querySelector(".date-text");
const dateOptions = document.querySelector(".date-options");

let datasCriadas = false;


dateButton.addEventListener("click", () => {

    dateOptions.classList.toggle("active");


    if (!datasCriadas) {

        const hoje = new Date();

        for (let i = 0; i < 5; i++) {

            const novaData = new Date();
            novaData.setDate(hoje.getDate() + i);

            const dia = String(novaData.getDate()).padStart(2, "0");
            const mes = String(novaData.getMonth() + 1).padStart(2, "0");
            const ano = novaData.getFullYear();

            const dataFormatada = `${dia}/${mes}/${ano}`;


            const button = document.createElement("button");

            button.type = "button";
            button.classList.add("day");
            button.textContent = dataFormatada;


            dateOptions.appendChild(button);


            button.addEventListener("click", () => {

                console.log("Data escolhida:", dataFormatada);

                dateText.textContent = dataFormatada;

                dateOptions.classList.remove("active");

                // Sempre que uma nova data é escolhida, atualizamos quais
                // horários já estão ocupados nesse dia
                atualizarHorariosDisponiveis(dataFormatada);

            });

        }

        datasCriadas = true;

    }

});


// ---------------------------------------------------
// HORÁRIOS OCUPADOS
// ---------------------------------------------------

const selectHorario = document.getElementById("horario");

// Essa função olha os agendamentos já salvos, descobre quais horários já
// estão ocupados NA DATA escolhida, e desabilita essas opções no <select>
function atualizarHorariosDisponiveis(dataEscolhida) {

    const agendamentosSalvos = localStorage.getItem("agendamentos");
    const agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

    // Pegamos só os horários da mesma data que NÃO estão cancelados
    // (um agendamento cancelado libera o horário de novo para outra pessoa)
    const horariosOcupados = agendamentos
        .filter((agendamento) => agendamento.data === dataEscolhida && agendamento.status !== "Cancelado")
        .map((agendamento) => agendamento.horario);

    // Percorremos cada <option> do select de horário
    // Array.from transforma a lista de opções em um array de verdade,
    // para podermos usar o .forEach nela
    Array.from(selectHorario.options).forEach((opcao) => {

        // Pulamos a opção "Selecione o Horário", ela nunca é desabilitada
        if (opcao.value === "Selecione o Horário") {
            return;
        }

        if (horariosOcupados.includes(opcao.value)) {
            // Desabilita a opção e avisa visualmente que está ocupada
            opcao.disabled = true;
            opcao.textContent = `${opcao.value} (Ocupado)`;
        } else {
            // Garante que ela volte ao normal caso não esteja mais ocupada
            opcao.disabled = false;
            opcao.textContent = opcao.value;
        }

    });

    // Se o horário que estava escolhido virou "ocupado" (porque trocamos a
    // data), voltamos o select para a opção padrão
    if (selectHorario.selectedOptions[0].disabled) {
        selectHorario.value = "Selecione o Horário";
    }

}


// ---------------------------------------------------
// SALVAR AGENDAMENTO
// ---------------------------------------------------

// Pegamos o formulário pelo id que criamos no HTML
const form = document.getElementById("agendamentoForm");

// "submit" é o evento disparado quando o botão type="submit" é clicado
// (ou quando o usuário aperta Enter dentro de um input do formulário)
form.addEventListener("submit", (event) => {

    // Isso impede o comportamento padrão do navegador de recarregar a página
    event.preventDefault();

    // Pegamos o valor de cada campo do formulário
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const servico = document.getElementById("servico").value;
    const data = dateText.textContent; // o texto que já está no botão de data
    const horario = document.getElementById("horario").value;
    const observacoes = document.getElementById("observacoes").value;

    // Validação simples: verifica se os campos obrigatórios foram preenchidos
    if (nome === "" || telefone === "") {
        alert("Por favor, preencha nome e telefone.");
        return; // "return" para a execução da função aqui, não salva nada
    }

    if (servico === "Selecione um Serviço") {
        alert("Por favor, selecione um serviço.");
        return;
    }

    if (data === "Escolha uma data") {
        alert("Por favor, escolha uma data.");
        return;
    }

    if (horario === "Selecione o Horário") {
        alert("Por favor, selecione um horário.");
        return;
    }

    // Checagem extra de segurança: garante que o horário escolhido
    // realmente não está ocupado nessa data (evita conflito de agendamento)
    if (selectHorario.selectedOptions[0].disabled) {
        alert("Esse horário já está ocupado nessa data. Escolha outro.");
        return;
    }

    // Criamos um objeto representando o agendamento
    const novoAgendamento = {
        id: Date.now(), // Date.now() gera um número único baseado no horário atual, serve como "id"
        nome: nome,
        telefone: telefone,
        servico: servico,
        data: data,
        horario: horario,
        observacoes: observacoes,
        status: "Agendado"
    };

    // O localStorage só guarda texto (strings), então guardamos os agendamentos
    // como uma lista (array) transformada em texto usando JSON.stringify

    // 1) Pegamos a lista que já existe no localStorage
    const agendamentosSalvos = localStorage.getItem("agendamentos");

    // 2) Se já existir algo salvo, transformamos de volta em array com JSON.parse
    //    Se não existir nada ainda (primeira vez), começamos com um array vazio
    const agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

    // 3) Adicionamos o novo agendamento na lista
    agendamentos.push(novoAgendamento);

    // 4) Salvamos a lista atualizada de volta no localStorage (como texto)
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

    // Avisamos o usuário que deu certo
    alert("Agendamento realizado com sucesso!");

    // Limpamos o formulário para um novo agendamento
    form.reset();
    dateText.textContent = "Escolha uma data";

});


// ---------------------------------------------------
// MENU HAMBÚRGUER (mobile)
// ---------------------------------------------------

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {

    // Alterna a classe "active" no menu: se não tinha, adiciona (abre);
    // se já tinha, remove (fecha)
    menu.classList.toggle("active");

});

// Fecha o menu automaticamente quando algum link dele é clicado
// (assim, ao clicar em "Serviços", o menu já fecha sozinho)
menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});


// ---------------------------------------------------
// CARDS DE SERVIÇO (seção "Serviços")
// ---------------------------------------------------

const servicoCards = document.querySelectorAll(".servico-card");
const selectServico = document.getElementById("servico");

servicoCards.forEach((card) => {

    card.addEventListener("click", () => {

        // Pegamos o nome do serviço guardado no atributo data-servico do card
        const servicoEscolhido = card.getAttribute("data-servico");

        // Selecionamos essa opção no <select> do formulário
        selectServico.value = servicoEscolhido;

        // Rolamos a tela suavemente até o formulário, pra pessoa já ver
        // que o serviço foi selecionado
        form.scrollIntoView({ behavior: "smooth" });

    });

});