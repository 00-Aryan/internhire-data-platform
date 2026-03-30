import { z } from 'zod'

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  dob: z.string().optional().refine((date) => {
    if (!date) return true
    const birthDate = new Date(date)
    const age = (new Date().getFullYear() - birthDate.getFullYear())
    return age >= 18 && age <= 100
  }, 'Age must be between 18 and 100'),
  city: z.string().max(50).optional(),
  district: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal(''))
})

export const applicationSchema = z.object({
  jobId: z.string().uuid('Invalid job ID')
});

