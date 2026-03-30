'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

interface SkillSearchInputProps {
  onSelect(skill: Skill): void;
  disabledSkillIds: string[];
}

export default function SkillSearchInput({
  onSelect,
  disabledSkillIds,
}: SkillSearchInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* debounced search */
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/skills?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error();
        const data: Skill[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        toast.error('Unable to search skills');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Add skills
      </label>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search skills..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-sm max-h-56 overflow-y-auto">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>}

          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No skills found</div>
          )}

          {!loading &&
            results.map((skill) => {
              const disabled = disabledSkillIds.includes(skill.id);

              return (
                <button
                  key={skill.id}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    onSelect(skill);
                    setQuery('');
                    setResults([]);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {skill.name}
                  {skill.category && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({skill.category})
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
