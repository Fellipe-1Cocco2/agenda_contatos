document.addEventListener("DOMContentLoaded", function () {
  const pesquisaInput = document.getElementById("pesquisa");
  const resultadoPesquisa = document.getElementById("resultado-pesquisa");
  const headerPesquisa = document.getElementById("header-pesquisa");

  // Suponha que você tenha uma lista de contatos
  const contatos = [
    { nome: "João Silva", telefone: "987654321", email: "joao@email.com" },
    { nome: "João Silva", telefone: "987654321", email: "joao@email.com" },
    { nome: "João Silva", telefone: "987654321", email: "joao@email.com" },
    { nome: "João Silva", telefone: "987654321", email: "joao@email.com" },
    { nome: "Maria Oliveira", telefone: "912345678", email: "maria@email.com" },
    { nome: "Carlos Souza", telefone: "998877665", email: "carlos@email.com" },
    // Mais contatos...
  ];

  // Função para filtrar contatos
  function filtrarContatos(termo) {
    return contatos.filter((contato) => {
      return (
        contato.nome.toLowerCase().includes(termo) ||
        contato.telefone.includes(termo) ||
        contato.email.toLowerCase().includes(termo)
      );
    });
  }

  // Função para renderizar resultados da pesquisa
  function renderizarResultados(resultados) {
    resultadoPesquisa.innerHTML = ""; // Limpa resultados anteriores
    if (resultados.length === 0) {
      resultadoPesquisa.style.display = "none";
      return;
    }

    resultados.forEach((contato) => {
      const li = document.createElement("li");
      li.textContent = `${contato.nome} - ${contato.email} - ${contato.telefone}`;
      li.addEventListener("click", () => {
        pesquisaInput.value = contato.nome; // Atualiza o input com o nome do contato
        resultadoPesquisa.style.display = "none"; // Fecha a lista de sugestões
        headerPesquisa.style.borderRadius = "20px";
      });
      resultadoPesquisa.appendChild(li);
    });

    resultadoPesquisa.style.display = "block"; // Exibe a lista de resultados
    headerPesquisa.style.borderRadius = "20px 20px 0px 0px";
  }

  // Evento de input para filtrar e mostrar os resultados
  pesquisaInput.addEventListener("input", function () {
    const termo = pesquisaInput.value.toLowerCase();
    if (termo.length > 0) {
      const resultados = filtrarContatos(termo);
      renderizarResultados(resultados);
    } else {
      resultadoPesquisa.style.display = "none"; // Esconde a lista se o campo estiver vazio
      headerPesquisa.style.borderRadius = "20px";
    }
  });

  // Fechar a lista de resultados quando o usuário clicar fora
  document.addEventListener("click", function (event) {
    if (
      !resultadoPesquisa.contains(event.target) &&
      event.target !== pesquisaInput
    ) {
      resultadoPesquisa.style.display = "none";
      headerPesquisa.style.borderRadius = "20px";
    }
  });
});
