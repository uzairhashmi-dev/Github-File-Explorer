// Zustand global store — single source of truth for all app state.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  fetchUser,
  fetchRepos,
  fetchContents,
  fetchFileContent,
  fetchLanguages,
  sortRepos,
} from '@/lib/githubApi';

import type {
  GitHubStore,
  GitHubRepo,
  SortOption,
} from '@/types/github';

const RECENT_KEY = 'github-explorer-recent';
const MAX_RECENT = 5;

// ── Helpers 
function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecent(searches: string[]): void {
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches));
}


export const useGitHubStore = create<GitHubStore>()(
  devtools(
    (set, get) => ({
      // ── Initial state
      user:            null,
      repos:           [],
      currentRepo:     null,
      contents:        [],
      currentFile:     null,
      currentPath:     '',
      languages:       {},
      searchQuery:     '',
      repoSearch:      '',
      recentSearches:  [],

      // ── Status
      userStatus:      'idle',
      repoStatus:      'idle',
      explorerStatus:  'idle',
      fileStatus:      'idle',
      // ── Filters
      sortBy:          'updated',
      filterLanguage:  null,
      // ── Errors
      userError:       null,
      explorerError:   null,


      fetchUser: async (username: string) => {
        set(
          { userStatus: 'loading', userError: null, user: null, repos: [] },
          false,
          'fetchUser/start'
        );
        try {
          const user = await fetchUser(username);
          set({ userStatus: 'success', user }, false, 'fetchUser/success');
          // Auto-fetch repos after user loads
          get().fetchRepos(username);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'User not found.';
          set({ userStatus: 'error', userError: message }, false, 'fetchUser/error');
        }
      },
      fetchRepos: async (username: string) => {
        set({ repoStatus: 'loading' }, false, 'fetchRepos/start');
        try {
          const repos = await fetchRepos(username);
          set({ repoStatus: 'success', repos }, false, 'fetchRepos/success');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load repositories.';
          set({ repoStatus: 'error', userError: message }, false, 'fetchRepos/error');
        }
      },

      fetchContents: async (owner: string, repo: string, path: string) => {
        set(
          { explorerStatus: 'loading', explorerError: null, currentFile: null },
          false,
          'fetchContents/start'
        );
        try {
          const contents = await fetchContents(owner, repo, path);
          // Sort: folders first, then files — alphabetically
          const sorted = [...contents].sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
          });
          set(
            { explorerStatus: 'success', contents: sorted, currentPath: path },
            false,
            'fetchContents/success'
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load files.';
          set(
            { explorerStatus: 'error', explorerError: message },
            false,
            'fetchContents/error'
          );
        }
      },

      fetchFileContent: async (owner: string, repo: string, path: string) => {
        set({ fileStatus: 'loading', currentFile: null }, false, 'fetchFile/start');
        try {
          const file = await fetchFileContent(owner, repo, path);
          set({ fileStatus: 'success', currentFile: file }, false, 'fetchFile/success');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load file.';
          set({ fileStatus: 'error', explorerError: message }, false, 'fetchFile/error');
        }
      },

      fetchLanguages: async (owner: string, repo: string) => {
        try {
          const languages = await fetchLanguages(owner, repo);
          set({ languages }, false, 'fetchLanguages/success');
        } catch {
          set({ languages: {} }, false, 'fetchLanguages/error');
        }
      },

      // ── Simple setters 

      setCurrentRepo: (repo: GitHubRepo) => {
        set(
          { currentRepo: repo, contents: [], currentFile: null, currentPath: '' },
          false,
          'setCurrentRepo'
        );
      },

      setCurrentPath: (path: string) => {
        set({ currentPath: path }, false, 'setCurrentPath');
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      setRepoSearch: (query: string) => {
        set({ repoSearch: query }, false, 'setRepoSearch');
      },

      setSortBy: (sortBy: SortOption) => {
        set({ sortBy }, false, 'setSortBy');
      },

      setFilterLanguage: (language: string | null) => {
        set({ filterLanguage: language }, false, 'setFilterLanguage');
      },

      addRecentSearch: (username: string) => {
        const prev = get().recentSearches.filter((s) => s !== username);
        const updated = [username, ...prev].slice(0, MAX_RECENT);
        saveRecent(updated);
        set({ recentSearches: updated }, false, 'addRecentSearch');
      },

      clearRecentSearches: () => {
        saveRecent([]);
        set({ recentSearches: [] }, false, 'clearRecentSearches');
      },

      resetExplorer: () => {
        set(
          {
            currentRepo:    null,
            contents:       [],
            currentFile:    null,
            currentPath:    '',
            languages:      {},
            explorerStatus: 'idle',
            fileStatus:     'idle',
            explorerError:  null,
          },
          false,
          'resetExplorer'
        );
      },
    }),
    { name: 'GitHubStore' }
  )
);

