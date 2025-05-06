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

router.delete("/:nome", autenticarUsuario, async (req, res) => {
  const { nome } = req.params;
  console.log("📌 ROTA CHAMADA — Removendo marcador:", nome);

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      console.log("❌ Usuário não encontrado.");
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    console.log("📄 Contatos antes da modificação:");
    console.dir(user.contatos, { depth: null });

    // Remover dos contatos
    user.contatos.forEach((contato, idx) => {
      if (Array.isArray(contato.marcadores)) {
        const antes = [...contato.marcadores];
        contato.marcadores = contato.marcadores.filter((m) => m !== nome);
        console.log(
          `🛠️ Contato ${idx} (${contato.nome}): de [${antes}] para [${contato.marcadores}]`
        );
      }
    });

    // Remover da lista de marcadores do usuário
    user.marcadores = user.marcadores.filter((m) => m !== nome);
    await user.save();

    console.log("✅ Após salvar:");
    console.dir(user.contatos, { depth: null });

    res.status(200).json({ mensagem: "Marcador removido com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao remover marcador:", err);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

// Rota para editar um marcador
router.patch("/:nome", autenticarUsuario, async (req, res) => {
  const { nome } = req.params; // O nome do marcador que será alterado
  const { novoNome } = req.body; // O novo nome para o marcador

  if (!novoNome) {
    return res.status(400).json({ mensagem: "Novo nome não fornecido." });
  }

  try {
    const user = await User.findById(req.userId); // Buscar o usuário autenticado

    // Verificar se o marcador existe no usuário
    const index = user.marcadores.indexOf(nome);
    if (index === -1) {
      return res.status(404).json({ mensagem: "Marcador não encontrado." });
    }

    // Atualizar o nome do marcador na lista do usuário
    user.marcadores[index] = novoNome;

    // Atualizar todos os contatos do usuário que possuem esse marcador
    user.contatos.forEach((contato) => {
      const marcadorIndex = contato.marcadores.indexOf(nome);
      if (marcadorIndex !== -1) {
        contato.marcadores[marcadorIndex] = novoNome; // Atualiza o marcador no contato
      }
    });

    // Salvar as alterações no usuário
    await user.save();

    res.json({ mensagem: "Marcador e contatos atualizados com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar marcador:", error);
    res.status(500).json({ mensagem: "Erro ao atualizar marcador." });
  }
});

// Rota para listar contatos de um marcador específico
router.get("/:nome", autenticarUsuario, async (req, res) => {
  try {
    const nomeMarcador = req.params.nome;
    const contatosFiltrados = req.user.contatos.filter(
      (contato) => contato.marcadores.includes(nomeMarcador) && !contato.lixeira
    );

    res.json(contatosFiltrados);
  } catch (error) {
    console.error("Erro ao buscar contatos do marcador:", error);
    res.status(500).json({ mensagem: "Erro ao buscar contatos do marcador." });
  }
});

export default router;
