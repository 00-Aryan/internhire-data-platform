// src/components/candidate/education/TwelfthEducationSection.tsx
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import EducationCard from '../../profile/education/components/EducationCard';
import {
  validateYear,
  validatePercentage,
  validateRequiredText,
} from '@/shared/validation/education';

/* ---------- Types ---------- */
interface TwelfthEducation {
  id: string;
  passingYear: number;
  percentageMarks: number;
  stream: string;
}

interface Props {
  candidateId: string;
  twelfthEducation: TwelfthEducation | null | undefined;
}

/* ---------- Component ---------- */
export default function TwelfthEducationSection({
  candidateId,
  twelfthEducation,
}: Props) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const yearRef = useRef<HTMLInputElement>(null);
  const percentageRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<HTMLInputElement>(null);

  /* ---------- Save ---------- */
  const handleSave = async () => {
    const year = Number(yearRef.current?.value);
    const percentage = Number(percentageRef.current?.value);
    const stream = streamRef.current?.value;

    const error =
      validateYear(year, 'Passing year') ||
      validatePercentage(percentage) ||
      validateRequiredText(stream, 'Stream');

    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/candidate/education/twelfth', {
        method: twelfthEducation ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          passingYear: year,
          percentageMarks: percentage,
          stream,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to save');
        return;
      }

      toast.success('12th education saved');
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/candidate/education/twelfth', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });

      if (!res.ok) {
        toast.error('Failed to delete');
        return;
      }

      toast.success('12th education removed');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <EducationCard
      title="12th Standard"
      isEditing={isEditing}
      onToggleEditing={() => setIsEditing(!isEditing)}
      hasData={!!twelfthEducation && !isDeleting}
      loading={loading}
      isDeleting={isDeleting}
      onSave={handleSave}
      onDelete={handleDelete}
      summary={
        twelfthEducation && (
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">
                {twelfthEducation.passingYear}
              </p>
              <p className="text-sm text-gray-500">Passing Year</p>
            </div>

            <div className="text-center">
              <p className="font-semibold text-gray-900">
                {twelfthEducation.stream}
              </p>
              <p className="text-sm text-gray-500">Stream</p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {twelfthEducation.percentageMarks}%
              </p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
          </div>
        )
      }
    >
      {/* ---------- Form Inputs ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Passing Year
          </label>
          <input
            ref={yearRef}
            type="number"
            defaultValue={twelfthEducation?.passingYear}
            placeholder="e.g. 2020"
            className="w-full px-4 py-3 rounded-xl border border-gray-200
                       focus:border-gray-900 focus:ring-4 focus:ring-gray-100
                       outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Percentage
          </label>
          <input
            ref={percentageRef}
            type="number"
            step="0.01"
            defaultValue={twelfthEducation?.percentageMarks}
            placeholder="e.g. 88.5"
            className="w-full px-4 py-3 rounded-xl border border-gray-200
                       focus:border-gray-900 focus:ring-4 focus:ring-gray-100
                       outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Stream
        </label>
        <input
          ref={streamRef}
          defaultValue={twelfthEducation?.stream}
          placeholder="Science / Commerce / Arts"
          className="w-full px-4 py-3 rounded-xl border border-gray-200
                     focus:border-gray-900 focus:ring-4 focus:ring-gray-100
                     outline-none transition-all"
        />
      </div>
    </EducationCard>
  );
}
