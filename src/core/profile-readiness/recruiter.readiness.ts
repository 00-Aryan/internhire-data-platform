import { ReadinessResult, UserProfileData, Capability } from './types';

type RecruiterProfile = NonNullable<UserProfileData['recruiterProfile']>;

export function checkRecruiterReadiness(
  profile: UserProfileData['recruiterProfile'],
  capability: Capability
): ReadinessResult {
  if (!profile) {
    return {
      allowed: false,
      reason: 'PROFILE_INCOMPLETE',
      missing: ['Recruiter profile not found'],
    };
  }

  const safeProfile: RecruiterProfile = profile;
  const missing: string[] = [];

  switch (capability) {
    case 'post_job':
      return checkPostJobCapability(safeProfile, missing);

    case 'view_assessments':
      return checkViewAssessmentsCapability(safeProfile, missing);

    default:
      return { allowed: true };
  }
}

/* -------------------------------------------------------------------------- */
/* POST JOB (RECRUITER)                                                        */
/* -------------------------------------------------------------------------- */

function checkPostJobCapability(
  profile: RecruiterProfile,
  missing: string[]
): ReadinessResult {
  missing.push(
    ...checkBasicRecruiterIdentity(profile),
    ...checkRecruiterCredibility(profile)
  );

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
/* VIEW ASSESSMENTS (RECRUITER)                                                */
/* -------------------------------------------------------------------------- */

function checkViewAssessmentsCapability(
  profile: RecruiterProfile,
  missing: string[]
): ReadinessResult {
  missing.push(...checkBasicRecruiterIdentity(profile));

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
/* IDENTITY CHECKS                                                             */
/* -------------------------------------------------------------------------- */

function checkBasicRecruiterIdentity(
  profile: RecruiterProfile
): string[] {
  const missing: string[] = [];

  // Display name (not legal identity)
  if (!profile.user.firstName && !profile.user.lastName) {
    missing.push('Recruiter display name');
  }

  if (!profile.designation) {
    missing.push('Professional designation');
  }

  if (!profile.department) {
    missing.push('Department');
  }

  if (!profile.establishment?.name) {
    missing.push('Organization name');
  }

  return missing;
}

/* -------------------------------------------------------------------------- */
/* CREDIBILITY CHECKS                                                          */
/* -------------------------------------------------------------------------- */

function checkRecruiterCredibility(
  profile: RecruiterProfile
): string[] {
  const missing: string[] = [];
  const { establishment } = profile;

  if (establishment) {
    if (!establishment.type) {
      missing.push('Organization type');
    }
    if (!establishment.email) {
      missing.push('Official email');
    }
    if (!establishment.phone) {
      missing.push('Organization phone');
    }
    if (!establishment.address) {
      missing.push('Organization address');
    }
    if (!establishment.city) {
      missing.push('City');
    }
    if (!establishment.district) {
      missing.push('District');
    }
    if (!establishment.state) {
      missing.push('State');
    }
  }

  return missing;
}
