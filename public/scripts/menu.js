document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".inicio-icon_menu");
  const nav = document.querySelector(".nav-container");

  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("oculto");
  });

  // Esconde o menu se a tela for pequena no início
  if (window.innerWidth <= 768) {
    nav.classList.add("oculto");
  }

  // Esconde/mostra dinamicamente ao redimensionar
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      nav.classList.add("oculto");
    } else {
      nav.classList.remove("oculto");
    }
  });
});
