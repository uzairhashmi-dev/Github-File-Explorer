'use client';

// components/LanguageBar.tsx
// Horizontal colored bar showing language breakdown of all repos.

import { processLanguages } from '@/lib/githubApi';
import type { GitHubLanguages } from '@/types/github';

interface LanguageBarProps {
  languages: GitHubLanguages;
}

export default function LanguageBar({ languages }: LanguageBarProps) {
  const stats = processLanguages(languages);

  if (stats.length === 0) return null;

  return (
    <div className="animate-fade-in rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-800/60">

      <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        Languages
      </h3>

      {/* ── Colored bar  */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {stats.map((lang) => (
          <div
            key={lang.name}
            title={`${lang.name} ${lang.percentage}%`}
            style={{
              width: `${lang.percentage}%`,
              backgroundColor: lang.color,
            }}
            className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      {/* ── Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {stats.map((lang) => (
          <div key={lang.name} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              {lang.name}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {lang.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}