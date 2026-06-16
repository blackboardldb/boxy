import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  await seedExercises()

  console.log('✅ Seed completado')
}

// ─────────────────────────────────────────────────────────────────────────────
// EJERCICIOS GLOBALES
// Todos con organizationId: null → disponibles para todos los centros
// isCustom: false → son de Boxy, no editables por el centro
// ─────────────────────────────────────────────────────────────────────────────

async function seedExercises() {
  const exercises = [
    // FUERZA — PIERNAS
    { name: 'Sentadilla Trasera',      category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Sentadilla Frontal',      category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Sentadilla Goblet',       category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Sentadilla Búlgara',      category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Peso Muerto',             category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Peso Muerto Rumano',      category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Peso Muerto Sumo',        category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Zancada',                 category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Zancada Caminando',       category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Prensa de Piernas',       category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Extensión de Cuádriceps', category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Curl de Femoral',         category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Hip Thrust',              category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Glute Bridge',            category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Elevación de Pantorrilla',category: 'fuerza',    muscleGroup: 'piernas' },
    { name: 'Step Up',                 category: 'fuerza',    muscleGroup: 'piernas' },

    // FUERZA — ESPALDA
    { name: 'Dominada',                category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Dominada con Peso',       category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Remo con Barra',          category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Remo con Mancuerna',      category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Remo en Polea Baja',      category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Jalón al Pecho',          category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Pull Over',               category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Face Pull',               category: 'fuerza',    muscleGroup: 'espalda' },
    { name: 'Buenos Días',             category: 'fuerza',    muscleGroup: 'espalda' },

    // FUERZA — PECHO
    { name: 'Press de Banca Plano',    category: 'fuerza',    muscleGroup: 'pecho' },
    { name: 'Press de Banca Inclinado',category: 'fuerza',    muscleGroup: 'pecho' },
    { name: 'Press de Banca Declinado',category: 'fuerza',    muscleGroup: 'pecho' },
    { name: 'Press con Mancuernas',    category: 'fuerza',    muscleGroup: 'pecho' },
    { name: 'Apertura con Mancuernas',category: 'fuerza',    muscleGroup: 'pecho' },
    { name: 'Fondos en Paralelas',     category: 'fuerza',    muscleGroup: 'pecho' },
    { name: 'Flexiones',               category: 'fuerza',    muscleGroup: 'pecho' },
    { name: 'Crossover en Polea',      category: 'fuerza',    muscleGroup: 'pecho' },

    // FUERZA — HOMBROS
    { name: 'Press Militar',           category: 'fuerza',    muscleGroup: 'hombros' },
    { name: 'Press Arnold',            category: 'fuerza',    muscleGroup: 'hombros' },
    { name: 'Elevación Lateral',       category: 'fuerza',    muscleGroup: 'hombros' },
    { name: 'Elevación Frontal',       category: 'fuerza',    muscleGroup: 'hombros' },
    { name: 'Pájaro',                  category: 'fuerza',    muscleGroup: 'hombros' },
    { name: 'Encogimiento de Hombros', category: 'fuerza',    muscleGroup: 'hombros' },

    // FUERZA — BRAZOS
    { name: 'Curl de Bícep con Barra', category: 'fuerza',    muscleGroup: 'brazos' },
    { name: 'Curl de Bícep Alternado', category: 'fuerza',    muscleGroup: 'brazos' },
    { name: 'Curl Martillo',           category: 'fuerza',    muscleGroup: 'brazos' },
    { name: 'Curl en Polea',           category: 'fuerza',    muscleGroup: 'brazos' },
    { name: 'Extensión de Trícep',     category: 'fuerza',    muscleGroup: 'brazos' },
    { name: 'Patada de Trícep',        category: 'fuerza',    muscleGroup: 'brazos' },
    { name: 'Press Francés',           category: 'fuerza',    muscleGroup: 'brazos' },
    { name: 'Fondos en Banco',         category: 'fuerza',    muscleGroup: 'brazos' },

    // FUERZA — CORE
    { name: 'Plancha',                 category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Plancha Lateral',         category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Crunch',                  category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Crunch Inverso',          category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Elevación de Piernas',    category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Russian Twist',           category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Dead Bug',                category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Hollow Body',             category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Ab Wheel',                category: 'fuerza',    muscleGroup: 'core' },
    { name: 'Pallof Press',            category: 'fuerza',    muscleGroup: 'core' },

    // POTENCIA — FULL BODY
    { name: 'Clean',                   category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Power Clean',             category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Snatch',                  category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Power Snatch',            category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Clean and Jerk',          category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Push Press',              category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Push Jerk',               category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Split Jerk',              category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Thruster',                category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Kettlebell Swing',        category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Box Jump',                category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Salto al Cajón',          category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Salto con Cuerda',        category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Burpee',                  category: 'potencia',  muscleGroup: 'full_body' },
    { name: 'Wall Ball',               category: 'potencia',  muscleGroup: 'full_body' },

    // GIMNASIA
    { name: 'Muscle Up en Anillas',    category: 'gimnasia',  muscleGroup: 'full_body' },
    { name: 'Muscle Up en Barra',      category: 'gimnasia',  muscleGroup: 'full_body' },
    { name: 'Handstand Push Up',       category: 'gimnasia',  muscleGroup: 'hombros' },
    { name: 'Handstand Walk',          category: 'gimnasia',  muscleGroup: 'full_body' },
    { name: 'Toes to Bar',             category: 'gimnasia',  muscleGroup: 'core' },
    { name: 'Knees to Elbows',         category: 'gimnasia',  muscleGroup: 'core' },
    { name: 'Pull Up',                 category: 'gimnasia',  muscleGroup: 'espalda' },
    { name: 'Chest to Bar',            category: 'gimnasia',  muscleGroup: 'espalda' },
    { name: 'Ring Dip',                category: 'gimnasia',  muscleGroup: 'pecho' },
    { name: 'Pistol Squat',            category: 'gimnasia',  muscleGroup: 'piernas' },
    { name: 'L-Sit',                   category: 'gimnasia',  muscleGroup: 'core' },

    // CARDIO
    { name: 'Remo (Máquina)',          category: 'cardio',    muscleGroup: 'full_body' },
    { name: 'Ski Erg',                 category: 'cardio',    muscleGroup: 'full_body' },
    { name: 'Bicicleta Estática',      category: 'cardio',    muscleGroup: 'piernas' },
    { name: 'Assault Bike',            category: 'cardio',    muscleGroup: 'full_body' },
    { name: 'Caminata',                category: 'cardio',    muscleGroup: 'full_body' },
    { name: 'Trote',                   category: 'cardio',    muscleGroup: 'full_body' },
    { name: 'Carrera',                 category: 'cardio',    muscleGroup: 'full_body' },
    { name: 'Saltar la Cuerda',        category: 'cardio',    muscleGroup: 'full_body' },

    // MOVILIDAD
    { name: 'Estiramiento de Isquios', category: 'movilidad', muscleGroup: 'piernas' },
    { name: 'Estiramiento de Cadera',  category: 'movilidad', muscleGroup: 'piernas' },
    { name: 'Estiramiento de Pectoral',category: 'movilidad', muscleGroup: 'pecho' },
    { name: 'Estiramiento de Hombros', category: 'movilidad', muscleGroup: 'hombros' },
    { name: 'Movilidad Torácica',      category: 'movilidad', muscleGroup: 'espalda' },
    { name: 'Movilidad de Tobillo',    category: 'movilidad', muscleGroup: 'piernas' },
    { name: 'Cat Cow',                 category: 'movilidad', muscleGroup: 'espalda' },
    { name: 'World Greatest Stretch',  category: 'movilidad', muscleGroup: 'full_body' },
    { name: 'Pigeon Pose',             category: 'movilidad', muscleGroup: 'piernas' },
    { name: 'Foam Roller Espalda',     category: 'movilidad', muscleGroup: 'espalda' },
  ]

  console.log(`  → Seeding ${exercises.length} ejercicios...`)

  for (const exercise of exercises) {
    await prisma.$executeRaw`
      INSERT INTO "exercises" ("id", "name", "category", "muscleGroup", "isCustom", "organizationId", "isActive", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        ${exercise.name},
        ${exercise.category ?? null},
        ${exercise.muscleGroup ?? null},
        false,
        null,
        true,
        now(),
        now()
      )
      ON CONFLICT ("name") WHERE "organizationId" IS NULL
      DO UPDATE SET
        "category"     = EXCLUDED."category",
        "muscleGroup"  = EXCLUDED."muscleGroup",
        "updatedAt"    = now()
    `
  }

  console.log(`  ✓ ${exercises.length} ejercicios listos`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
