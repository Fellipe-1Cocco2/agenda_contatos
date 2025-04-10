import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
let usuarioLogado = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function setUsuarioLogado(user) {
  usuarioLogado = user;
}

export function definirRotas(app) {
  // Servir index.html ao acessar a raiz
  app.get("/", (req, res) => {
    if (!usuarioLogado) {
      return res.redirect("/login");
    }
    process.stdout.write("Usuário logado: " + usuarioLogado.email + "\n");
    process.stdout.write("rota acessada /\n");
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  // Rota login
  app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/login.html"));
  });

  // Rota favoritos
  app.get("/favoritos", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/favoritos.html"));
  });

  // Rota lixeira
  app.get("/lixeira", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/lixeira.html"));
  });

  // Rota Criar Contato
  app.get("/criar-contato", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/pages/criar_contato.html"));
  });
}
