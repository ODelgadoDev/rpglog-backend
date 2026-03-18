const { verifyToken } = require("../utils/jwt");

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, message: "Falta token (Bearer)" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Token inválido o expirado" });
  }
}

module.exports = { authRequired };