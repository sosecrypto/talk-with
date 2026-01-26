import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sources = await prisma.source.findMany({
  select: { type: true, status: true, name: true, url: true, persona: { select: { name: true } } }
});

console.log('=== Sources ===');
sources.forEach(s => {
  console.log(`${s.persona.name} | ${s.type} | ${s.status} | ${s.name}`);
});

console.log(`\nTotal: ${sources.length} sources`);
console.log(`Active: ${sources.filter(s => s.status === 'ACTIVE').length}`);
console.log(`Pending: ${sources.filter(s => s.status === 'PENDING').length}`);

await prisma.$disconnect();
