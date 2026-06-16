'use client';
// components/ProfileCard.tsx
// Displays GitHub user profile — avatar, name, bio, stats, meta info.

import Image from 'next/image';
import {
  MapPin,
  Link2,
  Building2,
  Users,
  BookMarked,
  Calendar,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/githubApi';
import type { GitHubUser } from '@/types/github';

interface ProfileCardProps {
  user: GitHubUser;
}

function TwitterIcon({ className }: { className?: string }) {
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
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <article className="w-full animate-fade-in rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/60">

      {/* ── Top section */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Image
              src={user.avatar_url}
              alt={`${user.login} avatar`}
              width={112}
              height={112}
              className="rounded-full border-4 border-zinc-100 shadow-lg dark:border-zinc-700"
              priority
            />
            {user.hireable && (
              <span
                title="Open to work"
                className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-800"
              >
                <CheckCircle2 className="h-3 w-3 text-white" />
              </span>
            )}
          </div>

          {/* Name + bio */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {user.name ?? user.login}
              </h1>
              {user.hireable && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  Hireable
                </span>
              )}
            </div>

            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-block text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              @{user.login}
            </a>

            {user.bio && (
              <p className="mt-3 wrap-break-word text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {user.bio}
              </p>
            )}

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-start">
              {user.company && (
                <MetaItem icon={<Building2 className="h-3.5 w-3.5" />} text={user.company} />
              )}
              {user.location && (
                <MetaItem icon={<MapPin className="h-3.5 w-3.5" />} text={user.location} />
              )}
              {user.email && (
                <MetaItem
                  icon={<Mail className="h-3.5 w-3.5" />}
                  text={user.email}
                  href={`mailto:${user.email}`}
                />
              )}
              {user.blog && (
                <MetaItem
                  icon={<Link2 className="h-3.5 w-3.5" />}
                  text={user.blog.replace(/^https?:\/\//, '')}
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                />
              )}
              {user.twitter_username && (
                <MetaItem
                  icon={<TwitterIcon className="h-3.5 w-3.5" />}
                  text={`@${user.twitter_username}`}
                  href={`https://twitter.com/${user.twitter_username}`}
                />
              )}
              <MetaItem
                icon={<Calendar className="h-3.5 w-3.5" />}
                text={`Joined ${formatDate(user.created_at)}`}
              />
            </div>
          </div>
        </div>
      </div>
      {/* ── Stats row */}
      <div className="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-700/60 dark:border-zinc-700/60">
        <StatTile
          icon={<Users className="h-4 w-4" />}
          value={formatCount(user.followers)}
          label="Followers"
        />
        <StatTile
          icon={<Users className="h-4 w-4" />}
          value={formatCount(user.following)}
          label="Following"
        />
        <StatTile
          icon={<BookMarked className="h-4 w-4" />}
          value={formatCount(user.public_repos)}
          label="Repos"
        />
      </div>
    </article>
  );
}

// ── Sub-components 

interface MetaItemProps {
  icon: React.ReactNode;
  text: string;
  href?: string;
}

function MetaItem({ icon, text, href }: MetaItemProps) {
  const base = 'flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400';

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} transition-colors hover:text-violet-600 dark:hover:text-violet-400`}
      >
        {icon}
        <span className="truncate max-w-45">{text}</span>
      </a>
    );
  }

  return (
    <span className={base}>
      {icon}
      <span className="truncate max-w-45">{text}</span>
    </span>
  );
}

interface StatTileProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatTile({ icon, value, label }: StatTileProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
      <span className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
        {icon}
      </span>
      <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{label}</span>
    </div>
  );
}

// ── Helper 

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}