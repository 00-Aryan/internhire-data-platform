import {
  ReadinessResult,
  UserProfileData,
  Capability,
} from './types';
import { checkCandidateReadiness } from './candidate.readiness';
import { checkRecruiterReadiness } from './recruiter.readiness';

interface CheckCapabilityParams {
  user: UserProfileData | null;
  capability: Capability;
}

export async function checkCapability({
  user,
  capability,
}: CheckCapabilityParams): Promise<ReadinessResult> {
  try {
    if (!user) {
      return {
        allowed: false,
        reason: 'PROFILE_INCOMPLETE',
        missing: ['User profile not found'],
      };
    }

    if (user.role === 'CANDIDATE' && user.candidateProfile) {
      return checkCandidateReadiness(user.candidateProfile, capability);
    }

    if (user.role === 'RECRUITER' && user.recruiterProfile) {
      return checkRecruiterReadiness(user.recruiterProfile, capability);
    }

    return {
      allowed: false,
      reason: 'PROFILE_INCOMPLETE',
      missing: ['Profile data incomplete'],
    };
  } catch (error) {
    console.error('[profile-readiness] Error in checkCapability:', error);
    return { allowed: true };
  }
}