// ── Selector hooks 

export const useUserData = () => {
  const user        = useGitHubStore((s) => s.user);
  const userStatus  = useGitHubStore((s) => s.userStatus);
  const userError   = useGitHubStore((s) => s.userError);
  const fetchUser   = useGitHubStore((s) => s.fetchUser);
  return { user, userStatus, userError, fetchUser };
};

export const useRepos = () => {
  const repos          = useGitHubStore((s) => s.repos);
  const repoStatus     = useGitHubStore((s) => s.repoStatus);
  const repoSearch     = useGitHubStore((s) => s.repoSearch);
  const sortBy         = useGitHubStore((s) => s.sortBy);
  const filterLanguage = useGitHubStore((s) => s.filterLanguage);
  const setRepoSearch  = useGitHubStore((s) => s.setRepoSearch);
  const setSortBy      = useGitHubStore((s) => s.setSortBy);
  const setFilter      = useGitHubStore((s) => s.setFilterLanguage);
  const setCurrentRepo = useGitHubStore((s) => s.setCurrentRepo);

  // Derived — filter + sort in selector (no extra state)
  const filtered = sortRepos(
    repos.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(repoSearch.toLowerCase());
      const matchLang   = filterLanguage ? r.language === filterLanguage : true;
      return matchSearch && matchLang;
    }),
    sortBy
  );

  return {
    repos: filtered,
    allRepos: repos,
    repoStatus,
    repoSearch,
    sortBy,
    filterLanguage,
    setRepoSearch,
    setSortBy,
    setFilter,
    setCurrentRepo,
  };
};

export const useExplorer = () => {
  const currentRepo    = useGitHubStore((s) => s.currentRepo);
  const contents       = useGitHubStore((s) => s.contents);
  const currentFile    = useGitHubStore((s) => s.currentFile);
  const currentPath    = useGitHubStore((s) => s.currentPath);
  const explorerStatus = useGitHubStore((s) => s.explorerStatus);
  const fileStatus     = useGitHubStore((s) => s.fileStatus);
  const explorerError  = useGitHubStore((s) => s.explorerError);
  const languages      = useGitHubStore((s) => s.languages);
  const fetchContents  = useGitHubStore((s) => s.fetchContents);
  const fetchFile      = useGitHubStore((s) => s.fetchFileContent);
  const fetchLangs     = useGitHubStore((s) => s.fetchLanguages);
  const setPath        = useGitHubStore((s) => s.setCurrentPath);
  const reset          = useGitHubStore((s) => s.resetExplorer);

  return {
    currentRepo,
    contents,
    currentFile,
    currentPath,
    explorerStatus,
    fileStatus,
    explorerError,
    languages,
    fetchContents,
    fetchFile,
    fetchLangs,
    setPath,
    reset,
  };
};

export const useSearch = () => {
  const searchQuery      = useGitHubStore((s) => s.searchQuery);
  const recentSearches   = useGitHubStore((s) => s.recentSearches);
  const setSearchQuery   = useGitHubStore((s) => s.setSearchQuery);
  const fetchUser        = useGitHubStore((s) => s.fetchUser);
  const addRecent        = useGitHubStore((s) => s.addRecentSearch);
  const clearRecent      = useGitHubStore((s) => s.clearRecentSearches);
  return { searchQuery, recentSearches, setSearchQuery, fetchUser, addRecent, clearRecent };
};