import jwt from "jsonwebtoken";
import User from "./User.js";

export const autenticarUsuario = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensagem: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secretkey");
    const usuario = await User.findById(decoded.userId).select("-password");
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ mensagem: "Token inválido ou expirado" });
  }
};
