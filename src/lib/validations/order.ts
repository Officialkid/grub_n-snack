import { z } from 'zod'

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),

  customerPhone: z
    .string()
    .min(9, 'Enter a valid phone number')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+\s-]+$/, 'Phone number contains invalid characters'),

  foodItem: z
    .string()
    .min(2, 'Please describe the food item')
    .max(200, 'Description is too long'),

  vendorName: z
    .string()
    .min(2, 'Vendor name must be at least 2 characters')
    .max(100, 'Vendor name is too long'),

  pickupTime: z
    .string()
    .min(1, 'Please specify a pickup time'),

  deliveryLocation: z
    .string()
    .min(5, 'Please provide a more specific delivery location')
    .max(300, 'Location description is too long'),

  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
