document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const container = document.querySelector(".contatos-container");
  const titulo = container.querySelector(".contatos-titulo");
  const listaContatos = document.getElementById("lista-contatos");

  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "/login";
    return;
  }

  listaContatos.innerHTML = "<p class='carregando-msg'>Carregando...</p>";

  try {
    const res = await fetch("/api/contatos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const todosContatos = await res.json();

    // Filtra apenas os contatos marcados como favoritos
    const favoritos = todosContatos.filter(
      (contato) => contato.favorito === true
    );

    titulo.textContent = `Favoritos (${favoritos.length})`;
    listaContatos.innerHTML = "";

    favoritos.forEach((contato) => {
      const link = document.createElement("a");
      link.href = `/contato/${contato._id}`;
      link.classList.add("contato-item-link");

      link.innerHTML = `
        <div class="contato-nome">${contato.nome}</div>
        <div class="contato-telefone">${contato.telefone}</div>
        <div class="contato-email">${contato.email || "-"}</div>
      `;

      listaContatos.appendChild(link);
    });
  } catch (err) {
    console.error("Erro ao carregar contatos:", err);
    listaContatos.innerHTML =
      "<p class='erro-msg'>Erro ao carregar contatos.</p>";
  }
});
