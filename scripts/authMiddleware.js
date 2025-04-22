import jwt from "jsonwebtoken";
import User from "./User.js";

export async function autenticarUsuario(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    const decoded = jwt.verify(token, "secretkey");
    if (!decoded.userId) {
      return res
        .status(401)
        .json({ mensagem: "ID de usuário não encontrado no token." });
    }

    const user = await User.findById(decoded.userId);
    if (!user)
      return res.status(401).json({ mensagem: "Usuário não encontrado." });

    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token inválido." });
  }
}
