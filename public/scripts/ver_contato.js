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

    document.getElementById("nome-contato").textContent =
      `${contato.nome || ""} ${contato.sobrenome || ""}`.trim();
    document.getElementById("telefone-contato").textContent = contato.telefone || "";
    document.getElementById("email-contato").textContent = contato.email || "";
    document.getElementById("aniversario-contato").textContent = contato.aniversario
      ? new Date(contato.aniversario).toLocaleDateString("pt-BR")
      : "";

    const listaMarcadoresContato = document.getElementById("lista-marcadores-contato");
    listaMarcadoresContato.innerHTML = "";
    (contato.marcadores || []).forEach((m) => {
      const li = document.createElement("li");
      li.textContent = m;
      listaMarcadoresContato.appendChild(li);
    });

    carregarCheckboxesMarcadores(contato);
    configurarBotaoFavorito(contato);
    preencherFormularioEdicao(contato);

  } catch (error) {
    console.error("Erro ao carregar o contato:", error);
  }

  const btnEditar = document.getElementById("btn-editar-contato");
  const formEditar = document.getElementById("form-editar-contato");
  btnEditar.addEventListener("click", () => {
    formEditar.style.display = "block";
  });

  const editarForm = document.getElementById("editar-contato-form");
  editarForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeInput = document.getElementById("editar-nome");
    const sobrenomeInput = document.getElementById("editar-sobrenome");
    const telefoneInput = document.getElementById("editar-telefone");
    const emailInput = document.getElementById("editar-email");
    const aniversarioInput = document.getElementById("editar-aniversario");

    const nome = nomeInput.value;
    const sobrenome = sobrenomeInput.value;
    const telefone = telefoneInput.value;
    const email = emailInput.value;
    const aniversario = aniversarioInput.value;

    try {
      const resposta = await fetch(`/api/contatos/${contatoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          sobrenome,
          telefone,
          email,
          aniversario: aniversario || null,
        }),
      });

      if (!resposta.ok) throw new Error("Erro ao atualizar contato");

      location.reload();
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
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
    icone.src = favorito ? "../imgs/estrela.png" : "../imgs/estrela-vazia.png";
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
