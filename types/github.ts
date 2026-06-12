// Single source of truth — all TypeScript shapes for the app.

// ── GitHub User 
export interface GitHubUser {
  id: number;
  login: string;              // username — "torvalds"
  name: string | null;        // display name — "Linus Torvalds"
  avatar_url: string;         // profile picture URL
  bio: string | null;
  location: string | null;
  blog: string | null;        // website
  twitter_username: string | null;
  company: string | null;
  email: string | null;
  hireable: boolean | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;         // ISO date — join date
  html_url: string;           // github.com/username
}
// ── Repository 
export interface GitHubRepo {
  id: number;
  name: string;               // repo name — "linux"
  full_name: string;          // "torvalds/linux"
  description: string | null;
  html_url: string;           // github.com/torvalds/linux
  language: string | null;    // primary language
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;               // KB
  private: boolean;
  fork: boolean;              // is it a fork?
  license: GitHubLicense | null;
  updated_at: string;         // ISO date
  created_at: string;
  topics: string[];
  default_branch: string;     // "main" or "master"
}
export interface GitHubLicense {
  key: string;                // "mit"
  name: string;               // "MIT License"
  spdx_id: string;            // "MIT"
}
// ── File Explorer 
export type ContentType = 'file' | 'dir' | 'symlink' | 'submodule';

export interface GitHubContent {
  name: string;               // "README.md"
  path: string;               // "src/components/README.md"
  type: ContentType;
  size: number;               // bytes (0 for dirs)
  sha: string;
  html_url: string | null;
  download_url: string | null;
}

// ── File Content (code viewer) ─

export interface GitHubFileContent extends GitHubContent {
  content: string;            // base64 encoded file content
  encoding: 'base64';
}
// { "JavaScript": 45231, "TypeScript": 23100, "CSS": 4300 }
export type GitHubLanguages = Record<string, number>;

export interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;         // calculated — not from API
  color: string;              // hex color for the bar
}
// ── Zustand Store 
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export type SortOption = 'stars' | 'updated' | 'name';

export interface GitHubStore {
  // ── State
  user: GitHubUser | null;
  repos: GitHubRepo[];
  currentRepo: GitHubRepo | null;
  contents: GitHubContent[];
  currentFile: GitHubFileContent | null;
  currentPath: string;              // breadcrumb — "src/components"
  languages: GitHubLanguages;
  searchQuery: string;
  repoSearch: string;               // search within repos
  recentSearches: string[];         // saved in localStorage
  // ── Status
  userStatus: FetchStatus;
  repoStatus: FetchStatus;
  explorerStatus: FetchStatus;
  fileStatus: FetchStatus;
  // ── Filters
  sortBy: SortOption;
  filterLanguage: string | null;
  // ── Error messages
  userError: string | null;
  explorerError: string | null;
  // ── Actions
  fetchUser: (username: string) => Promise<void>;
  fetchRepos: (username: string) => Promise<void>;
  fetchContents: (owner: string, repo: string, path: string) => Promise<void>;
  fetchFileContent: (owner: string, repo: string, path: string) => Promise<void>;
  fetchLanguages: (owner: string, repo: string) => Promise<void>;
  setCurrentRepo: (repo: GitHubRepo) => void;
  setCurrentPath: (path: string) => void;
  setSearchQuery: (query: string) => void;
  setRepoSearch: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterLanguage: (language: string | null) => void;
  addRecentSearch: (username: string) => void;
  clearRecentSearches: () => void;
  resetExplorer: () => void;
}