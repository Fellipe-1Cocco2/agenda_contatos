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
const iconeMenu = document.getElementById("inicio-icon_menu");
const iconeConfig = document.getElementById("confg_perfil-icon_config");
const iconeMais = document.getElementById("link-criar_contato-img");
const iconeMarcadores = document.getElementById("marcadores-icon");
const iconeContatos = document.getElementById("menu-contatos");
const iconeFavoritos = document.getElementById("icon-fav");
const iconeLixeira = document.getElementById("menu-lixeira");
const iconeEditarcontato = document.getElementById("btn-editar-contato");

function atualizarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  localStorage.setItem("tema", tema);
  toggleTema.checked = tema === "escuro";

  // Atualiza o ícone de acordo com o tema
  if (tema === "escuro") {
    iconeMenu.src = "../imgs/menu-azul.png";
    iconeConfig.src = "../imgs/configuracao-azul.png";
    iconeMais.src = "../imgs/mais-azul.png";
    iconeContatos.src = "../imgs/contato-azul.png";
    iconeFavoritos.src = "../imgs/estrela-azul.png";
    iconeLixeira.src = "../imgs/lixeira-azul.png";
    iconeMarcadores.src = "../imgs/mais-azul.png";
  } else {
    iconeMenu.src = "../imgs/menu-aberto.png";
    iconeConfig.src = "../imgs/configuracoes.png";
    iconeMais.src = "../imgs/mais.png";
    iconeContatos.src = "../imgs/contato.png";
    iconeFavoritos.src = "../imgs/estrela.png";
    iconeLixeira.src = "../imgs/lixeira.png";
    iconeMarcadores.src = "../imgs/mais.png";
  }
}

toggleTema.addEventListener("change", () => {
  const tema = toggleTema.checked ? "escuro" : "claro";
  atualizarTema(tema);
});

// Ao carregar, verificar tema salvo
const temaSalvo = localStorage.getItem("tema") || "claro";
atualizarTema(temaSalvo);

