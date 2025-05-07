document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/usuario", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await res.json();
  console.log(user);
  const fotoPreview = document.getElementById("img-perfil");
  fotoPreview.src = `/uploads/${user.fotoPerfil || "default.png"}`;
});
