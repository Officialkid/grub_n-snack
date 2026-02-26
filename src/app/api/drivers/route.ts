import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createDriverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Enter a valid phone number').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const drivers = await prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        isOnDuty: true,
        createdAt: true,
        _count: {
          select: {
            orders: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, drivers })
  } catch (error) {
    console.error('[GET DRIVERS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = createDriverSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, phone, password } = validation.data

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A user with this phone number already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const driver = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: 'DRIVER',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        isOnDuty: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, driver }, { status: 201 })
  } catch (error) {
    console.error('[CREATE DRIVER ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create driver' },
      { status: 500 }
    )
  }
}
