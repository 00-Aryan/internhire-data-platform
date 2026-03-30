'use client';

import { useEffect, useState } from 'react';

interface Application {
  id: string;
  jobId: string;
  appliedAt: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | string;
  job: {
    id: string;
    title: string;
    locationCity: string;
  };
  candidate: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    pgEducation?: Array<{ courseName: string }>;
    ugEducation?: Array<{ courseName: string }>;
  };
}

export function useJobApplications(jobId: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recruiter/jobs/${jobId}/applications`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        setApplications(data.applications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplications();
    }
  }, [jobId]);

  return { applications, loading, error };
}
