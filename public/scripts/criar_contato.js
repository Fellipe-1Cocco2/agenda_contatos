document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-criar");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Campos
    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const aniversario = document.getElementById("aniversario").value;
    const inputFoto = document.getElementById("foto-contato");

    // Limpa erros
    document.querySelectorAll(".erro").forEach((el) => (el.textContent = ""));

    let temErro = false;

    // Validações
    if (!nome) {
      document.getElementById("erro-nome").textContent =
        "O nome é obrigatório.";
      temErro = true;
    }

    if (!sobrenome) {
      document.getElementById("erro-sobrenome").textContent =
        "O sobrenome é obrigatório.";
      temErro = true;
    }

    if (!telefone) {
      document.getElementById("erro-telefone").textContent =
        "O telefone é obrigatório.";
      temErro = true;
    } else if (telefone.length < 8 || !/^\d+$/.test(telefone)) {
      document.getElementById("erro-telefone").textContent =
        "Digite um telefone válido com ao menos 8 dígitos.";
      temErro = true;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("erro-email").textContent = "E-mail inválido.";
      temErro = true;
    }

    if (aniversario) {
      const dataSelecionada = new Date(aniversario);
      if (isNaN(dataSelecionada)) {
        document.getElementById("erro-aniversario").textContent =
          "Data de aniversário inválida.";
        temErro = true;
      } else {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataSelecionada > hoje) {
          document.getElementById("erro-aniversario").textContent =
            "A data de aniversário não pode ser no futuro.";
          temErro = true;
        }
      }
    }

    if (temErro) return;

    const token = localStorage.getItem("token");

    // Monta FormData
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("sobrenome", sobrenome);
    formData.append("telefone", telefone);
    formData.append("email", email);
    formData.append("aniversario", aniversario);

    if (inputFoto && inputFoto.files.length > 0) {
      const foto = inputFoto.files[0];
      const tiposValidos = ["image/jpeg", "image/png", "image/gif"];
      if (!tiposValidos.includes(foto.type)) {
        document.getElementById("erro-foto").textContent =
          "Formato de foto inválido.";
        temErro = true;
      } else {
        formData.append("foto", foto);
      }
    }

    if (temErro) return;

    try {
      const resposta = await fetch("/api/contatos/criar-contato", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert("Contato criado com sucesso!");
        window.location.reload();
        form.reset();
      } else {
        alert(resultado.mensagem || "Erro ao salvar contato.");
        console.error("Erro no servidor:", resultado);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro de conexão com o servidor.");
    }
  });

  const fotoInput = document.getElementById("foto-contato");
  const fotoPreview = document.getElementById("preview-imagem-contato");

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
