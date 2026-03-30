'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  validateYear,
  validateRequiredText,
  validateCGPA,
} from '@/shared/validation/education';
import EducationCard from '../../profile/education/components/EducationCard';

interface PGEducation {
  id: string;
  courseName: string;
  department?: string | null;
  joinYear?: number | null;
  currentYear?: number | null;
  completionYear: number;
  cgpa?: number | null;
}

interface Props {
  candidateId: string;
  pgEducation: PGEducation[];
}

export default function PGEducationSection({
  candidateId,
  pgEducation,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const courseRef = useRef<HTMLInputElement>(null);
  const departmentRef = useRef<HTMLInputElement>(null);
  const joinYearRef = useRef<HTMLInputElement>(null);
  const currentYearRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const cgpaRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    const course = courseRef.current?.value;
    const department = departmentRef.current?.value || null;
    const joinYear = joinYearRef.current?.value ? Number(joinYearRef.current.value) : null;
    const currentYear = currentYearRef.current?.value ? Number(currentYearRef.current.value) : null;
    const year = Number(yearRef.current?.value);
    const cgpa = cgpaRef.current?.value
      ? Number(cgpaRef.current.value)
      : null;

    const error =
      validateRequiredText(course, 'Course name') ||
      validateYear(year, 'Completion year') ||
      (joinYear ? validateYear(joinYear, 'Join year') : null) ||
      (cgpa !== null ? validateCGPA(cgpa) : null);

    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/candidate/education/pg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          courseName: course,
          department,
          joinYear,
          currentYear,
          completionYear: year,
          cgpa,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to add');
        return;
      }

      toast.success('PG added');
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <EducationCard
      title="Postgraduate"
      isEditing={showForm}
      onToggleEditing={() => setShowForm(!showForm)}
      hasData={pgEducation.length > 0}
      loading={loading}
      onSave={handleAdd}
      summary={
        <div className="space-y-4">
          {pgEducation.map((edu) => (
            <div key={edu.id} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <div>
                <p className="font-semibold text-gray-900">{edu.courseName}</p>
                {edu.department && <p className="text-sm text-gray-600">{edu.department}</p>}
                <p className="text-sm text-gray-500">
                  {edu.joinYear ? `${edu.joinYear} - ` : ''}{edu.completionYear}
                </p>
              </div>
              {edu.cgpa && (
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{edu.cgpa}</p>
                  <p className="text-sm text-gray-500">CGPA</p>
                </div>
              )}
            </div>
          ))}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Course Name</label>
            <input 
              ref={courseRef} 
              placeholder="e.g. M.Tech" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Department <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input 
              ref={departmentRef} 
              placeholder="e.g. Computer Science" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Join Year <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input ref={joinYearRef} type="number" placeholder="e.g. 2022" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Year <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input ref={currentYearRef} type="number" placeholder="e.g. 2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Completion Year</label>
            <input ref={yearRef} type="number" placeholder="e.g. 2024" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CGPA <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input ref={cgpaRef} type="number" step="0.01" placeholder="e.g. 8.5" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all" />
          </div>
        </div>
      </div>
    </EducationCard>
  );
}
