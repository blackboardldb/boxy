import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth/require-manager";
import { PlanesClient } from "./components/planes-client";

export default async function PlanesPage() {
  await requireManager();
  
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { organizations: true } } },
  });

  return <PlanesClient initialPlans={plans} />;
}
