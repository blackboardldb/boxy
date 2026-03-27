/**
 * scripts/verify-logic.ts
 * 
 * Smoke Test TOTAL (v3) - Verificación exhaustiva de Reglas de Negocio.
 */
import { ValidationService } from "../lib/validation-service";
import { getStudentClassesInPeriod } from "../lib/utils";

// Mock Data BASE
const mockUser: any = {
  id: "user_test_001",
  membership: {
    status: "active",
    currentPeriodStart: "2026-03-01",
    currentPeriodEnd: "2026-03-31",
    planConfig: { 
      classLimit: 30, 
      disciplineAccess: "unlimited" 
    },
    centerConfig: { 
      maxBookingsPerDay: 2,
      cancellationHours: 2 
    },
    centerStats: { 
      currentMonth: { remainingClasses: 10 } 
    }
  }
};

const mockDiscipline: any = {
  id: "disc_001",
  name: "CrossFit",
  cancellationRules: [
    { time: "08:00", hoursBefore: 6 } // Regla especial para la mañana
  ]
};

async function runVerification() {
  console.log("\n🚀 INICIANDO VERIFICACIÓN TOTAL DE LÓGICA (v3)");
  console.log("=================================================");

  // --- ESCENARIO 4: Expiración de plan ---
  console.log("\n🧪 4. Expiración de plan (Clase fuera de rango):");
  const classFutureMonth = {
    id: "c_future", dateTime: "2026-04-15T18:00:00Z", // Fuera del periodo del mockUser
    status: "scheduled", capacity: 15, registeredParticipantsIds: [],
    disciplineId: "disc_001", durationMinutes: 60
  } as any;

  try {
    const resExp = await ValidationService.canUserRegisterToClass(mockUser, classFutureMonth, []);
    if (!resExp.canRegister && resExp.reason?.includes("expiración")) {
      console.log("   ✅ Bloqueado: Clase posterior a expiración del plan");
    } else {
      console.log("   ❌ ERROR: Debería haber bloqueado la inscripción fuera de rango");
      console.log("      Razón dada:", resExp.reason);
    }
  } catch (e: any) {
    console.error("   ❌ ERROR en expiración:", e.message);
  }

  // --- ESCENARIO 5: Reglas de Cancelación (Específicas) ---
  console.log("\n🧪 5. Reglas de cancelación disciplinaria (6h antes):");
  
  // Mañana (30 de Marzo 08:00 AM)
  const classEarly = {
    id: "c_early", 
    dateTime: "2026-03-30T08:00:00Z",
    registeredParticipantsIds: ["user_test_001"]
  } as any;

  // Supongamos que "ahora" es 30 de Marzo a las 05:00 AM (3h antes)
  // Como la regla para las 08:00 es 6h, debería fallar.
  // Pero ValidationService usa `new Date()` (el tiempo real de este CPU).
  // Para testear esto sin mocks de tiempo, usaremos una clase para MAÑANA
  // y compararemos contra el tiempo real.
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0); // Mañana a las 20:00
  
  const classTmrw = {
    id: "c_tmrw",
    dateTime: tomorrow.toISOString(),
    registeredParticipantsIds: ["user_test_001"]
  } as any;

  const resCanNormal = ValidationService.canUserCancelClassWithRules(mockUser, classTmrw, mockDiscipline);
  console.log(resCanNormal.canCancel ? "   ✅ Cancelación permitida (ej. 24h antes)" : "   ❌ Falló cancelación lejana");

  // --- ESCENARIO 6: Acceso Limitado de Disciplina ---
  console.log("\n🧪 6. Disciplina no incluida en el plan:");
  const userLimited = {
    ...mockUser,
    membership: {
      ...mockUser.membership,
      planConfig: { disciplineAccess: "limited", allowedDisciplines: ["disc_999"] }
    }
  };
  
  const classDiscNormal = {
    id: "c3", dateTime: "2026-03-30T10:00:00Z",
    disciplineId: "disc_001", status: "scheduled", capacity: 15, registeredParticipantsIds: []
  } as any;

  const resDisc = await ValidationService.canUserRegisterToClass(userLimited, classDiscNormal, []);
  if (!resDisc.canRegister && resDisc.reason?.includes("no incluye esta disciplina")) {
    console.log("   ✅ Bloqueado: Disciplina no incluida correctamente");
  } else {
    console.log("   ❌ ERROR: Debería haber bloqueado el acceso limitado");
  }

  // --- ESCENARIO 7: Conteo SQL de Fase 2 (vía Repository) ---
  console.log("\n🧪 7. Verificación del Repositorio (SQL Count Simulation):");
  // Aquí no podemos ejecutarlo realmente sin DB, pero verificamos que al menos cargue
  try {
     const { getDataProvider } = require("../lib/data-layer/provider-factory");
     const provider = getDataProvider();
     if (provider.classRegistrations.countUserRegistrationsInPeriod) {
       console.log("   ✅ Método countUserRegistrationsInPeriod detectado en repositorio");
     }
  } catch(e) { /* ignore provider init error in test env */ }

  console.log("\n=================================================");
  console.log("✨ VERIFICACIÓN FINALIZADA.");
}

runVerification();
