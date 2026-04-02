import { prisma } from "./lib/prisma"

async function main() {
  const newExp = await prisma.expense.create({
    data: {
      motivo: "Prueba 11k",
      fecha: new Date(),
      monto: 11000
    }
  });
  console.log("Creado:", newExp);
}
main().catch(console.error);
