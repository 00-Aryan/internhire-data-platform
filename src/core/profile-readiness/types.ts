// Capabilities supported by profile readiness
export type Capability =
  | 'apply_to_job'
  | 'start_assessment'
  | 'post_job'
  | 'view_assessments';

// Reasons why an action may be blocked
export type BlockingReason =
  | 'PROFILE_INCOMPLETE'
  | 'SUBSCRIPTION_REQUIRED';

// Result returned by readiness checks
export interface ReadinessResult {
  allowed: boolean;
  reason?: BlockingReason;
  missing?: string[];
  metadata?: Record<string, any>;
}

// Unified profile data contract for readiness checks
export interface UserProfileData {
  userId: string;
  role: 'CANDIDATE' | 'RECRUITER';

  candidateProfile?: {
    id: string;
    dob: Date | null;

    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    phone: string | null;

    // Education
    tenthEducation: any;
    twelfthEducation: any;
    ugEducation: any[];
    pgEducation: any[];

    // Optional / future
    experience: any[];
    skills: any[];

  };

  recruiterProfile?: {
    id: string;
    department: string | null;
    designation: string | null;
    profileLink: string | null;

    user: {
      firstName: string | null;
      lastName: string | null;
    };

    establishment: {
      id: string;
      name: string;
      email: string | null;
      website: string | null;
      phone: string | null;
      type: string | null;
      address: string | null;
      city: string | null;
      district: string | null;
      state: string | null;
    };

    subscriptionExpiry: Date | null;
  };
}
