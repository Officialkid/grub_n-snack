import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .min(9, 'Enter a valid phone number')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+\s-]+$/, 'Phone number contains invalid characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = signupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, phone, password } = validation.data

    // Check if phone already registered
    const existing = await prisma.user.findUnique({
      where: { phone },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This phone number is already registered. Please log in instead.',
        },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create driver — inactive and pending approval by default
    await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: 'DRIVER',
        isActive: false,
        isPendingApproval: true,
        isOnDuty: false,
      },
    })

    console.log(`[SIGNUP] New driver registered: ${name} (${phone}) — awaiting approval`)

    return NextResponse.json(
      {
        success: true,
        message:
          'Application submitted successfully. Admin will review and approve your account.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[SIGNUP ERROR]', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again.',
      },
      { status: 500 }
    )
  }
}
