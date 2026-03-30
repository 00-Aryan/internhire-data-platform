'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  validateYear,
  validatePercentage,
} from '@/shared/validation/education';
import EducationCard from '../../profile/education/components/EducationCard';

interface TenthEducation {
  id: string;
  passingYear: number;
  percentageMarks: number;
  stream?: string | null;
}

interface Props {
  candidateId: string;
  tenthEducation: TenthEducation | null | undefined;
}

export default function TenthEducationSection({
  candidateId,
  tenthEducation,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const yearRef = useRef<HTMLInputElement>(null);
  const percentageRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (streamRef.current?.value && streamRef.current.value.length > 50) {
      toast.error('Stream must be less than 50 characters');
      return;
    }

    const year = Number(yearRef.current?.value);
    const percentage = Number(percentageRef.current?.value);

    const error =
      validateYear(year, 'Passing year') ||
      validatePercentage(percentage);

    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/candidate/education/tenth', {
        method: tenthEducation ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          passingYear: year,
          percentageMarks: percentage,
          stream: streamRef.current?.value || null,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to save');
        return;
      }

      toast.success('10th education saved');
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // FIX 1: Pass candidateId in the URL query string to match the API route
      const res = await fetch(`/api/candidate/education/tenth?candidateId=${candidateId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        // Log the actual error from the server for debugging
        const errorText = await res.text();
        console.error('Delete failed:', res.status, errorText);
        toast.error('Failed to delete 10th education');
        return;
      }

      // Specific success message
      toast.success('10th education removed successfully');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <EducationCard
      title="10th Standard"
      isEditing={showForm}
      onToggleEditing={() => setShowForm(!showForm)}
      hasData={!!tenthEducation && !isDeleting}
      loading={loading}
      isDeleting={isDeleting}
      onSave={handleSave}
      onDelete={handleDelete}
      summary={
        tenthEducation && (
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{tenthEducation.passingYear}</p>
              <p className="text-sm text-gray-500">Passing Year</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{tenthEducation.percentageMarks}%</p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
          </div>
        )
      }
    >
      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Passing Year</label>
          <input
            ref={yearRef}
            type="number"
            defaultValue={tenthEducation?.passingYear}
            placeholder="e.g. 2018"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Percentage</label>
          <input
            ref={percentageRef}
            type="number"
            step="0.01"
            defaultValue={tenthEducation?.percentageMarks}
            placeholder="e.g. 85.5"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Stream <span className="text-gray-400 font-normal">(Optional)</span></label>
        <input
          ref={streamRef}
          defaultValue={tenthEducation?.stream || ''}
          placeholder="e.g. Science, Commerce"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
        />
      </div>
    </EducationCard>
  );
}
