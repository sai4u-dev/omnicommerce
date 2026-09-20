import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z.string().min(6, 'Password must be >=6 chars')
export const phoneSchema = z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits').or(z.string().transform(v => v.replace(/\D/g, '')).pipe(z.string().min(10).max(15)))
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'featured']).optional(),
  featured: z.enum(['true', 'false']).optional(),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'name required').max(100),
  email: emailSchema.transform(v => v.toLowerCase()),
  password: passwordSchema,
  phone: z.string().optional().nullable().transform(v => v ? v.replace(/\D/g, '') : null).refine(v => !v || (v.length >= 10 && v.length <= 15), 'Invalid phone'),
  role: z.enum(['user', 'vendor', 'delivery']).optional().default('user'),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

export const otpRequestSchema = z.object({
  identifier: z.string().min(1, 'identifier required'),
})

export const otpVerifySchema = z.object({
  identifier: z.string().min(1),
  otp: z.string().min(4).max(6),
  name: z.string().min(1).max(100).optional(),
})

export function validate(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const msg = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    const err = new Error(msg)
    err.statusCode = 400
    err.validation = result.error.errors
    throw err
  }
  return result.data
}
