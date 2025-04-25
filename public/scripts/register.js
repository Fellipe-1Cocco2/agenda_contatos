document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  // Spans de erro
  const erroNome = document.getElementById("erro-nome");
  const erroEmail = document.getElementById("erro-email");
  const erroSenha = document.getElementById("erro-senha");

  // Limpa mensagens anteriores
  erroNome.textContent = "";
  erroEmail.textContent = "";
  erroSenha.textContent = "";

  let valido = true;

  // Validações
  if (nome === "") {
    erroNome.textContent = "O nome é obrigatório.";
    valido = false;
  }

  if (email === "") {
    erroEmail.textContent = "O e-mail é obrigatório.";
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erroEmail.textContent = "Informe um e-mail válido.";
    valido = false;
  }

  if (senha === "") {
    erroSenha.textContent = "A senha é obrigatória.";
    valido = false;
  } else if (senha.length < 6) {
    erroSenha.textContent = "A senha deve ter no mínimo 6 caracteres.";
    valido = false;
  }

  if (!valido) return;

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha }),
    });

    const text = await response.text();
    alert(text);

    if (response.ok) {
      window.location.href = "/login";
    }
  } catch (error) {
    alert("Erro ao registrar. Tente novamente mais tarde.");
    console.error(error);
  }
});
