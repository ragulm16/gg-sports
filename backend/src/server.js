const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("./prisma");
const config = require("./config");
const { createToken, authenticate, adminOnly } = require("./auth");
const { contentSchema, leadSchema, roadmapSchema, userSchema, registerSchema } = require("./validation");

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, methods: ["GET", "POST", "PATCH", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: "draft-7", legacyHeaders: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

app.get("/health", (req, res) => res.json({ service: "gg-sports-api", status: "healthy" }));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password" });
  return res.json({ user: safeUser(user), accessToken: createToken(user) });
}));

app.post("/api/auth/register", asyncRoute(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({ data: { name: input.name, email, passwordHash, role: "CUSTOMER" } });
  return res.status(201).json({ user: safeUser(user), accessToken: createToken(user) });
}));

app.get("/api/auth/me", authenticate, asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(401).json({ error: "Account not found" });
  return res.json({ user: safeUser(user) });
}));

app.get("/api/content", asyncRoute(async (req, res) => {
  const type = req.query.type ? String(req.query.type).toUpperCase() : undefined;
  const items = await prisma.contentItem.findMany({
    where: { status: "PUBLISHED", ...(type ? { type } : {}) },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
  });
  return res.json({ items });
}));

app.get("/api/content/:id", asyncRoute(async (req, res) => {
  const item = await prisma.contentItem.findFirst({
    where: {
      id: req.params.id,
      status: "PUBLISHED",
    },
  });
  if (!item) return res.status(404).json({ error: "Content item not found" });
  return res.json({ item });
}));

app.get("/api/v1/content", asyncRoute(async (req, res) => {
  const type = req.query.type ? String(req.query.type).toUpperCase() : undefined;
  const items = await prisma.contentItem.findMany({
    where: { status: "PUBLISHED", ...(type ? { type } : {}) },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
  });
  return res.json({ items });
}));

app.get("/api/v1/content/:id", asyncRoute(async (req, res) => {
  const item = await prisma.contentItem.findFirst({
    where: { id: req.params.id, status: "PUBLISHED" },
  });
  if (!item) return res.status(404).json({ error: "Content item not found" });
  return res.json({ item });
}));

app.get("/api/roadmap", asyncRoute(async (req, res) => {
  const items = await prisma.roadmapItem.findMany({ orderBy: { position: "asc" } });
  return res.json({ items });
}));

app.get("/api/v1/roadmap", asyncRoute(async (req, res) => {
  const items = await prisma.roadmapItem.findMany({ orderBy: { position: "asc" } });
  return res.json({ items });
}));

app.get("/api/admin/content", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const items = await prisma.contentItem.findMany({ orderBy: { createdAt: "desc" } });
  return res.json({ items });
}));

app.get("/api/admin/roadmap", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const items = await prisma.roadmapItem.findMany({ orderBy: { position: "asc" } });
  return res.json({ items });
}));

app.patch("/api/admin/roadmap/:id", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const input = roadmapSchema.parse(req.body);
  const item = await prisma.roadmapItem.update({ where: { id: req.params.id }, data: input });
  return res.json({ item });
}));

app.post("/api/admin/content", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const input = contentSchema.parse(req.body);
  const slug = `${input.type.toLowerCase()}-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  const item = await prisma.contentItem.create({ data: { ...input, slug } });
  return res.status(201).json({ item });
}));

app.patch("/api/admin/content/:id", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const input = contentSchema.partial().parse(req.body);
  const item = await prisma.contentItem.update({ where: { id: req.params.id }, data: input });
  return res.json({ item });
}));

app.delete("/api/admin/content/:id", authenticate, adminOnly, asyncRoute(async (req, res) => {
  await prisma.contentItem.delete({ where: { id: req.params.id } });
  return res.status(204).end();
}));

app.post("/api/leads", asyncRoute(async (req, res) => {
  const input = leadSchema.parse(req.body);
  const lead = await prisma.lead.create({ data: input });
  return res.status(201).json({ lead: { id: lead.id, status: lead.status } });
}));

app.get("/api/admin/leads", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return res.json({ leads });
}));

app.patch("/api/admin/leads/:id", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const input = z.object({ status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"]) }).parse(req.body);
  const lead = await prisma.lead.update({ where: { id: req.params.id }, data: input });
  return res.json({ lead });
}));

app.get("/api/admin/users", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return res.json({ users: users.map(safeUser) });
}));

app.post("/api/admin/users", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const input = userSchema.parse(req.body);
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "An admin with this email already exists" });
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({ data: { name: input.name, email, passwordHash } });
  return res.status(201).json({ user: safeUser(user) });
}));

app.delete("/api/admin/users/:id", authenticate, adminOnly, asyncRoute(async (req, res) => {
  if (req.params.id === req.user.sub) return res.status(400).json({ error: "You cannot remove your own admin access" });
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "Admin not found" });
  const total = await prisma.user.count();
  if (total <= 1) return res.status(400).json({ error: "Cannot remove the last admin account" });
  await prisma.user.delete({ where: { id: req.params.id } });
  return res.status(204).end();
}));

app.use((error, req, res, next) => {
  if (error.name === "ZodError") return res.status(400).json({ error: "Invalid request", details: error.issues });
  if (error.code === "P2025") return res.status(404).json({ error: "Record not found" });
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => console.log(`GG Sports API listening on http://localhost:${config.port}`));
