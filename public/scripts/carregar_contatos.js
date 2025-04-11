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

    const contatos = await res.json();

    titulo.textContent = `Contatos (${contatos.length})`;
    listaContatos.innerHTML = "";

    contatos.forEach((contato) => {
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
