'use client';
// components/RepoCard.tsx
// Single repository card — name, description, stats, language badge.

import { Star, GitFork, Eye, Scale, ExternalLink, FolderOpen } from 'lucide-react';
import { formatRelativeTime, getLanguageColor } from '@/lib/githubApi';
import type { GitHubRepo } from '@/types/github';

interface RepoCardProps {
  repo: GitHubRepo;
  onExplore: (repo: GitHubRepo) => void;
}

export default function RepoCard({ repo, onExplore }: RepoCardProps) {
  return (
    <article className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/50 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:hover:border-violet-600/50 dark:hover:shadow-violet-900/20">

      {/* ── Header  */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {/* Fork badge */}
          {repo.fork && (
            <span className="shrink-0 rounded-full border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:border-zinc-600 dark:text-zinc-500">
              fork
            </span>
          )}
          <h3 className="truncate text-sm font-semibold text-violet-600 dark:text-violet-400">
            {repo.name}
          </h3>
        </div>

        {/* Private / public badge */}
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            repo.private
              ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
              : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-400'
          }`}
        >
          {repo.private ? 'Private' : 'Public'}
        </span>
      </div>

      {/* ── Description */}
      <p className="mb-3 line-clamp-2 min-h-10 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {repo.description ?? 'No description provided.'}
      </p>

      {/* ── Topics  */}
      {repo.topics.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="text-[10px] text-zinc-400">+{repo.topics.length - 4}</span>
          )}
        </div>
      )}

      {/* ── Stats  */}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {/* Language */}
        {repo.language && (
          <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getLanguageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}

        {/* Stars */}
        <StatBadge icon={<Star className="h-3 w-3" />} value={formatStat(repo.stargazers_count)} />

        {/* Forks */}
        <StatBadge icon={<GitFork className="h-3 w-3" />} value={formatStat(repo.forks_count)} />

        {/* Watchers */}
        {repo.watchers_count > 0 && (
          <StatBadge icon={<Eye className="h-3 w-3" />} value={formatStat(repo.watchers_count)} />
        )}
        {/* License */}
        {repo.license && (
          <StatBadge icon={<Scale className="h-3 w-3" />} value={repo.license.spdx_id} />
        )}
        {/* Updated */}
        <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
          {formatRelativeTime(repo.updated_at)}
        </span>
      </div>

      {/* ── Action buttons  */}
      <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-700/50">
        <button
          onClick={() => onExplore(repo)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700 active:scale-95"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Explore Files
        </button>

        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          GitHub
        </a>
      </div>
    </article>
  );
}
// ── Sub-components 
function StatBadge({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
      {icon}
      {value}
    </span>
  );
}
// ── Helpers 
function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}