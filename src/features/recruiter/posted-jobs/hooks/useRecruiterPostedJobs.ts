'use client';

import { useEffect, useState } from 'react';
import type { JobType, JobStatus } from '@prisma/client';

/* ---------------- Types ---------------- */

export interface PostedJob {
  id: string;
  title: string;
  type: JobType;              // ✅ strong enum
  locationCity: string | null;
  isPaid: boolean;
  stipendAmount: number | null;
  status: JobStatus;          // ✅ strong enum
  recruiter: {
    establishment: {
      name: string;
    };
  };
  _count?: {
    applications: number;
  };
}

/* ---------------- Hook ---------------- */

export function useRecruiterPostedJobs() {
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPostedJobs() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/recruiter/jobs');

        if (!response.ok) {
          throw new Error(`Failed to fetch jobs (${response.status})`);
        }

        const data: PostedJob[] = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching posted jobs:', err);
        setError('Unable to load posted jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPostedJobs();
  }, []);

  /* ---------------- Helpers ---------------- */



  const formatStipend = (isPaid: boolean, amount: number | null) => {
    if (!isPaid) return 'Unpaid';
    if (!amount) return 'Paid';
    return `₹ ${amount} per month`;
  };

  return {
    jobs,
    loading,
    error,
    formatStipend,
  };
}

