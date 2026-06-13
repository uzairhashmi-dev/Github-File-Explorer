'use client';

// components/RecentSearchChips.tsx
// Clickable user chips — fills search and navigates to profile page.

import { useRouter } from 'next/navigation';
import { useGitHubStore } from '@/store/githubStore';

interface RecentSearchChipsProps {
  users: string[];
}

export default function RecentSearchChips({ users }: RecentSearchChipsProps) {
  const router      = useRouter();
  const fetchUser   = useGitHubStore((s) => s.fetchUser);
  const addRecent   = useGitHubStore((s) => s.addRecentSearch);
  const setQuery    = useGitHubStore((s) => s.setSearchQuery);

  function handleClick(username: string) {
    setQuery(username);
    addRecent(username);
    fetchUser(username);
    router.push(`/user/${username}`);
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {users.map((username) => (
        <button
          key={username}
          onClick={() => handleClick(username)}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-600 shadow-sm transition-all duration-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-violet-500 dark:hover:bg-violet-950/40 dark:hover:text-violet-400"
        >
          {username}
        </button>
      ))}
    </div>
  );
}