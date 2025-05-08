import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { autenticarUsuario } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer para uploads de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

// Listar contatos (ignorar os que estão na lixeira)
router.get("/", autenticarUsuario, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const contatosVisiveis = user.contatos.filter((c) => !c.lixeira);

    res.json(contatosVisiveis);
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
    res.status(500).json({ mensagem: "Erro ao buscar contatos" });
  }
});

// Rota para buscar contatos na lixeira
router.get("/lixeira", autenticarUsuario, async (req, res) => {
  try {
    console.log("Chegou na rota GET /api/contatos/lixeira");

    const userId = req.user.id; // Supondo que o ID do usuário está disponível após a autenticação
    console.log("User ID:", userId); // Verificando o ID do usuário

    const user = await User.findById(userId);

    if (!user) {
      console.log("Usuário não encontrado");
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    console.log("Usuário encontrado:", user);

    // Filtra os contatos que estão na lixeira (campo lixeira: true)
    const contatosLixeira = user.contatos.filter((contato) => contato.lixeira);
    console.log("Contatos na lixeira:", contatosLixeira);

    return res.json(contatosLixeira);
  } catch (error) {
    console.error("Erro ao buscar contatos na lixeira:", error);
    return res
      .status(500)
      .json({ mensagem: "Erro ao buscar contatos na lixeira" });
  }
});

// Restaurar contato da lixeira
router.patch("/:id/restaurar", autenticarUsuario, async (req, res) => {
  try {
    const contato = req.user.contatos.id(req.params.id);

    if (!contato || !contato.lixeira) {
      return res
        .status(404)
        .json({ mensagem: "Contato não encontrado na lixeira." });
    }

    contato.lixeira = false;
    contato.dataRemocao = null;

    await req.user.save();
    res.status(200).json({ mensagem: "Contato restaurado com sucesso." });
  } catch (error) {
    console.error("Erro ao restaurar contato:", error);
    res.status(500).json({ mensagem: "Erro ao restaurar contato." });
  }
});

// Buscar contato específico
router.get("/:id", autenticarUsuario, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const contato = user.contatos.id(req.params.id);
    if (!contato)
      return res.status(404).json({ mensagem: "Contato não encontrado" });
    res.json(contato);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar contato." });
  }
});

// Criar contato
router.post(
  "/criar-contato",
  autenticarUsuario,
  upload.single("foto"), // Configuração do multer
  async (req, res) => {
    try {
      // Validação dos dados recebidos
      const { nome, sobrenome, telefone, email, aniversario } = req.body;
      if (!nome || !telefone || !email) {
        return res
          .status(400)
          .json({ mensagem: "Nome, telefone e email são obrigatórios." });
      }

      const foto = req.file ? req.file.filename : "default.png"; // Foto do contato (caso não tenha, usa padrão)

      const novoContato = {
        nome,
        sobrenome,
        telefone,
        email,
        aniversario,
        fotoContato: foto, // Nome do arquivo da foto
      };

      console.log("Antes do push:", req.user.contatos.length);

      req.user.contatos.push(novoContato); // Adiciona o novo contato no array de contatos do usuário

      console.log("Depois do push:", req.user.contatos.length);

      await req.user.save(); // Salva o usuário com o novo contato

      console.log("Contato salvo com sucesso");

      res.status(201).json({ mensagem: "Contato criado com sucesso!" });
    } catch (error) {
      console.error("Erro ao criar contato:", error);
      res
        .status(500)
        .json({ mensagem: "Erro ao criar contato.", erro: error.message });
    }
  }
);

// Atualizar Contato (com suporte a imagem)
router.patch(
  "/:id",
  autenticarUsuario,
  upload.single("foto"),
  async (req, res) => {
    const { id } = req.params;
    const { nome, sobrenome, telefone, email, aniversario } = req.body;
    const foto = req.file ? req.file.filename : null;

    try {
      const user = await User.findOne({ "contatos._id": id });

      if (!user) {
        return res.status(404).json({ mensagem: "Contato não encontrado." });
      }

      const contato = user.contatos.id(id);

      if (nome) contato.nome = nome;
      if (sobrenome) contato.sobrenome = sobrenome;
      if (telefone) contato.telefone = telefone;
      if (email) contato.email = email;

      if (aniversario) {
        const data = new Date(aniversario);
        if (isNaN(data)) {
          return res
            .status(400)
            .json({ mensagem: "Data de aniversário inválida." });
        }
        data.setUTCHours(12); // Corrigir timezone
        contato.aniversario = data;
      }

      if (foto) {
        contato.fotoContato = foto; // Atualiza a imagem, se houver
      }

      await user.save();

      res.json({ mensagem: "Contato atualizado com sucesso." });
    } catch (erro) {
      console.error("Erro ao atualizar contato:", erro);
      res
        .status(500)
        .json({ mensagem: "Erro ao atualizar contato", erro: erro.message });
    }
  }
);

// Exemplo usando Express.js
router.patch("/:id/favorito", autenticarUsuario, async (req, res) => {
  const contatoId = req.params.id;
  const { favorito } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ mensagem: "Usuário não encontrado" });

    const contato = user.contatos.id(contatoId);
    if (!contato) {
      return res.status(404).json({ mensagem: "Contato não encontrado" });
    }

    contato.favorito = favorito;
    await user.save();

    res.json({ mensagem: "Favorito atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar favorito:", error);
    res
      .status(500)
      .json({ mensagem: "Erro ao atualizar favorito", erro: error.message });
  }
});

router.patch("/:id/marcadores", autenticarUsuario, async (req, res) => {
  const { id } = req.params;
  const { marcador, adicionar } = req.body;

  if (typeof marcador !== "string" || typeof adicionar !== "boolean") {
    return res.status(400).json({ mensagem: "Dados inválidos" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ mensagem: "Usuário não encontrado" });

    const contato = user.contatos.id(id);
    if (!contato)
      return res.status(404).json({ mensagem: "Contato não encontrado" });

    if (adicionar && !contato.marcadores.includes(marcador)) {
      contato.marcadores.push(marcador);
    } else if (!adicionar) {
      contato.marcadores = contato.marcadores.filter((m) => m !== marcador);
    }

    await user.save();
    res.json({ mensagem: "Marcadores atualizados com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar marcadores:", error);
    res.status(500).json({ mensagem: "Erro interno ao atualizar marcadores." });
  }
});
// Excluir permanentemente um contato da lixeira
router.delete("/excluir/lixeira", autenticarUsuario, async (req, res) => {
  try {
    // Filtra e mantém apenas os contatos que NÃO estão na lixeira
    req.user.contatos = req.user.contatos.filter((contato) => !contato.lixeira);
    await req.user.save();

    res.json({ mensagem: "Lixeira esvaziada com sucesso." });
  } catch (error) {
    console.error("Erro ao esvaziar lixeira:", error);
    res.status(500).json({ mensagem: "Erro ao esvaziar lixeira." });
  }
});

// Mover contato para a lixeira
router.delete("/:id", autenticarUsuario, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.userId);
    const contato = user.contatos.id(id);

    if (!contato) {
      return res.status(404).json({ mensagem: "Contato não encontrado." });
    }

    // Marcar como excluído (lixeira)
    contato.lixeira = true;
    contato.dataRemocao = new Date();

    // Remover marcadores e favorito
    contato.favorito = false;
    contato.marcadores = [];

    await user.save();

    res.status(200).json({ mensagem: "Contato movido para a lixeira." });
  } catch (err) {
    console.error("Erro ao mover para a lixeira:", err);
    res.status(500).json({ mensagem: "Erro ao mover para a lixeira." });
  }
});

export default router;
