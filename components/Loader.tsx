'use client';
// components/Loader.tsx

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700/60 ${className}`} />
  );
}
// ── 1. Profile Card Skeleton 
export function ProfileCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700/60 dark:bg-zinc-800/60 sm:p-8">

      {/* Avatar + name row */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28" />
        <div className="w-full space-y-2.5 text-center sm:text-left">
          <Skeleton className="mx-auto h-7 w-48 sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-32 sm:mx-0" />
          <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-700/40 dark:bg-zinc-700/30">
            <Skeleton className="mx-auto h-6 w-12" />
            <Skeleton className="mx-auto mt-1.5 h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Meta info */}
      <div className="mt-5 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-40" />
        ))}
      </div>
    </div>
  );
}
// ── 2. Repo Card Skeleton 
export function RepoCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-800/60">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// ── 3. Repo List Skeleton 
export function RepoListSkeleton() {
  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <RepoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
// ── 4. File Explorer Skeleton 
export function FileExplorerSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/60">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-700/60">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-zinc-100/60 px-4 py-3 last:border-0 dark:border-zinc-700/30"
        >
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-24' : i % 2 === 0 ? 'w-40' : 'w-32'}`} />
          <Skeleton className="ml-auto h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
// ── 5. Code Viewer Skeleton 
export function CodeViewerSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-700/60">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
      {/* Code lines */}
      <div className="space-y-2.5 p-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-6 shrink-0" />
            <Skeleton
              className={`h-4 ${
                i % 4 === 0 ? 'w-3/4' :
                i % 3 === 0 ? 'w-1/2' :
                i % 2 === 0 ? 'w-2/3' : 'w-full'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
// ── 6. Language Bar Skeleton 
export function LanguageBarSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-800/60">
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="mb-4 h-3 w-full rounded-full" />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
// ── 7. Full Page Skeleton
export function FullPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <ProfileCardSkeleton />
      <LanguageBarSkeleton />
      <RepoListSkeleton />
    </div>
  );
}