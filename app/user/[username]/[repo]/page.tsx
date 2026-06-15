'use client';

// app/user/[username]/[repo]/page.tsx
// File explorer page — left: file tree, right: code viewer.
// Fetches repo contents on mount, updates on folder navigation.

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, GitFork, ExternalLink } from 'lucide-react';

import { useExplorer, useGitHubStore } from '@/store/githubStore';
import FileExplorer from '@/components/FileExplorer';
import CodeViewer from '@/components/CodeViewer';
import SearchBar from '@/components/SearchBar';
import type { GitHubContent } from '@/types/github';


export default function RepoPage() {
  const params   = useParams();
  const router   = useRouter();

  const username = typeof params.username === 'string' ? params.username : '';
  const repoName = typeof params.repo === 'string' ? params.repo : '';

  const {
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
  } = useExplorer();

  const setCurrentRepo = useGitHubStore((s) => s.setCurrentRepo);
  const repos          = useGitHubStore((s) => s.repos);

  // ── On mount — load root contents ─────────────────────────────────────────
  useEffect(() => {
    if (!username || !repoName) return;

    // If store has repos but currentRepo not set — find and set it
    if (!currentRepo && repos.length > 0) {
      const found = repos.find((r) => r.name === repoName);
      if (found) setCurrentRepo(found);
    }

    fetchContents(username, repoName, '');
    fetchLangs(username, repoName);

    return () => { reset(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, repoName]);

  // ── Navigate into folder ──────────────────────────────────────────────────
  const handleNavigate = useCallback(
    (path: string) => {
      setPath(path);
      fetchContents(username, repoName, path);
    },
    [username, repoName, fetchContents, setPath]
  );

  // ── Click a file → load content ───────────────────────────────────────────
  const handleFileClick = useCallback(
    (file: GitHubContent) => {
      if (file.type !== 'file') return;
      fetchFile(username, repoName, file.path);
    },
    [username, repoName, fetchFile]
  );

  // ── Close code viewer 
  const handleCloseFile = useCallback(() => {
    useGitHubStore.setState({ currentFile: null, fileStatus: 'idle' });
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">

      {/* Search bar */}
      <div className="mb-5 relative  flex justify-center animate-fade-in">
        <SearchBar />
      </div>

      {/* ── Repo header  */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/user/${username}`)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {username}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 dark:text-zinc-500">/</span>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {repoName}
            </h1>
          </div>

          {/* Language badge */}
          {Object.keys(languages)[0] && (
            <span className="hidden rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 sm:inline-block">
              {Object.keys(languages)[0]}
            </span>
          )}
        </div>

        {/* Repo stats + GitHub link */}
        {currentRepo && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Star className="h-3.5 w-3.5" />
              {currentRepo.stargazers_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <GitFork className="h-3.5 w-3.5" />
              {currentRepo.forks_count.toLocaleString()}
            </span>
            <a
              href={currentRepo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        )}
      </div>

      {/* ── Main layout */}
      <div className={`grid gap-4 ${currentFile ? 'lg:grid-cols-[380px_1fr]' : 'grid-cols-1 max-w-3xl mx-auto'}`}>

        {/* Left — file tree */}
        <div className="animate-fade-up">
          <FileExplorer
            owner={username}
            repo={repoName}
            contents={contents}
            currentPath={currentPath}
            status={explorerStatus}
            error={explorerError}
            onNavigate={handleNavigate}
            onFileClick={handleFileClick}
          />
        </div>

        {/* Right — code viewer (only when file selected) */}
        {currentFile && (
          <div className="animate-fade-in">
            <CodeViewer
              file={currentFile}
              status={fileStatus}
              onClose={handleCloseFile}
            />
          </div>
        )}
      </div>
    </div>
  );
}