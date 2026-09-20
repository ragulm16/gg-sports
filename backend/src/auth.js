const jwt = require("jsonwebtoken");
const config = require("./config");

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: "8h" });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function adminOnly(req, res, next) {
  return req.user?.role === "ADMIN" ? next() : res.status(403).json({ error: "Admin access required" });
}

module.exports = { createToken, authenticate, adminOnly };
