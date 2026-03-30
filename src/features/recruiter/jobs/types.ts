// =============================
// Recruiter profile (unchanged)
// =============================
export interface RecruiterProfile {
  id: string;
  jobsPostedThisMonth: number;
  jobPostLimit: number;
}


// Backend job payload (reference only)

export interface JobFormPayload {
  title: string;
  description: string;
  type: string;
  workMode: string;
  domain: string | null;
  locationCity: string | null;
  locationDistrict: string | null;
  locationState: string | null;
  deadline: string;
  startDate: string | null;
  endDate: string | null;
  officeDaysPerWeek: number | null;
  isPaid: boolean;
  stipendAmount: number | null;
  stipendFrequency: string | null;
  hasCertificate: boolean;
  customPhone: string | null;
  customEmail: string | null;
  status: string;
  requiredSkills: string[];
}


// Section props
// NOTE: initialJob is intentionally `any`
// to avoid tight Prisma coupling here.

export interface BasicInfoSectionProps {
  initialJob?: any;
}

export interface WorkDetailsSectionProps {
  initialJob?: any;
}

export interface LocationSectionProps {
  initialJob?: any;
}

export interface TimelineSectionProps {
  initialJob?: any;
}

export interface SettingsSectionProps {
  initialJob?: any;
}

export interface CompensationSectionProps {
  isPaid: boolean;
  setIsPaid: (value: boolean) => void;
  initialJob?: any;
}


// Main recruiter job form props

export interface RecruiterJobFormProps {
  initialJob?: any; // JobListing from Prisma (draft / published)
  showHeader?: boolean;
}
