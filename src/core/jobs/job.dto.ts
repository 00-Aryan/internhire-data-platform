import { z } from 'zod';
import { JobStatus, JobType, WorkMode } from '@prisma/client';

export const BaseJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  type: z.nativeEnum(JobType),
  workMode: z.nativeEnum(WorkMode),
  domain: z.string().optional(),
  locationCity: z.string().optional(),
  locationDistrict: z.string().optional(),
  locationState: z.string().optional(),
  deadline: z.coerce.date(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  officeDaysPerWeek: z.number().int().min(1).max(7).optional(),
  isPaid: z.boolean().optional(),
  stipendAmount: z.number().int().positive().optional(),
  stipendFrequency: z.string().optional(),
  hasCertificate: z.boolean().optional(),
  customPhone: z.string().optional(),
  customEmail: z.string().email().optional(),
  requiredSkills: z.array(z.string().uuid()).optional(),
});

export const DraftJobSchema = BaseJobSchema.partial();

export const PublishJobSchema = BaseJobSchema.extend({
  isPaid: z.literal(true),
  stipendAmount: z.number().int().positive(),
  stipendFrequency: z.string(),
});

export type DraftJobDTO = z.infer<typeof DraftJobSchema>;
export type PublishJobDTO = z.infer<typeof PublishJobSchema>;
