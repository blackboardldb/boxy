// Initial data for database seeding
// Extracted from legacy mock-data but simplified

export const initialOrganization = {
  id: "org_blacksheep_001",
  name: "BlackSheep CrossFit",
  description: "Centro de entrenamiento de alta intensidad especializado en CrossFit.",
  type: "crossfit",
  branding: {
    primaryColor: "#000000",
    secondaryColor: "#eab308",
    logoSvg: ""
  },
  settings: {
    timezone: "America/Santiago",
    currency: "CLP",
    language: "es",
    defaultCancellationHours: 2,
    maxBookingsPerDay: 2,
    waitlistEnabled: true,
    operatingHours: [
      { day: "lun", open: "07:00", close: "22:00", closed: false },
      { day: "mar", open: "07:00", close: "22:00", closed: false },
      { day: "mie", open: "07:00", close: "22:00", closed: false },
      { day: "jue", open: "07:00", close: "22:00", closed: false },
      { day: "vie", open: "07:00", close: "22:00", closed: false },
      { day: "sab", open: "09:00", close: "14:00", closed: false },
      { day: "dom", open: "09:00", close: "14:00", closed: true }
    ]
  }
};

export const initialDisciplines = [
  {
    id: "disc_crossfit_001",
    name: "CrossFit",
    description: "Entrenamiento funcional constantemente variado de alta intensidad.",
    color: "#eab308",
    isActive: true,
    organizationId: "org_blacksheep_001",
    schedule: [],
    cancellationRules: { hoursBefore: 2, maxPerMonth: 3 }
  },
  {
    id: "disc_weightlifting_001",
    name: "Weightlifting",
    description: "Técnica y fuerza en levantamientos olímpicos.",
    color: "#ef4444",
    isActive: true,
    organizationId: "org_blacksheep_001",
    schedule: [],
    cancellationRules: { hoursBefore: 2, maxPerMonth: 3 }
  }
];

export const initialInstructors = [
  {
    id: "inst_001",
    firstName: "Coach",
    lastName: "Principal",
    email: "coach@blacksheep.cl",
    phone: "+56912345678",
    role: "coach",
    isActive: true,
    specialties: ["disc_crossfit_001", "disc_weightlifting_001"]
  }
];

export const initialMembershipPlans = [
  {
    id: "plan_unlimited_001",
    name: "Plan Ilimitado",
    description: "Acceso ilimitado a todas las clases",
    price: 65000,
    durationInMonths: 1,
    isActive: true,
    organizationId: "org_blacksheep_001",
    classLimit: 0,
    disciplineAccess: "all",
    allowedDisciplines: [],
    canFreeze: true,
    freezeDurationDays: 15,
    autoRenews: true
  },
  {
    id: "plan_12_sessions_001",
    name: "12 Sesiones",
    description: "12 clases por mes",
    price: 45000,
    durationInMonths: 1,
    isActive: true,
    organizationId: "org_blacksheep_001",
    classLimit: 12,
    disciplineAccess: "all",
    allowedDisciplines: [],
    canFreeze: false,
    freezeDurationDays: 0,
    autoRenews: true
  }
];

export const initialUsers = [
  {
    id: "user_admin_001",
    firstName: "Admin",
    lastName: "BlackSheep",
    email: "admin@blacksheep.cl",
    phone: "+56900000000",
    role: "admin",
    membership: {
      status: "active",
      planId: "plan_unlimited_001",
      organizationId: "org_blacksheep_001",
      startDate: "2024-01-01",
      remainingClasses: 0
    }
  },
  {
    id: "user_student_001",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phone: "+56911111111",
    role: "student",
    membership: {
      status: "active",
      planId: "plan_12_sessions_001",
      organizationId: "org_blacksheep_001",
      startDate: "2024-03-01",
      remainingClasses: 12
    }
  }
];
