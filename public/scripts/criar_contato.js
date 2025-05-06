document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-criar");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Valores
    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    console.log("Sobrenome enviado:", sobrenome); // Verifique o valor no console
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const aniversario = document.getElementById("aniversario").value;

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
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // zera hora pra comparar só datas
      if (dataSelecionada > hoje) {
        document.getElementById("erro-aniversario").textContent =
          "A data de aniversário não pode ser no futuro.";
        temErro = true;
      }
    }

    if (temErro) return;

    // Envia os dados pro backend com o token JWT
    const token = localStorage.getItem("token");

    try {
      const resposta = await fetch("/api/contatos/criar-contato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, sobrenome, telefone, email, aniversario }),
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert("Contato criado com sucesso!");
        form.reset(); // limpa os campos
      } else {
        alert(resultado.mensagem || "Erro ao salvar contato.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro de conexão com o servidor.");
    }
  });
});
