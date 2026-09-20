require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient, ContentType, ContentStatus } = require("@prisma/client");
const content = require("../data/content.json");
const roadmap = require("../data/roadmap.json");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@ggsports.in" },
    update: { passwordHash },
    create: {
      name: "GG Sports Admin",
      email: process.env.ADMIN_EMAIL || "admin@ggsports.in",
      passwordHash,
    },
  });

  for (const entry of content) {
    const type = ContentType[entry.type];
    const status = ContentStatus[entry.status];
    const slug = `${type.toLowerCase()}-${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    await prisma.contentItem.upsert({
      where: { slug },
      update: {},
      create: {
        title: entry.title,
        type,
        description: entry.description,
        slug,
        status,
        ...(entry.imageUrl ? { imageUrl: entry.imageUrl } : {}),
        ...(entry.metadata ? { metadata: entry.metadata } : {}),
      },
    });
  }

  for (const entry of roadmap) {
    await prisma.roadmapItem.upsert({
      where: { id: `roadmap-${entry.year}` },
      update: entry,
      create: { id: `roadmap-${entry.year}`, ...entry },
    });
  }
}

main()
  .then(() => console.log("GG Sports backend seeded."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
