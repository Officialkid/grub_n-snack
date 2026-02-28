/**
 * reset-admin.ts — Update the admin account phone/password.
 * Run with:  npx tsx prisma/reset-admin.ts
 *
 * Edit ADMIN_PHONE / ADMIN_PASSWORD / ADMIN_NAME below before running.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

// ── ✏️  EDIT THESE ────────────────────────────────────────────────────────────
const NEW_NAME     = 'Grub Admin'
const NEW_PHONE    = '0700000000'    // ← change to your real phone number
const NEW_PASSWORD = 'admin123'      // ← change to a strong password
const NEW_EMAIL    = 'admin@grubnsnack.com'  // ← optional
// ─────────────────────────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashed = await bcrypt.hash(NEW_PASSWORD, 12)

  const admin = await prisma.user.upsert({
    where: { phone: '0700000000' },   // find existing test admin
    update: {
      name: NEW_NAME,
      phone: NEW_PHONE,
      password: hashed,
      email: NEW_EMAIL,
    },
    create: {
      name: NEW_NAME,
      phone: NEW_PHONE,
      password: hashed,
      email: NEW_EMAIL,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅  Admin account updated:')
  console.log(`   Name  : ${admin.name}`)
  console.log(`   Phone : ${admin.phone}`)
  console.log(`   Email : ${admin.email ?? '—'}`)
  console.log(`   Role  : ${admin.role}`)
}

main()
  .catch((e) => { console.error('❌ Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
