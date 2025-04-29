import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function autenticarUsuario(req, res, next) {
  console.log("Middleware de autenticação acionado");

  const token = req.headers.authorization?.split(" ")[1]; // Obter o token do header

  console.log("Verificando token:", token);

  if (!token) {
    console.log("Token não fornecido. Redirecionando para /login.");
    return res.status(401).json({ mensagem: "Token não fornecido" });  // Resposta com 401
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Token válido. Decodificado:", decoded);

    req.userId = decoded.userId;
    req.user = await User.findById(decoded.userId);

    if (!req.user) {
      console.log("Usuário não encontrado. Redirecionando para /login.");
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    console.log("Usuário encontrado:", req.user);

    next();
  } catch (error) {
    console.error("Erro de autenticação. Erro:", error);
    return res.status(401).json({ mensagem: "Token inválido" }); // Resposta com 401
  }
}
