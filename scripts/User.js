import mongoose from "mongoose";

const contatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  email: { type: String },
  endereco: { type: String },
  aniversario: { type: Date },
  observacoes: { type: String },
});

const User = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  contatos: [contatoSchema], // array de contatos
});

export default mongoose.model("User", User);
