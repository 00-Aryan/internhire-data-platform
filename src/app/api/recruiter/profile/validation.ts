import { z, ZodIssueCode } from "zod";
import { EstablishmentType } from "@prisma/client";

// Remove the custom error map for now - it's causing type issues
// We can handle custom error messages directly in the schema definitions

const establishmentSchema = z.object({
  type: z.nativeEnum(EstablishmentType).optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  establishmentPhone: z
    .string()
    .regex(/^\d{10}$/, "Invalid establishment phone number format. Please enter a 10-digit number.")
    .optional()
    .or(z.literal("")),
  establishmentEmail: z.string().email("Invalid establishment email").optional().or(z.literal("")),
  cin: z.string().optional(),
  gst: z.string().optional(),
});

const recruiterProfileSchema = z.object({
  name: z.string().min(1, "Full name cannot be empty."),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Invalid phone number format. Please enter a 10-digit number.")
    .optional()
    .or(z.literal("")),
  designation: z.string().min(1, "Designation cannot be empty."),
  department: z.string().optional(),
  profileLink: z.string().url("Invalid profile link URL").optional().or(z.literal("")),
  establishment: establishmentSchema.optional(),
  password: z.string().optional(),
});

export function validateRecruiterProfileRequest(body: unknown) {
  const result = recruiterProfileSchema.partial().safeParse(body);
  
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.issues.map((issue) => issue.message).join("; "),
    };
  }
  
  return {
    isValid: true,
    error: null,
    data: result.data,
  };
}