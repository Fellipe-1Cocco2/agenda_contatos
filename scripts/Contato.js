import mongoose from "mongoose";

const Contato = new mongoose.Schema({
  nome: String,
  email: String,
  numero: String,
  aniversario: String,
});

export default mongoose.model("Contato", Contato);