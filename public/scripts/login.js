// Função para remover contatos na lixeira há mais de 30 dias

async function limparLixeiraAntiga(user) {
  const agora = new Date();
  const limite = new Date(agora.setDate(agora.getDate() - 30));

  user.contatos = user.contatos.filter((contato) => {
    return !(
      contato.lixeira &&
      contato.dataRemocao &&
      new Date(contato.dataRemocao) < limite
    );
  });

  await user.save();
}

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value;

    const erroEmail = document.getElementById("erro-email");
    const erroSenha = document.getElementById("erro-senha");

    // Limpa mensagens anteriores
    erroEmail.textContent = "";
    erroSenha.textContent = "";

    let valido = true;

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
    }

    if (!valido) return;

    try {
      // >>> AQUI ALTERADO: de "/login" para "/api/auth/login"
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }), // Confirme que backend também usa "senha"
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        data = {}; // fallback vazio
      }

      if (!response.ok) {
        const mensagem = data?.message || "Email ou senha incorretos.";

        if (mensagem.toLowerCase().includes("email")) {
          erroEmail.textContent = mensagem;
        } else if (mensagem.toLowerCase().includes("senha")) {
          erroSenha.textContent = mensagem;
        } else {
          erroSenha.textContent = mensagem;
        }

        return;
      }

      // Login bem-sucedido
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/";
        await limparLixeiraAntiga(user);
      } else {
        erroSenha.textContent = "Erro: token não recebido.";
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      erroSenha.textContent = "Erro ao conectar com o servidor.";
    }
  });

document.getElementById("btn-cadastrar").addEventListener("click", () => {
  window.location.href = "/register";
});
