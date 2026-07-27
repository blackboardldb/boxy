import { prisma } from "./lib/prisma";
import { generateClassesFromSchedules } from "./lib/utils/class-generator";

async function main() {
  const orgId = "bsfit"; // Supabase org id slug, but let's get the UUID
  const org = await prisma.organization.findFirst();
  if (!org) return console.log("No org");
  
  console.log("Generating for org:", org.id);
  const classes = await generateClassesFromSchedules(org.id, "2026-07-20", "2026-07-26");
  
  console.log("Generated classes:", classes.map(c => ({
    name: c.name,
    time: c.dateTime
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
