require("dotenv").config();

const required = ["JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
