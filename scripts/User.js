import mongoose from "mongoose";

const contatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true }, // <-- AQUI!
  telefone: { type: String, required: true },
  email: { type: String },
  endereco: { type: String },
  aniversario: { type: Date },
  observacoes: { type: String },
  favorito: { type: Boolean, default: false },
});

const User = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  contatos: [contatoSchema],
});

export default mongoose.model("User", User);
