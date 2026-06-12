// All GitHub API calls — components never call fetch directly.

import type {
  GitHubUser,
  GitHubRepo,
  GitHubContent,
  GitHubFileContent,
  GitHubLanguages,
  LanguageStat,
} from '@/types/github';

const BASE = '/api/github';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript:  '#3178c6',
  JavaScript:  '#f1e05a',
  Python:      '#3572A5',
  Rust:        '#dea584',
  Go:          '#00ADD8',
  Java:        '#b07219',
  'C++':       '#f34b7d',
  C:           '#555555',
  CSS:         '#563d7c',
  HTML:        '#e34c26',
  Ruby:        '#701516',
  Swift:       '#F05138',
  Kotlin:      '#A97BFF',
  Dart:        '#00B4AB',
  PHP:         '#4F5D95',
  Shell:       '#89e051',
  Vue:         '#41b883',
  Svelte:      '#ff3e00',
  Scala:       '#c22d40',
  Elixir:      '#6e4a7e',
};

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? '#8b949e';
}

// ── Core fetcher
async function githubFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE}?endpoint=${encodeURIComponent(endpoint)}`);

  if (res.status === 404) throw new GitHubError('User or resource not found.', 404);
  if (res.status === 403) throw new GitHubError('Rate limit exceeded. Wait a minute.', 403);
  if (!res.ok) throw new GitHubError(`GitHub API error: ${res.status}`, res.status);

  return res.json() as Promise<T>;
}
// ── API functions 
export async function fetchUser(username: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${username}`);
}

export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?per_page=100&sort=updated`
  );
}

export async function fetchContents(
  owner: string,
  repo: string,
  path: string = ''
): Promise<GitHubContent[]> {
  const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
  const data = await githubFetch<GitHubContent | GitHubContent[]>(endpoint);
  // API returns object for file, array for directory
  return Array.isArray(data) ? data : [data];
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<GitHubFileContent> {
  return githubFetch<GitHubFileContent>(`/repos/${owner}/${repo}/contents/${path}`);
}

export async function fetchLanguages(
  owner: string,
  repo: string
): Promise<GitHubLanguages> {
  return githubFetch<GitHubLanguages>(`/repos/${owner}/${repo}/languages`);
}


/** Converts raw language bytes into sorted LanguageStat array with % */
export function processLanguages(raw: GitHubLanguages): LanguageStat[] {
  const total = Object.values(raw).reduce((sum, bytes) => sum + bytes, 0);
  if (total === 0) return [];

  return Object.entries(raw)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / total) * 100),
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6); // top 6 only
}
/** Decodes base64 file content from GitHub API */
export function decodeFileContent(base64: string): string {
  try {
    return atob(base64.replace(/\n/g, ''));
  } catch {
    return '// Could not decode file content.';
  }
}
/** Formats bytes into human-readable size */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Formats ISO date → "Jun 9, 2024" */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Formats ISO date → relative time "3 days ago" */
export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  const months  = Math.floor(days / 30);
  const years   = Math.floor(days / 365);

  if (minutes < 60)  return `${minutes}m ago`;
  if (hours < 24)    return `${hours}h ago`;
  if (days < 30)     return `${days}d ago`;
  if (months < 12)   return `${months}mo ago`;
  return `${years}y ago`;
}

/** Returns file extension from filename */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

/** Sorts repos based on SortOption */
export function sortRepos(
  repos: GitHubRepo[],
  sortBy: 'stars' | 'updated' | 'name'
): GitHubRepo[] {
  return [...repos].sort((a, b) => {
    if (sortBy === 'stars')   return b.stargazers_count - a.stargazers_count;
    if (sortBy === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return a.name.localeCompare(b.name);
  });
}

// ── Custom error 

export class GitHubError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'GitHubError';
  }
}