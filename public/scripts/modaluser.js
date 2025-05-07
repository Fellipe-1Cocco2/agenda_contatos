document.addEventListener("DOMContentLoaded", async () => {
  const btnAbrir = document.getElementById("abrir-configuracoes");
  const modal = document.getElementById("modal-configuracoes");
  const fechar = document.getElementById("fechar-modal");
  const form = document.getElementById("form-configuracoes");

  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const fotoInput = document.getElementById("foto-perfil");
  const fotoPreview = document.getElementById("foto-perfil-preview");

  btnAbrir.addEventListener("click", async () => {
    console.log("Botão de configurações clicado");
    modal.classList.remove("hidden");

    const token = localStorage.getItem("token");
    const res = await fetch("/api/usuario", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();

    console.log(user);
    nomeInput.value = user.nome;
    emailInput.value = user.email;

    fotoPreview.src = `/uploads/${user.fotoPerfil || "default.png"}`;
    console.log(user.fotoPerfil);
    console.log(user.nome);
    console.log(fotoPreview.src);
  });

  fechar.addEventListener("click", () => modal.classList.add("hidden"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const formData = new FormData(form);
    console.log(formData);
    const res = await fetch("/api/usuario", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      alert("Dados atualizados com sucesso!");
      modal.classList.add("hidden");
    } else {
      alert("Erro ao atualizar os dados.");
    }
  });

  fotoInput.addEventListener("change", () => {
    const file = fotoInput.files[0];

    if (file) {
      fotoPreview.src = URL.createObjectURL(file);
    }
  });
});

const toggleTema = document.getElementById("toggle-tema");

toggleTema.addEventListener("change", () => {
  const modoEscuro = toggleTema.checked;
  document.documentElement.setAttribute(
    "data-tema",
    modoEscuro ? "escuro" : "claro"
  );
  localStorage.setItem("tema", modoEscuro ? "escuro" : "claro");
});

// Ao carregar, verificar tema salvo
const temaSalvo = localStorage.getItem("tema") || "claro";
document.documentElement.setAttribute("data-tema", temaSalvo);
toggleTema.checked = temaSalvo === "escuro";
