document.addEventListener("DOMContentLoaded", function () {
  const contatoId = window.location.pathname.split("/")[2]; // Obtém o ID do contato da URL

  // Função para carregar os detalhes do contato
  function carregarDetalhesContato(id) {
    fetch(`/api/contatos/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          const nomeCompleto = `${data.nome} ${data.sobrenome}`;
          document.getElementById("nome-contato").textContent = nomeCompleto;
          document.getElementById("telefone-contato").textContent =
            data.telefone;
          document.getElementById("email-contato").textContent =
            data.email || "";
          document.getElementById("aniversario-contato").textContent =
            data.aniversario || "";

          // Adiciona botão de favorito
          const estrela = data.favorito ? "⭐" : "☆";
          const botaoFavorito = document.createElement("button");
          botaoFavorito.className = "btn-favorito";
          botaoFavorito.textContent = estrela;
          botaoFavorito.setAttribute("data-id", id);
          botaoFavorito.setAttribute("data-favorito", data.favorito || false);

          const nomeElemento = document.getElementById("nome-contato");
          nomeElemento.appendChild(botaoFavorito);
        }
      })
      .catch((error) =>
        console.error("Erro ao carregar detalhes do contato:", error)
      );
  }

  // Carregar os detalhes do contato ao carregar a página
  carregarDetalhesContato(contatoId);

  // Mostrar formulário de edição
  document
    .getElementById("btn-editar-contato")
    .addEventListener("click", function () {
      document.getElementById("detalhes-contato-info").style.display = "none";
      document.getElementById("form-editar-contato").style.display = "block";

      document.getElementById("editar-nome").value = document
        .getElementById("nome-contato")
        .textContent.split(" ")[0];
      document.getElementById("editar-sobrenome").value = document
        .getElementById("nome-contato")
        .textContent.split(" ")[1];
      document.getElementById("editar-telefone").value =
        document.getElementById("telefone-contato").textContent;
      document.getElementById("editar-email").value =
        document.getElementById("email-contato").textContent;
      document.getElementById("editar-aniversario").value =
        document.getElementById("aniversario-contato").textContent;
    });

  // Submeter o formulário de edição
  document
    .getElementById("editar-contato-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const updatedContato = {
        nome: document.getElementById("editar-nome").value,
        sobrenome: document.getElementById("editar-sobrenome").value,
        telefone: document.getElementById("editar-telefone").value,
        email: document.getElementById("editar-email").value,
        aniversario: document.getElementById("editar-aniversario").value,
      };

      fetch(`/editar-contato/${contatoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedContato),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data.mensagem) {
            alert(data.mensagem);
            window.location.href = `/contato/${contatoId}`;
          }
        })
        .catch((error) => {
          console.error("Erro ao atualizar contato:", error.message);
          alert("Ocorreu um erro ao atualizar o contato.");
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
  // 1) carrega os dados do contato e inicializa o botão
  carregarDetalhes();

  // 2) instancia o listener de favoritar
  document
    .querySelector(".btn-favorito")
    .addEventListener("click", toggleFavorito);
});

function carregarDetalhes() {
  // pega o ID da URL (ex: /contato/605c3f2e...)
  const partes = window.location.pathname.split("/");
  const contatoId = partes[partes.length - 1];

  fetch(`/api/contatos/${contatoId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((res) => res.json())
    .then((contato) => {
      // preenche os campos
      document.getElementById("nome-contato").textContent =
        contato.nome + " " + contato.sobrenome;
      document.getElementById("telefone-contato").textContent =
        contato.telefone;
      document.getElementById("email-contato").textContent =
        contato.email || "—";
      document.getElementById("aniversario-contato").textContent =
        contato.aniversario
          ? new Date(contato.aniversario).toLocaleDateString()
          : "—";

      // configura o botão existente:
      const btn = document.querySelector(".btn-favorito");
      btn.id = contato._id; // usa o id do Mongo no atributo id
      btn.dataset.favorito = contato.favorito; // true ou false
      const img = btn.querySelector("img");
      img.src = contato.favorito
        ? "../imgs/estrela-cheia.png"
        : "../imgs/estrela-vazia.png";
    })
    .catch((err) => console.error("Erro ao carregar contato", err));
}

function toggleFavorito(e) {
  const btn = e.currentTarget;
  const contatoId = btn.id; // recupera o id que você já atribuiu
  const atual = btn.dataset.favorito === "true";
  const proximo = !atual;

  // atualiza visual
  btn.dataset.favorito = proximo;
  const img = btn.querySelector("img");
  img.src = proximo ? "../imgs/estrela-cheia.png" : "../imgs/estrela-vazia.png";

  // persiste no backend
  fetch(`/favoritar-contato/${contatoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ favorito: proximo }),
  }).catch((err) => {
    console.error("Erro ao favoritar:", err);
    alert("Não foi possível atualizar o favorito.");
    // reverte visual em caso de falha
    btn.dataset.favorito = atual;
    img.src = atual ? "../imgs/estrela-cheia.png" : "../imgs/estrela-vazia.png";
  });
}
