import { NextResponse } from "next/server";

async function main() {
  const host = "http://localhost:3000";
  // 1. Crear
  console.log("Creando plan TEST...");
  const createRes = await fetch(`${host}/manager/api/planes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "TEST_PLAN_" + Date.now(), maxActiveStudents: 50 })
  });
  const createData = await createRes.json();
  console.log("POST Response:", JSON.stringify(createData, null, 2));

  if (!createData.data?.id) return;
  const id = createData.data.id;

  // 2. Actualizar
  console.log(`\nActualizando plan ${id}...`);
  const updateRes = await fetch(`${host}/manager/api/planes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxActiveStudents: 55 })
  });
  const updateData = await updateRes.json();
  console.log("PUT Response:", JSON.stringify(updateData, null, 2));
}

main().catch(console.error);
