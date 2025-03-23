import mongoose from "mongoose";

const VendaMasalSchema = new mongoose.Schema({
  mes: Number,
  valorVendido: Number,
});

export default mongoose.model("VendaMensal", VendaMasalSchema);
