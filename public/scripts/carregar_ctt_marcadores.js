document.addEventListener("DOMContentLoaded", async () => {
  const marcador = window.location.pathname.split("/")[2]; // Pega o marcador da URL
  const token = localStorage.getItem("token");

  const container = document.querySelector(".contatos-container");
  const titulo = container.querySelector(".contatos-titulo");
  const listaContatos = document.getElementById("lista-contatos");

  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "/login";
    return;
  }

  // Atualiza o título da aba do navegador
  document.title = `${
    marcador.charAt(0).toUpperCase() + marcador.slice(1)
  } - Meus Contatos`;

  // Marca o item de menu ativo
  const linksMenu = document.querySelectorAll(".menu-link");
  linksMenu.forEach((link) => {
    const hrefMarcador = link
      .getAttribute("href")
      .split("/")
      .pop()
      .toLowerCase();
    if (hrefMarcador === marcador.toLowerCase()) {
      link.classList.add("ativo");
    } else {
      link.classList.remove("ativo");
    }
  });

  listaContatos.innerHTML = "<p class='carregando-msg'>Carregando...</p>";

  try {
    const res = await fetch(`/api/marcadores/${encodeURIComponent(marcador)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const contatos = await res.json();

      titulo.textContent = `${
        marcador.charAt(0).toUpperCase() + marcador.slice(1)
      } (${contatos.length})`;
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
    } else {
      titulo.textContent = `${
        marcador.charAt(0).toUpperCase() + marcador.slice(1)
      } (0)`;
      listaContatos.innerHTML =
        "<p class='erro-msg'>Erro ao carregar contatos.</p>";
    }
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
    titulo.textContent = `${
      marcador.charAt(0).toUpperCase() + marcador.slice(1)
    } (0)`;
    listaContatos.innerHTML =
      "<p class='erro-msg'>Erro ao carregar contatos.</p>";
  }
});
