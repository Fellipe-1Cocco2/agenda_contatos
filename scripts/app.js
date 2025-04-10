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

// Registro de usuário
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.status(201).send("Usuário registrado com sucesso!");
});


// Login no app.js
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).send("Usuário não encontrado!");

  const isMatch = await bcrypt.compare(password, user.password);
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

// cadastro contato
app.post("/criar-contato", async (req, res) => {
  try{
    
  } catch (error){
    res.json({error: error});
  }
})

// Update
app.put("/vendas/:id", async (req, res) => {
  try {
    const novaVendaMensal = await VendaMensal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(novaVendaMensal);
  } catch (error) {
    res.json({ error: error });
  }
});

// Delete
app.delete("/vendas/:id", async (req, res) => {
  try {
    const vendaMensalExcluida = await VendaMensal.findByIdAndDelete(
      req.params.id
    );
    res.json(vendaMensalExcluida);
  } catch (error) {
    res.json({ error: error });
  }
});

app.listen(PORT, () => {
  console.log(`O servidor está ativo na porta ${PORT}`);
});
