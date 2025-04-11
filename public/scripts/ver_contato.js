document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const id = window.location.pathname.split("/").pop();
  const container = document.getElementById("detalhes-contato");

  if (!token) {
    alert("Você precisa estar logado!");
    window.location.href = "/login";
    return;
  }

  if (!id) {
    container.innerHTML = "<p>Contato não encontrado.</p>";
    return;
  }

  try {
    const res = await fetch("/api/contatos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contatos = await res.json();
    const contato = contatos.find((c) => c._id === id);

    if (!contato) {
      container.innerHTML = "<p>Contato não encontrado.</p>";
      return;
    }

    container.innerHTML = `
      <p><strong>Nome:</strong> ${contato.nome} ${contato.sobrenome || ""}</p>
      <p><strong>Telefone:</strong> ${contato.telefone}</p>
      <p><strong>Email:</strong> ${contato.email || "-"}</p>
      <p><strong>Aniversário:</strong> ${contato.aniversario || "-"}</p>
    `;
  } catch (err) {
    console.error("Erro ao carregar contato:", err);
    container.innerHTML = "<p>Erro ao carregar contato.</p>";
  }
});
