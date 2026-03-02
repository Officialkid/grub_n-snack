/**
 * reset-admin.ts — Set admin credentials for grubnsnack@gmail.com
 * Run with:  npx tsx prisma/reset-admin.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const ADMIN_EMAIL    = 'grubnsnack@gmail.com'
const ADMIN_PASSWORD = '2026@Grubnsnack!'
const ADMIN_NAME     = 'Grub Admin'
const ADMIN_PHONE    = '0700000000'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12)

  // Try to find existing ADMIN user
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } })

  let admin
  if (existing) {
    admin = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashed,
        isActive: true,
        isPendingApproval: false,
      },
    })
    console.log('✅  Admin account updated:')
  } else {
    admin = await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
        password: hashed,
        role: 'ADMIN',
        isActive: true,
        isPendingApproval: false,
      },
    })
    console.log('✅  Admin account created:')
  }

  console.log(`   Name  : ${admin.name}`)
  console.log(`   Email : ${admin.email ?? '—'}`)
  console.log(`   Phone : ${admin.phone}`)
  console.log(`   Role  : ${admin.role}`)
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
