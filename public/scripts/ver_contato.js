document.addEventListener("DOMContentLoaded", function () {
  const contatoId = window.location.pathname.split("/")[2];

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
          const nomeElemento = document.getElementById("nome-contato");
          nomeElemento.textContent = nomeCompleto;

          document.getElementById("telefone-contato").textContent =
            data.telefone;
          document.getElementById("email-contato").textContent =
            data.email || "";
          document.getElementById("aniversario-contato").textContent =
            data.aniversario || "";

          const listaMarcadores = document.getElementById(
            "lista-marcadores-contato"
          );
          listaMarcadores.innerHTML = "";
          if (data.marcadores && data.marcadores.length > 0) {
            data.marcadores.forEach((marcador) => {
              const li = document.createElement("li");
              li.textContent =
                typeof marcador === "string"
                  ? marcador
                  : marcador?.nome || "(sem nome)";
              listaMarcadores.appendChild(li);
            });
          } else {
            const li = document.createElement("li");
            li.textContent = "Nenhum marcador vinculado.";
            listaMarcadores.appendChild(li);
          }

          const botaoFavorito = document.querySelector(".btn-favorito");
          botaoFavorito.innerHTML = `<img src="${
            data.favorito
              ? "../imgs/estrela-cheia.png"
              : "../imgs/estrela-vazia.png"
          }" alt="Favorito" />`;
          botaoFavorito.setAttribute("id", id);
          botaoFavorito.setAttribute("data-favorito", data.favorito || false);

          fetch(`/marcadores`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((res) => res.json())
            .then((marcadores) => {
              const containerMarcadores = document.getElementById(
                "marcadores-checkboxes"
              );
              containerMarcadores.innerHTML = "";
              marcadores.forEach((marcadorNome) => {
                const label = document.createElement("label");
                label.style.display = "block";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = marcadorNome;
                checkbox.checked = data.marcadores?.some((m) => {
                  if (!m) return false;
                  const nomeMarcador = typeof m === "string" ? m : m?.nome;
                  return nomeMarcador === marcadorNome;
                });

                checkbox.addEventListener("change", () => {
                  const marcadorPayload = marcadorNome?.toString?.();
                  if (!marcadorPayload) {
                    console.error("Marcador inválido para envio.");
                    alert("Erro: Marcador inválido.");
                    return;
                  }

                  fetch(`/vincular-marcador/${id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                      marcadorId: marcadorPayload,
                      vincular: checkbox.checked,
                    }),
                  })
                    .then(() => location.reload())
                    .catch((err) => {
                      console.error("Erro ao atualizar marcador:", err);
                      alert("Erro ao atualizar marcador.");
                    });
                });

                label.appendChild(checkbox);
                label.append(` ${marcadorNome}`);
                containerMarcadores.appendChild(label);
              });
            });
        }
      })
      .catch((error) =>
        console.error("Erro ao carregar detalhes do contato:", error)
      );
  }

  carregarDetalhesContato(contatoId);

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

  document
    .querySelector(".btn-favorito")
    .addEventListener("click", toggleFavorito);
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
