import { ReadinessResult, UserProfileData, Capability } from './types';

type CandidateProfile = NonNullable<UserProfileData['candidateProfile']>;

export function checkCandidateReadiness(
  profile: UserProfileData['candidateProfile'],
  capability: Capability
): ReadinessResult {
  if (!profile) {
    return {
      allowed: false,
      reason: 'PROFILE_INCOMPLETE',
      missing: ['Candidate profile not found'],
    };
  }

  // 🔒 From here on, profile is guaranteed
  const safeProfile: CandidateProfile = profile;
  const missing: string[] = [];

  if (capability === 'apply_to_job') {
    return checkApplyToJobCapability(safeProfile, missing);
  }

  if (capability === 'start_assessment') {
    return checkStartAssessmentCapability(safeProfile, missing);
  }

  return { allowed: true };
}

/* -------------------------------------------------------------------------- */
/* APPLY TO JOB (CANDIDATE)                                                    */
/* -------------------------------------------------------------------------- */

function checkApplyToJobCapability(
  profile: CandidateProfile,
  missing: string[]
): ReadinessResult {
  checkIdentityAndContact(profile, missing);
  checkEducationForApplication(profile, missing);

  if (missing.length > 0) {
    return {
      allowed: false,
      reason: 'PROFILE_INCOMPLETE',
      missing,
    };
  }

  return { allowed: true };
}

/* -------------------------------------------------------------------------- */
/* START ASSESSMENT (CANDIDATE)                                                */
/* -------------------------------------------------------------------------- */

function checkStartAssessmentCapability(
  profile: CandidateProfile,
  missing: string[]
): ReadinessResult {
  checkIdentityAndContact(profile, missing);
  checkEducationForApplication(profile, missing);

  if (missing.length > 0) {
    return {
      allowed: false,
      reason: 'PROFILE_INCOMPLETE',
      missing,
    };
  }

  return { allowed: true };
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function checkIdentityAndContact(
  profile: CandidateProfile,
  missing: string[]
) {
  if (!profile.user.firstName || !profile.user.lastName) {
    missing.push('Full legal name');
  }

  if (!profile.user.email) {
    missing.push('Email address');
  }

  // Phone number is required for applying to jobs
  if (!profile.phone) {
    missing.push('Contact phone number');
  }

  if (!profile.dob) {
    missing.push('Date of birth');
  }
}

function checkEducationForApplication(
  profile: CandidateProfile,
  missing: string[]
) {
  if (!profile.tenthEducation) {
    missing.push('Secondary school details (10th)');
  }

  if (!profile.twelfthEducation) {
    missing.push('Higher secondary details (12th)');
  }

  const hasUG =
    Array.isArray(profile.ugEducation) && profile.ugEducation.length > 0;

  if (!hasUG) {
    missing.push('Undergraduate education details');
  }

  // UG CGPA is intentionally NOT checked
}
