// src/core/jobs/jobFormatters.ts
import { JobType, WorkMode } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/* Job Type                                                                   */
/* -------------------------------------------------------------------------- */

export function formatJobType(type?: JobType | null): string {
  if (!type) return 'Not specified';

  switch (type) {
    case JobType.INTERNSHIP_FULL_TIME:
      return 'Internship (Full Time)';
    case JobType.INTERNSHIP_PART_TIME:
      return 'Internship (Part Time)';
    case JobType.PROJECT_WORK_FULL_TIME:
      return 'Project Work (Full Time)';
    case JobType.PROJECT_WORK_PART_TIME:
      return 'Project Work (Part Time)';
  }
}

/* -------------------------------------------------------------------------- */
/* Work Mode                                                                  */
/* -------------------------------------------------------------------------- */

export function formatWorkMode(workMode?: WorkMode | null): string {
  if (!workMode) return 'Not specified';

  switch (workMode) {
    case WorkMode.IN_OFFICE:
      return 'In-office';

    case WorkMode.HYBRID:
      return 'Hybrid';

    case WorkMode.REMOTE_ANYWHERE:
      return 'Remote (Anywhere)';

    case WorkMode.REMOTE_SPECIFIC_CITY:
      return 'Remote (Specific City)';

    case WorkMode.FIELD_WORK:
      return 'Field Work';
  }
}

/* -------------------------------------------------------------------------- */
/* Stipend / Compensation                                                     */
/* -------------------------------------------------------------------------- */

export function formatStipend(
  isPaid?: boolean | null,
  amount?: number | null,
  frequency?: string | null
): string {
  if (isPaid === false) return 'Unpaid';
  if (!isPaid) return 'Compensation not set';
  if (!amount) return 'Paid';

  const frequencyText =
    frequency === 'PER_MONTH'
      ? 'per month'
      : frequency === 'PER_WEEK'
      ? 'per week'
      : frequency === 'ONE_TIME'
      ? 'one-time'
      : 'per project';

  return `₹ ${amount} ${frequencyText}`;
}
