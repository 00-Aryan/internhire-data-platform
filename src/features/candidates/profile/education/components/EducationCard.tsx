// src/components/candidate/education/EducationCard.tsx
'use client';

import { ReactNode } from 'react';
import { useNotification } from '@/shared/notifications/useNotification';




interface Props {
  title: string;
  isEditing: boolean;
  onToggleEditing: () => void;
  hasData: boolean;
  loading: boolean;
  isDeleting?: boolean;
  onSave: () => void;
  onDelete?: () => void;
  children: ReactNode; // Form inputs
  summary: ReactNode; // Summary view content
}

export default function EducationCard({
  title,
  isEditing,
  onToggleEditing,
  hasData,
  loading,
  isDeleting = false,
  onSave,
  onDelete,
  children,
  summary
}: Props) {
  const { showConfirmation, hide } = useNotification();

  const handleDeleteClick = () => {
    if (!onDelete) return;
    showConfirmation(
      'Delete Education Details',
      'Are you sure you want to delete these details? This action cannot be undone.',
      () => {
        hide();
        onDelete();
      }
    );
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
      <header className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {(isEditing || !hasData) && (
          <button
            type="button"
            onClick={onToggleEditing}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isEditing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isEditing ? 'Cancel' : 'Add Details'}
          </button>
        )}
      </header>

      {isEditing && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}

          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      )}

      {hasData && !isEditing && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          {summary}
          
          <div className="flex gap-3 justify-end border-t border-gray-200 pt-3 mt-4">
            <button 
              onClick={onToggleEditing}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
            {onDelete && (
              <button 
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}