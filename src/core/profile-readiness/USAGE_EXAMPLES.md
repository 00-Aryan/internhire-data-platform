/**
 * USAGE EXAMPLE: How to integrate readiness checks into actual pages
 * 
 * This file shows how to use the profile-readiness feature in real page components.
 */

// ============================================
// EXAMPLE 1: Job Details Page (Candidate)
// ============================================

/*
File: src/app/(main)/candidate/internships/details/[jobId]/page.tsx

'use client';

import { useSession } from '@/hooks/useSession';
import { ApplyButton } from '@/core/profile-readiness/examples/ApplyButton.example';
import type { UserProfileData } from '@/core/profile-readiness/types';

export default function JobDetailsPage({ params }) {
  const { user } = useSession();
  const [job, setJob] = useState(null);

  // Build UserProfileData from session user
  const userProfileData: UserProfileData | null = user && user.candidateProfile 
    ? {
        userId: user.id,
        role: 'CANDIDATE',
        candidateProfile: {
          id: user.candidateProfile.id,
          dob: user.candidateProfile.dob,
          city: user.candidateProfile.city,
          state: user.candidateProfile.state,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          tenthEducation: user.candidateProfile.tenthEducation,
          twelfthEducation: user.candidateProfile.twelfthEducation,
          ugEducation: user.candidateProfile.ugEducation,
          pgEducation: user.candidateProfile.pgEducation,
          experience: user.candidateProfile.experience,
          skills: user.candidateProfile.skills,
          internshipsSubscriptionExpiry: user.candidateProfile.internshipsSubscriptionExpiry,
          assessmentsSubscriptionExpiry: user.candidateProfile.assessmentsSubscriptionExpiry,
        },
      }
    : null;

  return (
    <div className="job-details">
      <h1>{job?.title}</h1>
      
      {/* Use ApplyButton with readiness check */}
      <ApplyButton
        jobId={job.id}
        candidateId={user?.candidateProfile?.id}
        jobTitle={job.title}
        companyName={job.company?.name}
        user={userProfileData}
      />
    </div>
  );
}
*/

// ============================================
// EXAMPLE 2: Assessments Page (Candidate)
// ============================================

/*
File: src/app/(main)/candidate/assessments/page.tsx

'use client';

import { useSession } from '@/hooks/useSession';
import { StartAssessmentButton } from '@/core/profile-readiness/examples/StartAssessmentButton.example';
import type { UserProfileData } from '@/core/profile-readiness/types';

export default function AssessmentsPage() {
  const { user } = useSession();
  const [assessments, setAssessments] = useState([]);

  const userProfileData: UserProfileData | null = user && user.candidateProfile 
    ? {
        userId: user.id,
        role: 'CANDIDATE',
        candidateProfile: {
          id: user.candidateProfile.id,
          dob: user.candidateProfile.dob,
          city: user.candidateProfile.city,
          state: user.candidateProfile.state,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          tenthEducation: user.candidateProfile.tenthEducation,
          twelfthEducation: user.candidateProfile.twelfthEducation,
          ugEducation: user.candidateProfile.ugEducation,
          pgEducation: user.candidateProfile.pgEducation,
          experience: user.candidateProfile.experience,
          skills: user.candidateProfile.skills,
          internshipsSubscriptionExpiry: user.candidateProfile.internshipsSubscriptionExpiry,
          assessmentsSubscriptionExpiry: user.candidateProfile.assessmentsSubscriptionExpiry,
        },
      }
    : null;

  return (
    <div className="assessments-grid">
      {assessments.map(assessment => (
        <div key={assessment.id} className="assessment-card">
          <h3>{assessment.title}</h3>
          
          {/* StartAssessmentButton checks education profile */}
          <StartAssessmentButton
            assessmentId={assessment.id}
            user={userProfileData}
          />
        </div>
      ))}
    </div>
  );
}
*/

// ============================================
// EXAMPLE 3: Subscription Page (Recruiter)
// ============================================

/*
File: src/app/(main)/recruiter/subscription/page.tsx

'use client';

import { useSession } from '@/hooks/useSession';
import { PaymentButton } from '@/core/profile-readiness/examples/PaymentButton.example';
import type { UserProfileData } from '@/core/profile-readiness/types';

export default function SubscriptionPage() {
  const { user } = useSession();
  const [plans, setPlans] = useState([]);

  const userProfileData: UserProfileData | null = user && user.recruiterProfile 
    ? {
        userId: user.id,
        role: 'RECRUITER',
        recruiterProfile: {
          id: user.recruiterProfile.id,
          department: user.recruiterProfile.department,
          designation: user.recruiterProfile.designation,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
          },
          establishment: {
            id: user.recruiterProfile.establishment.id,
            name: user.recruiterProfile.establishment.name,
          },
          subscriptionExpiry: user.recruiterProfile.subscriptionExpiry,
        },
      }
    : null;

  return (
    <div className="plans-grid">
      {plans.map(plan => (
        <div key={plan.id} className="plan-card">
          <h3>{plan.name}</h3>
          <p>{plan.price}</p>
          
          {/* PaymentButton checks profile before payment */}
          <PaymentButton
            planId={plan.id}
            planName={plan.name}
            planPrice={plan.price}
            user={userProfileData}
          />
        </div>
      ))}
    </div>
  );
}
*/

// ============================================
// HELPER: Build UserProfileData from Session
// ============================================

/*
You can create a helper utility to build UserProfileData:

File: src/lib/profile-readiness-helpers.ts

import type { UserProfileData } from '@/core/profile-readiness/types';
import type { User } from '@prisma/client';

export function buildUserProfileData(
  user: User & {
    candidateProfile?: any;
    recruiterProfile?: any;
  }
): UserProfileData | null {
  if (!user) return null;

  if (user.candidateProfile) {
    return {
      userId: user.id,
      role: 'CANDIDATE',
      candidateProfile: {
        id: user.candidateProfile.id,
        dob: user.candidateProfile.dob,
        city: user.candidateProfile.city,
        state: user.candidateProfile.state,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        tenthEducation: user.candidateProfile.tenthEducation,
        twelfthEducation: user.candidateProfile.twelfthEducation,
        ugEducation: user.candidateProfile.ugEducation,
        pgEducation: user.candidateProfile.pgEducation,
        experience: user.candidateProfile.experience,
        skills: user.candidateProfile.skills,
        internshipsSubscriptionExpiry: user.candidateProfile.internshipsSubscriptionExpiry,
        assessmentsSubscriptionExpiry: user.candidateProfile.assessmentsSubscriptionExpiry,
      },
    };
  }

  if (user.recruiterProfile) {
    return {
      userId: user.id,
      role: 'RECRUITER',
      recruiterProfile: {
        id: user.recruiterProfile.id,
        department: user.recruiterProfile.department,
        designation: user.recruiterProfile.designation,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        establishment: {
          id: user.recruiterProfile.establishment.id,
          name: user.recruiterProfile.establishment.name,
        },
        subscriptionExpiry: user.recruiterProfile.subscriptionExpiry,
      },
    };
  }

  return null;
}

// Then use in components:
const userProfileData = buildUserProfileData(user);
*/
