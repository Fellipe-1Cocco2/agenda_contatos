document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value; // alterado aqui

    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }), // alterado aqui também
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login bem-sucedido!");
      window.location.href = "/";
    } else {
      alert("Erro ao fazer login!");
    }
  });

document.getElementById("btn-cadastrar").addEventListener("click", () => {
  window.location.href = "/register";
});
