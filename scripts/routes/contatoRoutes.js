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

// Atualizar Contato
router.patch("/:id", autenticarUsuario, async (req, res) => {
  const { id } = req.params;
  const { nome, sobrenome, telefone, email, aniversario } = req.body;

  try {
    // Verifica se o ID é válido
    const contato = await User.findOne({ "contatos._id": id });

    if (!contato) {
      return res.status(404).json({ mensagem: "Contato não encontrado." });
    }

    const contatoAtualizado = contato.contatos.id(id);

    if (nome) contatoAtualizado.nome = nome;
    if (sobrenome) contatoAtualizado.sobrenome = sobrenome;
    if (telefone) contatoAtualizado.telefone = telefone;
    if (email) contatoAtualizado.email = email;

    // Trata o aniversário
    if (aniversario) {
      const data = new Date(aniversario);
      if (isNaN(data)) {
        return res.status(400).json({ mensagem: "Data de aniversário inválida." });
      }
      // Corrige para UTC para evitar erro de fuso horário
      data.setUTCHours(12); 
      contatoAtualizado.aniversario = data;
    }

    await contato.save();
    res.json({ mensagem: "Contato atualizado com sucesso." });

  } catch (erro) {
    console.error("Erro ao atualizar contato:", erro);
    res.status(500).json({ mensagem: "Erro ao atualizar contato", erro: erro.message });
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

// Exemplo usando Express.js
router.patch("api/contatos/:id/favorito", autenticarUsuario, async (req, res) => {
  const contatoId = req.params.id;
  const { favorito } = req.body;

  try {
    const contato = await Contato.findById(contatoId);
    if (!contato) {
      return res.status(404).json({ mensagem: "Contato não encontrado" });
    }

    contato.favorito = favorito;
    await contato.save();

    res.json({ mensagem: "Favorito atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao atualizar favorito", erro: error.message });
  }
});

// Atualizar marcadores de um contato
router.patch("/:id/marcadores", autenticarUsuario, async (req, res) => {
  const { id } = req.params;
  const { marcadores } = req.body;

  if (!Array.isArray(marcadores)) {
    return res.status(400).json({ mensagem: "Marcadores devem ser um array." });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const contato = user.contatos.id(id);
    if (!contato) {
      return res.status(404).json({ mensagem: "Contato não encontrado." });
    }

    contato.marcadores = marcadores;
    await user.save();

    res.json({ mensagem: "Marcadores atualizados com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar marcadores:", error);
    res.status(500).json({ mensagem: "Erro interno ao atualizar marcadores." });
  }
});

router.get('/api/contatos/:id', async (req, res) => {
  const contato = await Contato.findById(req.params.id);
  if (!contato) {
    return res.status(404).json({ mensagem: 'Contato não encontrado' });
  }
  res.json(contato);
});


export default router;
