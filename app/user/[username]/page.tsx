'use client';

// app/user/[username]/page.tsx
// Profile results page — profile card + language bar + repo list.
// Reads from Zustand store — auto-fetches on mount if needed.

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

import { useUserData, useRepos, useGitHubStore } from '@/store/githubStore';
import ProfileCard from '@/components/ProfileCard';
import RepoList from '@/components/RepoList';
import LanguageBar from '@/components/LanguageBar';
import SearchBar from '@/components/SearchBar';
import { FullPageSkeleton } from '@/components/Loader';

export default function UserPage() {
  const params   = useParams();
  const router   = useRouter();
  const username = typeof params.username === 'string' ? params.username : '';

  const { user, userStatus, userError, fetchUser } = useUserData();
  const { repos } = useRepos();
  const languages = useGitHubStore((s) => s.languages);

  // Fetch if username changed or store is empty
  useEffect(() => {
    if (!username) return;
    if (user?.login.toLowerCase() !== username.toLowerCase()) {
      fetchUser(username);
    }
  }, [username, user, fetchUser]);

  // ── Loading 
  if (userStatus === 'loading' || userStatus === 'idle') {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 relative flex justify-center">
          <SearchBar />
        </div>
        <FullPageSkeleton />
      </div>
    );
  }

  // ── Error 
  if (userStatus === 'error') {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
          </div>
          <h2 className="mb-1.5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            User not found
          </h2>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            {userError ?? `"${username}" does not exist on GitHub.`}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => fetchUser(username)}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success 
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8sticky top-14 z-40 bg-zinc-50/90 backdrop-blur-sm py-3 dark:bg-[#0d1117]/90 border-b border-zinc-200/50 dark:border-zinc-800/50">

      {/* Search bar */}
      <div className="mb-6 flex justify-center animate-fade-in">
        <SearchBar />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

        {/* Left column — profile + language bar */}
        <div className="space-y-4">
          <ProfileCard user={user} />
          {Object.keys(languages).length > 0 && (
            <LanguageBar languages={languages} />
          )}
        </div>

        {/* Right column — repos */}
        <div className="animate-fade-up-delay">
          <RepoList username={username} repos={repos} />
        </div>
      </div>
    </div>
  );
}