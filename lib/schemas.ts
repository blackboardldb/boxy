import { z } from "zod";

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
    .optional(),
  membership: z
    .object({
      id: z.string(),
      organizationId: z.string(),
      organizationName: z.string(),
      status: z.enum(["active", "inactive", "expired", "pending", "scheduled"]),
      membershipType: z.string(),
      planId: z.string(),
      monthlyPrice: z.number(),
      currentPeriodStart: z.string(),
      currentPeriodEnd: z.string(),
      planConfiguration: z.object({
        maxClassesPerMonth: z.number(),
        maxBookingsPerDay: z.number(),
        cancellationHours: z.number(),
      }),
      centerStats: z.object({
        currentMonth: z.object({
          classesContracted: z.number(),
          classesAttended: z.number(),
          classesCancelled: z.number(),
        }),
        totalClasses: z.number(),
        totalHours: z.number(),
      }),
      centerConfig: z.object({
        timezone: z.string(),
        currency: z.string(),
        language: z.string(),
      }),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
    .optional(),
  gender: z.enum(["masculino", "femenino", "otro", "prefiero_no_decir"]).optional(),
  formaDePago: z.enum(["contado", "transferencia", "debito", "credito"]).optional(),
  organizationId: z.string().optional(),
  role: z.enum(["user", "admin", "coach"]).default("user"),
  membership: z.unknown().optional(),
  skipAutomaticRenewal: z.boolean().optional(),
  // Campos de plan — permiten asignar membresía desde el mismo request de creación
  planId: z.string().optional(),
  startDate: z.string().optional(), // YYYY-MM-DD — inicio del período de membresía
  endDate: z.string().optional(),   // YYYY-MM-DD — fin del período de membresía
});

export const updateUserSchema = createUserSchema.partial();

// Class schemas
export const classSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  disciplineId: z.string(),
  instructorId: z.string().optional(),
  dateTime: z.string(),
  durationMinutes: z.number(),
  maxParticipants: z.number(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createClassSessionSchema = z.object({
  name: z.string().min(1),
  disciplineId: z.string(),
  instructorId: z.string().optional(),
  dateTime: z.string(),
  durationMinutes: z.number().min(1),
  capacity: z.number().min(1),
  notes: z.string().optional(),
});

export const updateClassSessionSchema = createClassSessionSchema.partial();

// Discipline schemas
export const disciplineSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createDisciplineSchema = z.object({
  name:              z.string().min(1),
  description:       z.string().optional(),
  color:             z.string().optional(),
  isActive:          z.boolean().optional(),
  capacity:          z.number().int().min(1).optional(),
  durationMinutes:   z.number().int().min(15).optional(),
  defaultCoachId:    z.string().optional(),
  schedule: z.array(
    z.object({
      day:   z.string(),           // DayOfWeek: "lun"|"mar"|...
      times: z.array(z.string()),  // ["08:00", "10:00"]
    })
  ).optional(),
  cancellationRules: z.array(
    z.object({
      id:          z.string().optional(),
      time:        z.string(),
      hoursBefore: z.number(),
      priority:    z.number().optional(),
      description: z.string().optional(),
    })
  ).optional(),
});

export const updateDisciplineSchema = createDisciplineSchema.partial();

// Instructor schemas
export const instructorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  specialties: z.array(z.string()),
  isActive: z.boolean(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createInstructorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  role: z.enum(["coach", "admin"]).default("coach"),
  userId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateInstructorSchema = createInstructorSchema.partial();

// Plan schemas
export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  monthlyPrice: z.number(),
  maxClassesPerMonth: z.number(),
  maxBookingsPerDay: z.number(),
  cancellationHours: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createPlanSchema = z.object({
  name:               z.string().min(1),
  description:        z.string().optional(),
  price:              z.number().min(0),
  durationInMonths:   z.number().min(1),
  classLimit:         z.number().min(0),
  disciplineAccess:   z.string().optional(),
  allowedDisciplines: z.array(z.string()).optional(),
  canFreeze:          z.boolean().optional(),
  freezeDurationDays: z.number().optional(),
  autoRenews:         z.boolean().optional(),
  isActive:           z.boolean().optional(),
  organizationId:     z.string().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

// Organization schemas
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  settings: z.object({
    timezone: z.string(),
    currency: z.string(),
    language: z.string(),
    defaultCancellationHours: z.number(),
    maxBookingsPerDay: z.number(),
    waitlistEnabled: z.boolean(),
    operatingHours: z.array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        closed: z.boolean(),
      })
    ),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(1),
  settings: z.object({
    timezone: z.string(),
    currency: z.string(),
    language: z.string(),
    defaultCancellationHours: z.number().min(0),
    maxBookingsPerDay: z.number().min(1),
    waitlistEnabled: z.boolean(),
    operatingHours: z.array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        closed: z.boolean(),
      })
    ),
  }),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// Registration schemas
