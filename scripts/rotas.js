import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function definirRotas(app) {
  // Servir index.html ao acessar a raiz
  app.get("/", (req, res) => {
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
