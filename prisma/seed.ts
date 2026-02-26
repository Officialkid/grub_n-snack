import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter, log: ['query'] })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { phone: '0700000000' },
    update: {},
    create: {
      name: 'Grub Admin',
      phone: '0700000000',
      email: 'admin@grubnsnack.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Admin seeded successfully:', admin.name, admin.phone)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
