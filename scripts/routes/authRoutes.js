import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { autenticarUsuario } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registrar novo usuário
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).send("Todos os campos são obrigatórios.");
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = new User({ nome, email, senha: hashedPassword });
    await user.save();

    res.status(201).send("Usuário registrado com sucesso!");
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).send("Erro ao registrar usuário.");
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verifica se o e-mail existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado!" });
    }

    // Verifica se a senha está correta
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(400).json({ message: "Senha incorreta!" });
    }

    // Gera o token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Retorna o token como resposta
    res.json({ token });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
  }
});

router.get("/verify", autenticarUsuario, (req, res) => {
  res.status(200).json({ authenticated: true });
});
export default router;
