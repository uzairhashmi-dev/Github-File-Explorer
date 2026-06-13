// app/page.tsx
// Home page — search landing screen.
// Server Component — interactive chips in separate client component.

import type { Metadata } from 'next';
import { Search, GitBranch, Eye, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import RecentSearchChips from '@/components/RecentSearchChips';

export const metadata: Metadata = {
  title: 'GitExplorer — Search GitHub Profiles',
  description: 'Search any GitHub user — explore repos and source code.',
};

const FEATURES = [
  { icon: Search,    label: 'Profile lookup'  },
  { icon: GitBranch, label: 'Repo browser'    },
  { icon: Eye,       label: 'File explorer'   },
  { icon: Star,      label: 'Stars & forks'   },
] as const;

const POPULAR = [
  'torvalds', 'gaearon', 'sindresorhus',
  'tj',       'yyx990803', 'addyosmani',
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-12 sm:px-6">

      <div className="w-full max-w-xl text-center animate-fade-up">

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 shadow-2xl shadow-zinc-900/40 dark:bg-zinc-100">
            <GithubSvg className="h-8 w-8 text-white dark:text-zinc-900" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-2 text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Git
          <span className="bg-linear-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
            Explorer
          </span>
        </h1>

        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
          Search any GitHub user — browse repos, explore files, read code.
        </p>

        {/* Search */}
        <div className="relative z-9999 flex justify-center animate-fade-up-delay">
          <SearchBar />
        </div>

        {/* Feature badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fade-up-delay">
          {FEATURES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Icon className="h-3 w-3 text-violet-500" />
              {label}
            </span>
          ))}
        </div>

        {/* Popular users */}
        <div className="mt-8 animate-fade-up-delay">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Popular profiles
          </p>
          <RecentSearchChips users={[...POPULAR]} />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-14 text-xs text-zinc-400 dark:text-zinc-600">
        Powered by{' '}
        <a
          href="https://docs.github.com/en/rest"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-violet-500"
        >
          GitHub REST API
        </a>{' '}
        · 60 req/hr free
      </p>
    </div>
  );
}

// Inline SVG — avoids lucide Github import issues
function GithubSvg({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}