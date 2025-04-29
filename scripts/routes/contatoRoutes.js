import express from "express";
import { autenticarUsuario } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Buscar contatos
router.get("/", autenticarUsuario, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });
  res.json(user.contatos);
});

// Buscar contato específico
router.get("/:id", autenticarUsuario, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const contato = user.contatos.id(req.params.id);
    if (!contato) return res.status(404).json({ mensagem: "Contato não encontrado" });
    res.json(contato);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar contato." });
  }
});

// Criar contato
router.post("/", autenticarUsuario, async (req, res) => {
  try {
    const { nome, sobrenome, telefone, email, aniversario } = req.body;
    const novoContato = { nome, sobrenome, telefone, email, aniversario };
    req.user.contatos.push(novoContato);
    await req.user.save();
    res.status(201).json({ mensagem: "Contato criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao criar contato." });
  }
});

// Editar contato
router.put("/:id", autenticarUsuario, async (req, res) => {
  try {
    const contato = req.user.contatos.id(req.params.id);
    if (!contato) return res.status(404).json({ mensagem: "Contato não encontrado" });

    Object.assign(contato, req.body);
    await req.user.save();

    res.json({ mensagem: "Contato atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao atualizar contato." });
  }
});

// Deletar contato
router.delete("/:id", autenticarUsuario, async (req, res) => {
  try {
    const contato = req.user.contatos.id(req.params.id);
    if (!contato) return res.status(404).json({ mensagem: "Contato não encontrado" });

    contato.remove();
    await req.user.save();

    res.json({ mensagem: "Contato deletado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao deletar contato." });
  }
});

export default router;
