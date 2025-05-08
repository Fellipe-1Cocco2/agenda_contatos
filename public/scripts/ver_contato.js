document.addEventListener("DOMContentLoaded", async () => {
  const urlParts = window.location.pathname.split("/");
  const contatoId = urlParts[urlParts.length - 1];

  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "/login");

  try {
    const resposta = await fetch(`/api/contatos/${contatoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (resposta.status === 401) return (window.location.href = "/login");

    const contato = await resposta.json();
    if (!contato) throw new Error("Contato não encontrado");

    // Carregar foto do contato no detalhe
    const fotoContatosalvo = document.getElementById("img-contato");
    const fotoPreview = document.getElementById("foto-preview");

    fotoPreview.src = contato.fotoContato
      ? `/uploads/${contato.fotoContato}`
      : "../imgs/perfil.png";

    console.log(contato.fotoContato);
    // Se houver foto no banco de dados, exibe ela, senão usa uma foto padrão
    fotoContatosalvo.src = contato.fotoContato
      ? `/uploads/${contato.fotoContato}`
      : "../imgs/perfil.png";

    document.getElementById("nome-contato").textContent = `${
      contato.nome || ""
    } ${contato.sobrenome || ""}`.trim();
    document.getElementById("telefone-contato").textContent =
      contato.telefone || "";
    document.getElementById("email-contato").textContent = contato.email || "";
    document.getElementById("aniversario-contato").textContent =
      contato.aniversario
        ? new Date(contato.aniversario).toLocaleDateString("pt-BR")
        : "";

    carregarCheckboxesMarcadores(contato);
    configurarBotaoFavorito(contato);
    preencherFormularioEdicao(contato);
  } catch (error) {
    console.error("Erro ao carregar o contato:", error);
  }

  const btnEditar = document.getElementById("btn-editar-contato");
  const formEditar = document.getElementById("form-editar-contato");
  const infoDetalhe = document.getElementById("container-detalhe");
  const infoFotoNome = document.getElementById("container-foto-nome");
  const infoMarcadores = document.getElementById("marcadores-checkboxes");
  const infoBotoes = document.getElementById("botoes");

  btnEditar.addEventListener("click", () => {
    formEditar.style.display = "block";
    infoDetalhe.style.display = "none";
    infoFotoNome.style.display = "none";
    infoMarcadores.style.display = "none";
    infoBotoes.style.display = "none";
  });

  const editarForm = document.getElementById("editar-contato-form");
  editarForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeInput = document.getElementById("editar-nome");
    const sobrenomeInput = document.getElementById("editar-sobrenome");
    const telefoneInput = document.getElementById("editar-telefone");
    const emailInput = document.getElementById("editar-email");
    const aniversarioInput = document.getElementById("editar-aniversario");
    const fotoInput = document.getElementById("editar-foto-contato");

    const nome = nomeInput.value;
    const sobrenome = sobrenomeInput.value;
    const telefone = telefoneInput.value;
    const email = emailInput.value;
    const aniversario = aniversarioInput.value;
    const foto = fotoInput.files[0]; // Aqui pegamos a foto selecionada pelo usuário

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("sobrenome", sobrenome);
    formData.append("telefone", telefone);
    formData.append("email", email);
    formData.append("aniversario", aniversario || null);
    if (foto) formData.append("foto", foto); // Se uma nova foto for selecionada, anexamos ao formData
    console.log(foto);

    try {
      const resposta = await fetch(`/api/contatos/${contatoId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Usamos o FormData para enviar arquivos junto com os dados
      });

      if (!resposta.ok) throw new Error("Erro ao atualizar contato");

      location.reload();
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
    }
  });

  // Pré-visualização da foto
  const fotoInput = document.getElementById("editar-foto-contato");
  const fotoPreview = document.getElementById("foto-preview");

  fotoInput.addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onload = function (evento) {
        fotoPreview.src = evento.target.result;
      };
      reader.readAsDataURL(arquivo);
    }
  });
});

