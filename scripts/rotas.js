import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { autenticarUsuario } from "./middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function definirRotas(app) {
  app.get("/login", (req, res) => {
    console.log("Acessando rota /login");
    res.sendFile(path.join(__dirname, "../public/pages/login.html"));
  });

  app.get("/", (req, res) => {
    console.log("Acessando rota / (principal) sem autenticação.");
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  app.get("/favoritos", (req, res) => {
    console.log("Acessando rota /favoritos - deve passar pela autenticação");
    res.sendFile(path.join(__dirname, "../public/pages/favoritos.html"));
  });

  app.get("/lixeira", (req, res) => {
    console.log("Acessando rota /lixeira - deve passar pela autenticação");
    res.sendFile(path.join(__dirname, "../public/pages/lixeira.html"));
  });

  app.get("/criar-contato", (req, res) => {
    console.log("Acessando rota /criar-contato - deve passar pela autenticação");
    res.sendFile(path.join(__dirname, "../public/pages/criar_contato.html"));
  });

  app.get("/contato/:id", (req, res) => {
    console.log("Acessando rota /contato/:id");
    res.sendFile(path.join(__dirname, "../public/pages/contato.html"));
  });

  app.get("/admin", autenticarUsuario, (req, res) => {
    console.log("Acessando rota /admin - deve passar pela autenticação");
    res.sendFile(path.join(__dirname, "../public/pages/admin.html"));
  });
}
