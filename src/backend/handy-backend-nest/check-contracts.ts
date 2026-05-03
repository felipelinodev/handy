import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const contracts = await prisma.contratacoes.findMany({
    include: { avaliacao: true }
  });
  console.log('Contracts in DB:', JSON.stringify(contracts.map(c => ({
    id: c.contratacao_id,
    cliente: c.cliente_id,
    status: c.status,
    hasAvaliacao: !!c.avaliacao
  })), null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
