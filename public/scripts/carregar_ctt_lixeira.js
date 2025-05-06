document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const container = document.querySelector(".contatos-container");
  const titulo = container.querySelector(".contatos-titulo");
  const listaLixeira = document.getElementById("lista-contatos");

  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "/login";
    return;
  }

  listaLixeira.innerHTML = "<p class='carregando-msg'>Carregando...</p>";

  try {
    const res = await fetch("/api/contatos/lixeira", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contatosLixeira = await res.json();

    // Se não houver contatos na lixeira
    if (contatosLixeira.length === 0) {
      titulo.textContent = "Lixeira (0)";
      listaLixeira.innerHTML =
        "<p class='erro-msg'>Nenhum contato na lixeira.</p>";
      return;
    }

    titulo.textContent = `Lixeira (${contatosLixeira.length})`;
    listaLixeira.innerHTML = ""; // Limpar a lista antes de adicionar os novos

    // Para cada contato na lixeira, mostrar as informações com o botão de restaurar
    contatosLixeira.forEach((contato) => {
      const divContato = document.createElement("div");
      divContato.classList.add("contato");

      const nomeContato = document.createElement("div");
      nomeContato.classList.add("contato-nome");
      nomeContato.textContent = `${contato.nome} ${contato.sobrenome}`;

      const telefoneContato = document.createElement("div");
      telefoneContato.classList.add("contato-telefone");
      telefoneContato.textContent = contato.telefone;

      const emailContato = document.createElement("div");
      emailContato.classList.add("contato-email");
      emailContato.textContent = contato.email || "-";

      const btnRestaurar = document.createElement("button");
      btnRestaurar.classList.add("btn-restaurar");
      btnRestaurar.textContent = "Restaurar";
      btnRestaurar.addEventListener("click", () =>
        restaurarContato(contato._id)
      );

      divContato.appendChild(nomeContato);
      divContato.appendChild(telefoneContato);
      divContato.appendChild(emailContato);
      divContato.appendChild(btnRestaurar);

      listaLixeira.appendChild(divContato);
    });
  } catch (err) {
    console.error("Erro ao carregar contatos da lixeira:", err);
    listaLixeira.innerHTML =
      "<p class='erro-msg'>Erro ao carregar contatos.</p>";
  }
});

// Função para restaurar o contato
async function restaurarContato(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Você precisa estar logado!");
    return;
  }

  try {
    const res = await fetch(`/api/contatos/${id}/restaurar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      alert("Contato restaurado com sucesso!");
      window.location.reload();
    } else {
      alert("Erro ao restaurar o contato.");
    }
  } catch (err) {
    console.error("Erro ao restaurar o contato:", err);
  }
}

document
  .getElementById("btn-esvaziar-lixeira")
  .addEventListener("click", async () => {
    const confirmar = confirm(
      "Tem certeza que deseja esvaziar a lixeira? Isso excluirá todos os contatos definitivamente."
    );
    if (!confirmar) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/contatos/excluir/lixeira", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao esvaziar lixeira");

      alert("Lixeira esvaziada com sucesso!");
      location.reload(); // Atualiza a página
    } catch (err) {
      console.error("Erro ao esvaziar lixeira:", err);
      alert("Erro ao esvaziar lixeira.");
    }
  });
