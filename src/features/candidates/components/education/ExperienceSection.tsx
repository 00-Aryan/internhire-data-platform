'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import EducationCard from '../../profile/education/components/EducationCard';
import { useNotification } from '@/shared/notifications/useNotification';

/* ---------- Types ---------- */
interface Experience {
  id: string;
  companyName: string;
  roleTitle: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
}

interface Props {
  candidateId: string;
  experience: Experience[];
}

/* ---------- Component ---------- */
export default function ExperienceSection({
  candidateId,
  experience,
}: Props) {
  const router = useRouter();
  const { showConfirmation, hide } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (
      !companyRef.current ||
      !roleRef.current ||
      !startDateRef.current
    ) {
      return;
    }

    const startDate = startDateRef.current.value;
    const endDate = endDateRef.current?.value;

    if (!startDate) {
      toast.error('Start date is required');
      return;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        candidateId,
        companyName: companyRef.current.value,
        roleTitle: roleRef.current.value,
        description: descriptionRef.current?.value || null,
        startDate: startDateRef.current.value,
        endDate: endDateRef.current?.value || null,
      };

      const res = await fetch('/api/candidate/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to add experience');
        return;
      }

      toast.success('Experience added');
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    showConfirmation(
      'Delete Experience',
      'Are you sure you want to delete this experience entry?',
      async () => {
        hide();
        try {
          const res = await fetch(`/api/candidate/experience?id=${id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            toast.error('Failed to delete');
            return;
          }

          toast.success('Deleted');
          router.refresh();
        } catch {
          toast.error('An error occurred');
        }
      }
    );
  };

  return (
    <EducationCard
      title="Work Experience"
      isEditing={showForm}
      onToggleEditing={() => setShowForm(!showForm)}
      hasData={experience.length > 0}
      loading={isSubmitting}
      onSave={handleSave}
      summary={
        <div className="space-y-4">
          {experience.map((exp) => (
            <div
              key={exp.id}
              className="flex justify-between items-start border-b border-gray-100 last:border-0 pb-4 last:pb-0"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{exp.roleTitle}</h3>
                <p className="text-sm text-gray-600">{exp.companyName}</p>
                {exp.description && (
                  <p className="text-sm text-gray-500 mt-1 max-w-md">{exp.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(exp.startDate)} –{' '}
                  {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(exp.id)}
                className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Company Name *</label>
            <input
              ref={companyRef}
              placeholder="e.g. Google"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role / Title *</label>
            <input
              ref={roleRef}
              placeholder="e.g. Software Engineer Intern"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            ref={descriptionRef}
            rows={3}
            placeholder="Briefly describe your responsibilities..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Date *</label>
            <input
              ref={startDateRef}
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <input
              ref={endDateRef}
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
            />
            <p className="text-xs text-gray-500">Leave blank if currently working</p>
          </div>
        </div>
      </div>
    </EducationCard>
  );
}
