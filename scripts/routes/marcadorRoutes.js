import express from "express";
import { autenticarUsuario } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Buscar marcadores
router.get("/", autenticarUsuario, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user.marcadores || []);
});

// Criar marcador
router.post("/", autenticarUsuario, async (req, res) => {
  const { nome } = req.body;

  if (!nome || typeof nome !== "string" || !nome.trim()) {
    return res.status(400).json({ mensagem: "Nome inválido." });
  }

  const user = await User.findById(req.userId);

  if (user.marcadores.includes(nome.trim())) {
    return res.status(400).json({ mensagem: "Marcador já existe." });
  }

  user.marcadores.push(nome.trim());
  await user.save();

  res.status(201).json({ mensagem: "Marcador criado com sucesso!" });
});

// Deletar marcador
router.delete("/:nome", autenticarUsuario, async (req, res) => {
  const { nome } = req.params;

  const user = await User.findById(req.userId);

  const index = user.marcadores.findIndex((m) => m === nome);
  if (index === -1) {
    return res.status(404).json({ mensagem: "Marcador não encontrado." });
  }

  user.marcadores.splice(index, 1);
  await user.save();

  res.json({ mensagem: "Marcador excluído com sucesso!" });
});


export default router;
