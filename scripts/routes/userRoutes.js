import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { autenticarUsuario } from "../middleware/authMiddleware.js";

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

// Rota GET para carregar os dados do usuário
router.get("/", autenticarUsuario, async (req, res) => {
  const user = req.user;
  res.json({
    nome: user.nome,
    email: user.email,
    foto: user.foto || "default.png",
  });
});

// Rota PUT para atualizar dados do usuário
router.put("/", autenticarUsuario, upload.single("foto"), async (req, res) => {
  try {
    const user = req.user;
    const { nome, email, senha } = req.body;

    if (nome) user.nome = nome;
    if (email) user.email = email;
    if (senha) user.senha = senha;
    if (req.file) user.foto = req.file.filename;

    await user.save();
    res.status(200).json({ mensagem: "Usuário atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ mensagem: "Erro interno ao atualizar o usuário." });
  }
});

export default router;
