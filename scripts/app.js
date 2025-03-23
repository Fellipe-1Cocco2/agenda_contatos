import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import VendaMensal from "./VendaMensal.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Configuração para encontrar a pasta public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// create
app.post("/vendas", async (req, res) => {
  try {
    const novaVendaMensal = await VendaMensal.create(req.body);
    res.json(novaVendaMensal);
  } catch (error) {
    res.json({ error: error });
  }
});

// Read
app.get("/vendas", async (req, res) => {
  try {
    const vendasMensais = await VendaMensal.find();
    res.json(vendasMensais);
  } catch (error) {
    res.json({ error: error });
  }
});

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

// Servir index.html ao acessar a raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`O servidor está ativo na porta ${PORT}`);
});
