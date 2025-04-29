document.addEventListener("DOMContentLoaded", function () {
  const contatoId = window.location.pathname.split("/")[2];

  function carregarDetalhesContato(id) {
    const token = localStorage.getItem("token"); // Recuperando o token

    console.log("Token enviado:", token); // Verificando se o token está correto

    fetch(`/api/contatos/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,  // Enviando o token
      },
    })
      .then((response) => {
        console.log("Resposta da requisição:", response); // Verifique o status da resposta
        return response.json();
      })
      .then((data) => {
        if (data) {
          const nomeCompleto = `${data.nome} ${data.sobrenome}`;
          const nomeElemento = document.getElementById("nome-contato");
          nomeElemento.textContent = nomeCompleto;

          document.getElementById("telefone-contato").textContent = data.telefone || "Não disponível";
          document.getElementById("email-contato").textContent = data.email || "Não disponível";
          document.getElementById("aniversario-contato").textContent = data.aniversario || "Não disponível";

          const listaMarcadores = document.getElementById("lista-marcadores-contato");
          listaMarcadores.innerHTML = "";
          if (data.marcadores && data.marcadores.length > 0) {
            data.marcadores.forEach((marcador) => {
              const li = document.createElement("li");
              li.textContent = typeof marcador === "string" ? marcador : marcador?.nome || "(sem nome)";
              listaMarcadores.appendChild(li);
            });
          } else {
            const li = document.createElement("li");
            li.textContent = "Nenhum marcador vinculado.";
            listaMarcadores.appendChild(li);
          }

          const botaoFavorito = document.querySelector(".btn-favorito");
          botaoFavorito.innerHTML = `<img src="${data.favorito ? "../imgs/estrela-cheia.png" : "../imgs/estrela-vazia.png"}" alt="Favorito" />`;
          botaoFavorito.setAttribute("id", id);
          botaoFavorito.setAttribute("data-favorito", data.favorito || false);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar detalhes do contato:", error);
      });
  }

  carregarDetalhesContato(contatoId);

  document.getElementById("btn-editar-contato").addEventListener("click", function () {
    document.getElementById("detalhes-contato-info").style.display = "none";
    document.getElementById("form-editar-contato").style.display = "block";

    document.getElementById("editar-nome").value = document.getElementById("nome-contato").textContent.split(" ")[0];
    document.getElementById("editar-sobrenome").value = document.getElementById("nome-contato").textContent.split(" ")[1];
    document.getElementById("editar-telefone").value = document.getElementById("telefone-contato").textContent;
    document.getElementById("editar-email").value = document.getElementById("email-contato").textContent;
    document.getElementById("editar-aniversario").value = document.getElementById("aniversario-contato").textContent;
  });

  document.getElementById("editar-contato-form").addEventListener("submit", function (e) {
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

  document.querySelector(".btn-favorito").addEventListener("click", toggleFavorito);
});

function toggleFavorito(e) {
  const btn = e.currentTarget;
  const contatoId = btn.id;
  const atual = btn.dataset.favorito === "true";
  const proximo = !atual;

  btn.dataset.favorito = proximo;
  const img = btn.querySelector("img");
  img.src = proximo ? "../imgs/estrela-cheia.png" : "../imgs/estrela-vazia.png";

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
    btn.dataset.favorito = atual;
    img.src = atual ? "../imgs/estrela-cheia.png" : "../imgs/estrela-vazia.png";
  });
}
