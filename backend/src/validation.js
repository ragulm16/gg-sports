const { z } = require("zod");

const contentSchema = z.object({
  type: z.enum(["EVENT", "PRODUCT", "SERVICE", "SECTION"]),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(2000),
  imageUrl: z.string().url().optional().or(z.literal("")),
  metadata: z.string().max(5000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  interest: z.string().trim().min(2).max(80),
  message: z.string().trim().min(2).max(3000),
  source: z.string().trim().max(40).default("WEBSITE"),
});

const roadmapSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2200),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(500),
  position: z.coerce.number().int().min(0).max(100),
});

const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

module.exports = { contentSchema, leadSchema, roadmapSchema, userSchema, registerSchema };
