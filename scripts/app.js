import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { definirRotas } from "./rotas.js";
import authRoutes from "./routes/authRoutes.js";
import contatoRoutes from "./routes/contatoRoutes.js";
import marcadorRoutes from "./routes/marcadorRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

console.log("Rotas sendo configuradas...");

// Rotas
definirRotas(app);
app.use("/api/auth", authRoutes);
app.use("/api/contatos", contatoRoutes);
app.use("/api/marcadores", marcadorRoutes);
app.use("/api/usuario", userRoutes);

console.log("Rotas configuradas.");

// Conexão MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar MongoDB:", err));

// Start do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
