/**
 * cleanup.ts — Wipes all test data from the database.
 * Run once with:  npx tsx prisma/cleanup.ts
 *
 * What it does:
 *  1. Deletes all OrderStatusLog records
 *  2. Deletes all Order records
 *  3. Deletes all PushSubscription records
 *  4. Deletes every DRIVER account (re-add real drivers after this)
 *  5. Resets the orders_orderNumber_seq back to 1
 *  6. Keeps the ADMIN account intact
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🗑️  Starting database cleanup...\n')

  // 1. Delete all order status logs
  const logs = await prisma.orderStatusLog.deleteMany({})
  console.log(`✅  Deleted ${logs.count} order status log(s)`)

  // 2. Delete all orders
  const orders = await prisma.order.deleteMany({})
  console.log(`✅  Deleted ${orders.count} order(s)`)

  // 3. Delete all push subscriptions
  const subs = await prisma.pushSubscription.deleteMany({})
  console.log(`✅  Deleted ${subs.count} push subscription(s)`)

  // 4. Delete all driver accounts
  const drivers = await prisma.user.deleteMany({
    where: { role: 'DRIVER' },
  })
  console.log(`✅  Deleted ${drivers.count} driver account(s)`)

  // 5. Reset order number sequence back to 1
  const seqResult = await prisma.$queryRaw<Array<{seq: string}>>`
    SELECT sequence_name::text AS seq
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    AND sequence_name ILIKE '%order%'
  `
  if (seqResult.length > 0) {
    for (const row of seqResult) {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${row.seq}" RESTART WITH 1`)
      console.log(`✅  Sequence "${row.seq}" reset to 1`)
    }
  } else {
    console.log('⚠️  No order sequence found — orderNumber will continue from last value')
  }

  // 6. Show remaining users (should be only ADMIN accounts)
  const remaining = await prisma.user.findMany({ select: { name: true, phone: true, role: true } })
  console.log('\n📋 Remaining accounts:')
  remaining.forEach((u) => console.log(`   • ${u.name} (${u.phone}) — ${u.role}`))

  console.log('\n🎉 Cleanup complete. System is ready for real orders.\n')
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