export const classRegistrationSchema = z.object({
  userId: z.string(),
  classSessionId: z.string(),
  status: z.enum(["registered", "waitlisted", "cancelled"]),
  registeredAt: z.string(),
  cancelledAt: z.string().optional(),
});

export const createClassRegistrationSchema = z.object({
  userId: z.string(),
  classSessionId: z.string(),
});

// Renewal schemas
export const membershipRenewalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  requestedPaymentMethod: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  requestedAt: z.string(),
  processedAt: z.string().optional(),
  processedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const createMembershipRenewalSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  requestedPaymentMethod: z.string(),
  notes: z.string().optional(),
});

export const CancellationRuleSchema = z.object({
  id: z.string(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  hoursBefore: z.number().min(0),
  priority: z.number().min(0),
  description: z.string().optional(),
});

export const DisciplineSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean(),
  capacity: z.number().int().min(1).optional(),
  durationMinutes: z.number().int().min(15).optional(),
  schedule: z.array(
    z.object({
      day: z.enum(["lun", "mar", "mie", "jue", "vie", "sab", "dom"]),
      times: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
    })
  ),
  cancellationRules: z.array(CancellationRuleSchema),
});

// Export types
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type ClassSession = z.infer<typeof classSessionSchema>;
export type CreateClassSession = z.infer<typeof createClassSessionSchema>;
export type UpdateClassSession = z.infer<typeof updateClassSessionSchema>;

export type Discipline = z.infer<typeof disciplineSchema>;
export type CreateDiscipline = z.infer<typeof createDisciplineSchema>;
export type UpdateDiscipline = z.infer<typeof updateDisciplineSchema>;

export type Instructor = z.infer<typeof instructorSchema>;
export type CreateInstructor = z.infer<typeof createInstructorSchema>;
export type UpdateInstructor = z.infer<typeof updateInstructorSchema>;

export type Plan = z.infer<typeof planSchema>;
export type CreatePlan = z.infer<typeof createPlanSchema>;
export type UpdatePlan = z.infer<typeof updatePlanSchema>;

export type Organization = z.infer<typeof organizationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;

export type ClassRegistration = z.infer<typeof classRegistrationSchema>;
export type CreateClassRegistration = z.infer<
  typeof createClassRegistrationSchema
>;

export type MembershipRenewal = z.infer<typeof membershipRenewalSchema>;
export type CreateMembershipRenewal = z.infer<
  typeof createMembershipRenewalSchema
>;

// Expense schemas
export const createExpenseSchema = z.object({
  motivo: z.string().min(1, "El motivo es requerido"),
  fecha:  z.string().min(1, "Fecha inválida"),
  monto:  z.number().positive("El monto debe ser positivo"),
});
export const updateExpenseSchema = createExpenseSchema.partial();
export type CreateExpense = z.infer<typeof createExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

// InAppAlert schemas
// NOTA: type usa z.string().min(1) — no z.enum — para compatibilidad con
// valores existentes en BD como "noticia", "cancelacion", etc.
export const createInAppAlertSchema = z.object({
  title:     z.string().min(1, "El título es requerido"),
  content:   z.string().min(1, "El contenido es requerido"),
  type:      z.string().min(1, "El tipo es requerido"),
  startDate: z.string().datetime({ message: "Fecha de inicio inválida" }),
  endDate:   z.string().datetime({ message: "Fecha de fin inválida" }),
  sendPush:  z.boolean().optional(),
});
export const updateInAppAlertSchema = createInAppAlertSchema.partial();
export type CreateInAppAlert = z.infer<typeof createInAppAlertSchema>;
export type UpdateInAppAlert = z.infer<typeof updateInAppAlertSchema>;

// Password change schema
export const changePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;
