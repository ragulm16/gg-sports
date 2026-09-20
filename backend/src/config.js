require("dotenv").config();

const required = ["JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET,
  // Accept a comma-separated list so local dev and one or more deployed origins can coexist.
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
