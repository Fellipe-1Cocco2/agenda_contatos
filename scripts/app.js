import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = 3000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("conectado ao MongoDB");
  } catch (error) {
    console.log("erro ao conectar MongoDB ", error);
  }
};

connectDB();

app.post("/vendas", (req, res) => {
  // res.json(objResponse);
});

app.listen(3000, () => {
  console.log(`O servidor está ativo na porta ${PORT}`);
});
