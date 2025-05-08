import express from "express";
import multer from "multer";
import path from "path";
import bcrypt from "bcryptjs";
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

// GET /api/usuario/contatos
router.get("/pesquisa", autenticarUsuario, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ mensagem: "Usuário não encontrado." });

    // Retorna apenas contatos que não estão na lixeira
    const contatos = user.contatos.filter((contato) => !contato.lixeira);
    res.json(contatos);
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    res.status(500).json({ mensagem: "Erro ao buscar contatos." });
  }
});

// Rota GET para carregar os dados do usuário
router.get("/", autenticarUsuario, async (req, res) => {
  const user = req.user;
  res.json({
    nome: user.nome,
    email: user.email,
    fotoPerfil: user.fotoPerfil || "default.png",
  });

  console.log(user.fotoPerfil);
});

router.put("/", autenticarUsuario, upload.single("foto"), async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const userId = req.user.id || req.user._id;

    const usuario =
      (await User.findByPk?.(userId)) || (await User.findById?.(userId));

    if (!usuario)
      return res.status(404).json({ mensagem: "Usuário não encontrado." });

    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (senha && senha.trim() !== "") {
      usuario.senha = await bcrypt.hash(senha, 10);
    }
    if (req.file) {
      usuario.fotoPerfil = req.file.filename;
    }

    await usuario.save();
    res.status(200).json({ mensagem: "Usuário atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ mensagem: "Erro interno ao atualizar o usuário." });
  }
});

export default router;
