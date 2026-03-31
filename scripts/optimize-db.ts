
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creando índices funcionales para optimizar Phase 2...')
  
  try {
    // Índice para fecha de vencimiento (ordenamiento y filtrado de expirados/por vencer)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_membership_current_period_end 
      ON public.users ((membership->>'currentPeriodEnd'));
    `)
    console.log('✅ Índice idx_users_membership_current_period_end creado.')

    // Índice para estado (para stats rápidos)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_membership_status 
      ON public.users ((membership->>'status'));
    `)
    console.log('✅ Índice idx_users_membership_status creado.')

  } catch (error) {
    console.error('❌ Error creando índices:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