async function carregarCheckboxesMarcadores(contato) {
  const container = document.getElementById("marcadores-checkboxes");
  container.innerHTML = "";

  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const resposta = await fetch("/api/marcadores", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const marcadores = await resposta.json();

    marcadores.forEach((m) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `marcador-${m}`;
      checkbox.checked = contato.marcadores.includes(m);
      checkbox.addEventListener("change", () =>
        atualizarMarcadorContato(contato._id, m, checkbox.checked)
      );

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.classList = "label-marcador";
      label.textContent = m;

      const div = document.createElement("div");
      div.appendChild(checkbox);
      div.appendChild(label);
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar marcadores:", error);
  }
}

async function atualizarMarcadorContato(contatoId, marcador, adicionar) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const resposta = await fetch(`/api/contatos/${contatoId}/marcadores`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ marcador, adicionar }),
    });
    window.location.reload();
    if (resposta.status === 401) return (window.location.href = "/login");

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.mensagem || "Erro ao atualizar marcador");
    }

    const resultado = await resposta.json();
    console.log(resultado.mensagem);
  } catch (error) {
    console.error("Erro ao atualizar marcador:", error);
  }
}

function configurarBotaoFavorito(contato) {
  const btnFavorito = document.querySelector(".btn-favorito");
  const icone = btnFavorito.querySelector("img");

  const atualizarIcone = (favorito) => {
    icone.src = favorito
      ? "../imgs/estrela-cheia.png"
      : "../imgs/estrela-vazia.png";
    btnFavorito.dataset.favorito = favorito;
  };

  atualizarIcone(contato.favorito);

  btnFavorito.addEventListener("click", async () => {
    const novoStatus = btnFavorito.dataset.favorito !== "true";
    const token = localStorage.getItem("token");

    try {
      const resposta = await fetch(`/api/contatos/${contato._id}/favorito`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favorito: novoStatus }),
      });

      if (resposta.status === 401) return (window.location.href = "/login");

      if (!resposta.ok) throw new Error("Erro ao atualizar favorito");

      atualizarIcone(novoStatus);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
    }
  });
}

function preencherFormularioEdicao(contato) {
  document.getElementById("editar-nome").value = contato.nome || "";
  document.getElementById("editar-sobrenome").value = contato.sobrenome || "";
  document.getElementById("editar-telefone").value = contato.telefone || "";
  document.getElementById("editar-email").value = contato.email || "";
  document.getElementById("editar-aniversario").value = contato.aniversario
    ? new Date(contato.aniversario).toISOString().split("T")[0]
    : "";
}

document.addEventListener("DOMContentLoaded", () => {
  const btnExcluirContato = document.getElementById("btn-excluir-contato");
  const contatoId = window.location.pathname.split("/").pop();
  const token = localStorage.getItem("token");

  btnExcluirContato.addEventListener("click", async () => {
    const confirmar = confirm(
      "Tem certeza que deseja mover este contato para a lixeira?"
    );
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/contatos/${contatoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Contato movido para a lixeira.");
        window.location.href = "/"; // ou para a lista de contatos
      } else {
        alert("Erro ao mover contato para a lixeira.");
      }
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
      alert("Erro de conexão.");
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const temaAtual = localStorage.getItem("tema") || "claro";
  const btnEditarcontato = document.getElementById("img-editar-contato"); // Certifique-se de que o ID está correto
  const btnExcluircontato = document.getElementById("img-excluir-contato");

  const iconeEditarcontato =
    temaAtual === "escuro" ? "../imgs/editar-azul.png" : "../imgs/editar.png";
  btnEditarcontato.src = iconeEditarcontato; // Altera o src da imagem

  const iconeExcluircontato =
    temaAtual === "escuro" ? "../imgs/lixeira-azul.png" : "../imgs/lixeira.png";
  btnExcluircontato.src = iconeExcluircontato; // Altera o src da imagem
});
