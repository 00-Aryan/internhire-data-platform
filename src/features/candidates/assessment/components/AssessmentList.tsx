"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface Subdomain {
  id: string;
  name: string;
  domain: {
    name: string;
  };
}

interface Domain {
  id: string;
  name: string;
}

export default function AssessmentList({ hasAccess }: { hasAccess: boolean }) {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Subdomain[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [subdomainOptions, setSubdomainOptions] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedSubdomain, setSelectedSubdomain] = useState('');
  const [stages, setStages] = useState<Record<string, 'start' | 'resume' | 'completed'>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const subdomainAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch('/api/candidate/assessment/domains')
      .then(res => res.ok && res.json())
      .then(setDomains)
      .catch(() => {});
  }, []);

  const fetchStagesForBatch = async (items: Subdomain[]) => {
    const newStages: Record<string, 'start' | 'resume' | 'completed'> = {};
    await Promise.all(
      items.map(async (sub) => {
        try {
          const res = await fetch(`/api/candidate/assessment/stage?subdomainId=${sub.id}`);
          const data = await res.json();
          newStages[sub.id] = data.stage;
        } catch {
          newStages[sub.id] = 'start';
        }
      })
    );
    setStages(prev => ({ ...prev, ...newStages }));
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    abortControllerRef.current?.abort();
    subdomainAbortControllerRef.current?.abort();

    setSelectedDomain(e.target.value);
    setSelectedSubdomain('');
    setSubdomainOptions([]);
    setAssessments([]);
    setPage(1);
    setHasMore(true);

    if (!e.target.value) return;

    const controller = new AbortController();
    subdomainAbortControllerRef.current = controller;

    fetch(`/api/candidate/assessment/subdomain?domainId=${e.target.value}`, { signal: controller.signal })
      .then(res => res.ok && res.json())
      .then(setSubdomainOptions)
      .catch(() => {});
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    abortControllerRef.current?.abort();
    setSelectedSubdomain(e.target.value);
    setAssessments([]);
    setPage(1);
    setHasMore(true);
  };

  const fetchAssessments = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (selectedDomain) params.append('domainId', selectedDomain);
      if (selectedSubdomain) params.append('subdomainId', selectedSubdomain);

      const res = await fetch(`/api/candidate/assessment?${params}`, { signal: controller.signal });
      if (!res.ok) throw new Error();

      const data = await res.json();
      setAssessments(prev => [...prev, ...data.data]);
      setHasMore(data.meta.hasMore);
      fetchStagesForBatch(data.data);
      if (data.meta.hasMore) setPage(prev => prev + 1);
    } catch {}
    finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [page, hasMore, isLoading, selectedDomain, selectedSubdomain]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) fetchAssessments();
    }, { threshold: 0.1 });

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [fetchAssessments]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleStartAssessment = (sub: Subdomain) => {
    if (!hasAccess) {
      toast.error('Assessment is locked.');
      return;
    }
    if (stages[sub.id] === 'completed') {
      toast.info('You have already completed this assessment.');
      return;
    }
    router.push(`/candidate/assessment/${sub.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans">
      <h1 className="text-4xl font-bold mb-2">Assessment zone</h1>

      <div className="space-y-4">
        {assessments.map(sub => {
          const stage = stages[sub.id];
          const isExpanded = expandedId === sub.id;

          return (
            <div key={sub.id}>
              {/* ROW — NO ROUTING HERE */}
              <div
                className="flex items-center bg-[#f5f5f5] rounded-lg p-4 hover:bg-[#e0e0e0]"
              >
                <button
                  onClick={(e) => toggleExpand(sub.id, e)}
                  className="w-8 h-8 mr-4 flex items-center justify-center"
                >
                  <span
                    className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`}
                  >
                    +
                  </span>
                </button>

                <div className="flex-1 grid grid-cols-2">
                  <div className="font-bold">{sub.domain.name}</div>
                  <div className="text-gray-600">{sub.name}</div>
                </div>
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="ml-12 mt-2 bg-white p-6 rounded-lg border-l-4 border-blue-500">
                    <p className="mb-4 text-sm text-gray-600">
                      Prove your skills in {sub.name}.
                    </p>

                    {hasAccess ? (
                      stage === 'completed' ? (
                        <span className="text-green-600 font-medium">Completed</span>
                      ) : (
                        <button
                          onClick={() => handleStartAssessment(sub)}
                          className={`px-6 py-2 text-white rounded-lg ${
                            stage === 'resume'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {stage === 'resume' ? 'Resume Assessment' : 'Start Assessment'}
                        </button>
                      )
                    ) : (
                      <span className="text-gray-400">Locked</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div ref={observerTarget} className="h-20 flex justify-center items-center">
        {isLoading && <span>Loading…</span>}
      </div>
    </div>
  );
}
