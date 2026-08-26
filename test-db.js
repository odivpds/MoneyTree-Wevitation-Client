const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.template.findMany();
  console.log("Templates in DB:", templates.length);
  if (templates.length > 0) {
    console.log("Template names:", templates.map(t => t.name).join(', '));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
