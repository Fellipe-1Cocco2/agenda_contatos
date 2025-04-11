import jwt from "jsonwebtoken";
import User from "./User.js";

export async function autenticarUsuario(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    const decoded = jwt.verify(token, "secretkey");
    const user = await User.findById(decoded.userId);
    if (!user)
      return res.status(401).json({ mensagem: "Usuário não encontrado." });

    req.user = user; // isso mantém o user completo
    req.userId = decoded.userId; // <-- ADICIONA ISSO AQUI!

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token inválido." });
  }
}
