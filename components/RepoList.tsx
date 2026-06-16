'use client';

// components/RepoList.tsx
// On "Explore Files" click → navigates to file explorer page. 

import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { useRepos } from '@/store/githubStore';
import RepoCard from '@/components/RepoCard';
import { RepoCardSkeleton } from '@/components/Loader';
import type { GitHubRepo } from '@/types/github';

interface RepoListProps {
  username: string;
  repos: GitHubRepo[];
}

const SORT_OPTIONS = [
  { value: 'updated', label: 'Updated'  },
  { value: 'stars',   label: 'Stars'    },
  { value: 'name',    label: 'Name'     },
] as const;

export default function RepoList({ username, repos }: RepoListProps) {
  const router = useRouter();
  const {
    allRepos,
    repoStatus,
    repoSearch,
    sortBy,
    filterLanguage,
    setRepoSearch,
    setSortBy,
    setFilter,
    setCurrentRepo,
  } = useRepos();

  // Unique languages from all repos for filter dropdown
  const languages = [
    ...new Set(allRepos.map((r) => r.language).filter(Boolean)),
  ] as string[];

  function handleExplore(repo: GitHubRepo) {
    setCurrentRepo(repo);
    router.push(`/user/${username}/${repo.name}`);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Toolbar  */}
      <div className="flex flex-wrap gap-2">
        {/* Repo search */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Find a repository…"
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/15 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-violet-500"
          />
        </div>

        {/* Language filter */}
        {languages.length > 0 && (
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <select
              value={filterLanguage ?? ''}
              onChange={(e) => setFilter(e.target.value || null)}
              className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-xs font-medium text-zinc-600 outline-none transition focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <option value="">All languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sort */}
        <div className="flex rounded-lg border border-zinc-200 bg-white overflow-hidden dark:border-zinc-700 dark:bg-zinc-800">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                sortBy === opt.value
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats bar  */}
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <BookOpen className="h-3.5 w-3.5" />
          {repoStatus === 'loading'
            ? 'Loading repos…'
            : `${repos.length} of ${allRepos.length} repositories`}
        </p>
        {filterLanguage && (
          <button
            onClick={() => setFilter(null)}
            className="text-xs text-violet-600 hover:underline dark:text-violet-400"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* ── Loading  */}
      {repoStatus === 'loading' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <RepoCardSkeleton key={i} />)}
        </div>
      )}

      {/* ── Empty state */}
      {repoStatus === 'success' && repos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <BookOpen className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {repoSearch || filterLanguage ? 'No repos match your filter.' : 'No public repositories.'}
          </p>
          {(repoSearch || filterLanguage) && (
            <button
              onClick={() => { setRepoSearch(''); setFilter(null); }}
              className="mt-3 text-xs text-violet-600 hover:underline dark:text-violet-400"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Repo grid ───*/}
      {repoStatus === 'success' && repos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {repos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onExplore={handleExplore}
            />
          ))}
        </div>
      )}
    </div>
  );
}