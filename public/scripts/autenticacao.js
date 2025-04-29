async function verificarAutenticacao() {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log("Sem token, redirecionando para login...");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn("Token inválido ou expirado, removendo token...");
        localStorage.removeItem('token');
        window.location.href = "/login";
      } else {
        console.log("Usuário autenticado!");
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      localStorage.removeItem('token');
      window.location.href = "/login";
    }
  }

  verificarAutenticacao();