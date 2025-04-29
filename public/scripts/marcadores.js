document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-marcador");
  const botaoAbrir = document.querySelector(".nav-marcadores img");
  const botaoCancelar = document.getElementById("btn-cancelar-marcador");
  const botaoSalvar = document.getElementById("btn-salvar-novo-marcador");
  const input = document.getElementById("input-novo-marcador");

  botaoAbrir.addEventListener("click", () => {
    modal.style.display = "flex";
    input.value = "";
    input.focus();
  });

  botaoCancelar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  botaoSalvar.addEventListener("click", async () => {
    const nome = input.value.trim();
    if (!nome) return alert("Digite um nome de marcador.");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/marcadores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        modal.style.display = "none";
        input.value = "";
        atualizarListaMarcadores();
      } else {
        alert("Erro ao criar marcador.");
      }
    } catch (err) {
      console.error("Erro ao salvar marcador:", err);
      alert("Erro de conexão.");
    }
  });

  async function atualizarListaMarcadores() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/marcadores", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const marcadores = await res.json();
      const listaMarcadores = document.querySelector("#lista-marcadores");
      listaMarcadores.innerHTML = "";

      const marcadorAtual = decodeURIComponent(
        window.location.pathname.split("/")[2] || ""
      ).toLowerCase();

      marcadores.forEach((marcador) => {
        const li = document.createElement("li");
        li.classList.add("item-marcador");

        const a = document.createElement("a");
        a.href = `/marcadores/${encodeURIComponent(marcador)}`;
        a.textContent = marcador;
        a.classList.add("menu-marcadores", "menu-link");
        if (marcador.toLowerCase() === marcadorAtual) {
          a.classList.add("ativo");
        }

        const btnEditar = document.createElement("button");
        btnEditar.classList.add("btn-editar-marcador");
        btnEditar.title = "Editar marcador";
        btnEditar.innerHTML = `<img src="../imgs/editar.png" alt="Editar" />`;

        btnEditar.addEventListener("click", (e) => {
          e.preventDefault();
          const novoNome = prompt(
            "Digite o novo nome para o marcador:",
            marcador
          );
          if (!novoNome || novoNome === marcador) return;

          fetch(`/api/marcadores/${encodeURIComponent(marcador)}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ novoNome }),
          })
            .then((resp) => {
              if (!resp.ok) throw new Error("Erro ao renomear marcador.");
              atualizarListaMarcadores();
            })
            .catch((err) => {
              console.error(err);
              alert("Erro ao editar marcador.");
            });
        });

        const btnExcluir = document.createElement("button");
        btnExcluir.classList.add("btn-excluir-marcador");
        btnExcluir.title = "Excluir marcador";
        btnExcluir.innerHTML = `<img src="../imgs/lixeira.png" alt="Excluir" />`;

        btnExcluir.addEventListener("click", async (e) => {
          e.preventDefault();
          const confirmar = confirm(
            `Deseja realmente excluir o marcador "${marcador}"?`
          );
          if (!confirmar) return;

          try {
            const delRes = await fetch(
              `/api/marcadores/${encodeURIComponent(marcador)}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (delRes.ok) {
              atualizarListaMarcadores();
            } else {
              alert("Erro ao excluir marcador.");
            }
          } catch (err) {
            console.error("Erro ao excluir marcador:", err);
            alert("Erro de conexão.");
          }
        });

        li.appendChild(a);
        li.appendChild(btnEditar);
        li.appendChild(btnExcluir);
        listaMarcadores.appendChild(li);
      });
    } else {
      alert("Erro ao carregar marcadores.");
    }
  }

  atualizarListaMarcadores();
});
