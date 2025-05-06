import mongoose from "mongoose";

const contatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  telefone: { type: String, required: true },
  email: { type: String },
  endereco: { type: String },
  aniversario: { type: Date },
  observacoes: { type: String },
  favorito: { type: Boolean, default: false },
  marcadores: [String], // ← opcional: se quiser marcar contatos também
  lixeira: { type: Boolean, default: false },
  dataRemocao: { type: Date, default: null },
});

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  fotoPerfil: { type: String, default: "default.png" },
  contatos: [contatoSchema],
  marcadores: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("User", userSchema);
