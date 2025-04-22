import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./User.js";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { definirRotas, setUsuarioLogado } from "./rotas.js";
import { autenticarUsuario } from "./authMiddleware.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Configuração para encontrar a pasta public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

definirRotas(app);

app.use(express.static(path.join(__dirname, "../public"))); // Ajustado para a nova pasta

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("conectado ao MongoDB");
  } catch (error) {
    console.log("erro ao conectar MongoDB ", error);
  }
};

connectDB();

app.post("/register", async (req, res) => {
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

// Login no app.js
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).send("Usuário não encontrado!");

  const isMatch = await bcrypt.compare(senha, user.senha);
  if (!isMatch) return res.status(400).send("Senha incorreta!");

  // Salva usuário logado usando função exportada
  setUsuarioLogado(user);

  const token = jwt.sign({ userId: user._id }, "secretkey", {
    expiresIn: "1h",
  });

  res.json({ token });
});

// Read
app.get("/user", async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (error) {
    res.json({ error: error });
  }
});

app.listen(PORT, () => {
  console.log(`O servidor está ativo na porta ${PORT}`);
});

// Rota protegida - buscar contatos
app.get("/api/contatos", autenticarUsuario, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
  res.json(user.contatos); // <-- aqui deve ser um array
});

// Rota para obter detalhes de um contato específico
app.get("/api/contatos/:id", autenticarUsuario, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const contato = user.contatos.id(req.params.id);
    if (!contato) {
      return res.status(404).json({ message: "Contato não encontrado." });
    }

    res.json(contato);
  } catch (error) {
    console.error("Erro ao buscar contato:", error);
    res.status(500).json({ message: "Erro ao buscar contato." });
  }
});

// Rota para editar um contato específico
app.put("/editar-contato/:id", autenticarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, sobrenome, telefone, email, aniversario } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const contato = user.contatos.id(id);
    if (!contato) {
      return res.status(404).json({ message: "Contato não encontrado." });
    }

    // Atualiza os dados do contato
    contato.nome = nome || contato.nome;
    contato.sobrenome = sobrenome || contato.sobrenome;
    contato.telefone = telefone || contato.telefone;
    contato.email = email || contato.email;
    contato.aniversario = aniversario || contato.aniversario;

    // Salva as mudanças no usuário
    await user.save();

    res.json({ mensagem: "Contato atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar contato:", error);
    res.status(500).json({ message: "Erro ao atualizar contato." });
  }
});

// Rota para deletar um contato específico
app.delete("/deletar-contato/:id", autenticarUsuario, async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID do contato que será deletado

    // Encontra o usuário logado
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    // Encontra o contato pelo ID e o remove
    const contato = user.contatos.id(id);
    if (!contato) {
      return res.status(404).json({ mensagem: "Contato não encontrado." });
    }

    // Remove o contato da lista de contatos do usuário
    contato.remove();

    // Salva as alterações no banco de dados
    await user.save();

    res.json({ mensagem: "Contato deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar contato:", error);
    res.status(500).json({ mensagem: "Erro ao deletar contato." });
  }
});

// cadastro contato
app.post("/criar-contato", autenticarUsuario, async (req, res) => {
  try {
    const { nome, sobrenome, telefone, email, aniversario } = req.body;

    const novoContato = {
      nome,
      sobrenome,
      telefone,
      email,
      aniversario,
    };

    // Verifique se req.user está preenchido corretamente
    if (!req.user) {
      console.error("Usuário não encontrado no request");
      return res.status(401).json({ mensagem: "Usuário não autenticado" });
    }

    // Adiciona o contato na lista do usuário logado
    req.user.contatos.push(novoContato);
    await req.user.save();

    res.status(201).json({ mensagem: "Contato salvo com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar contato:", error); // Logs detalhados para depuração
    res.status(500).json({ mensagem: "Erro ao salvar contato." });
  }
});

// Rota para marcar/desmarcar contato como favorito
app.put("/favoritar-contato/:id", autenticarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const { favorito } = req.body; // Espera um valor booleano para marcar ou desmarcar

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const contato = user.contatos.id(id);
    if (!contato) {
      return res.status(404).json({ mensagem: "Contato não encontrado." });
    }

    // Atualiza o status de favorito
    contato.favorito = favorito;

    // Salva as mudanças no banco de dados
    await user.save();

    res.json({ mensagem: "Status de favorito atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar favorito:", error);
    res.status(500).json({ mensagem: "Erro ao atualizar favorito." });
  }
});
