document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem("token", data.token); // corrigido aqui
      alert("Login bem-sucedido!");
      window.location.href = "/"; // você pode trocar o caminho se quiser
    } else {
      alert("Erro ao fazer login!");
    }
  });
