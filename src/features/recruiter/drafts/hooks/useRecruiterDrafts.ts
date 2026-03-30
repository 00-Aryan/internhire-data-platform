'use client';

import { useEffect, useState } from 'react';
import type { JobType, WorkMode } from '@prisma/client';

/* ---------------- Types ---------------- */

export interface DraftJob {
  id: string;
  title: string;
  type: JobType | null;
  workMode: WorkMode | null;
  locationCity: string | null;
  isPaid: boolean | null;
  stipendAmount: number | null;
  stipendFrequency: string | null;
  createdAt: string;
}

/* ---------------- Hook ---------------- */

export function useRecruiterDrafts() {
  const [jobs, setJobs] = useState<DraftJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrafts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/recruiter/drafts/jobs');

        if (!response.ok) {
          throw new Error(`Failed with ${response.status}`);
        }

        const data = await response.json();
        setJobs(data.drafts ?? []);
      } catch (err) {
        console.error('[useRecruiterDrafts]', err);
        setError('Unable to load draft jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchDrafts();
  }, []);

  return {
    jobs,
    loading,
    error,
  };
}
