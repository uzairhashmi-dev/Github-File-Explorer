'use client';

// components/FileExplorer.tsx
// Folder/file tree — click folders to navigate, click files to view code.
// Breadcrumb navigation + back button + file type icons.

import { useCallback } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileImage,
  FileJson,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { formatFileSize, getFileExtension } from '@/lib/githubApi';
import { FileExplorerSkeleton } from '@/components/Loader';
import type { GitHubContent } from '@/types/github';


interface FileExplorerProps {
  owner: string;
  repo: string;
  contents: GitHubContent[];
  currentPath: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  onNavigate: (path: string) => void;
  onFileClick: (file: GitHubContent) => void;
}

export default function FileExplorer({
  owner,
  repo,
  contents,
  currentPath,
  status,
  error,
  onNavigate,
  onFileClick,
}: FileExplorerProps) {

  // ── Breadcrumb segments 
  const breadcrumbs = currentPath
    ? currentPath.split('/').reduce<{ label: string; path: string }[]>(
        (acc, segment, i) => {
          const path = acc[i - 1] ? `${acc[i - 1].path}/${segment}` : segment;
          return [...acc, { label: segment, path }];
        },
        []
      )
    : [];

  // ── Navigate up one level 
  const handleBack = useCallback(() => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    onNavigate(parts.join('/'));
  }, [currentPath, onNavigate]);

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/60">

      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700/60 dark:bg-zinc-900/40">
        {/* Back button */}
        {currentPath && (
          <button
            onClick={handleBack}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-violet-400 hover:text-violet-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:border-violet-500 dark:hover:text-violet-400"
            aria-label="Go up one level"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Breadcrumb */}
        <nav aria-label="File path" className="flex min-w-0 items-center gap-1 text-xs">
          <button
            onClick={() => onNavigate('')}
            className="shrink-0 font-semibold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            {repo}
          </button>

          {breadcrumbs.map(({ label, path }) => (
            <span key={path} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="h-3 w-3 shrink-0 text-zinc-400" />
              <button
                onClick={() => onNavigate(path)}
                className="truncate font-medium text-zinc-600 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-violet-400"
              >
                {label}
              </button>
            </span>
          ))}
        </nav>

        {/* Item count */}
        {status === 'success' && (
          <span className="ml-auto shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">
            {contents.length} items
          </span>
        )}
      </div>

      {status === 'loading' && <FileExplorerSkeleton />}

      {/* ── Error  */}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {error ?? 'Failed to load files.'}
          </p>
          <button
            onClick={() => onNavigate(currentPath)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── Empty  */}
      {status === 'success' && contents.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            This folder is empty.
          </p>
        </div>
      )}
      {/* ── File / folder rows  */}
      {status === 'success' && contents.length > 0 && (
        <ul role="list">
          {contents.map((item, index) => (
            <FileRow
              key={item.sha}
              item={item}
              isLast={index === contents.length - 1}
              onNavigate={onNavigate}
              onFileClick={onFileClick}
            />
          ))}
        </ul>
      )}

      {/* ── Footer  */}
      <div className="flex items-center gap-1.5 border-t border-zinc-100 px-4 py-2 dark:border-zinc-700/60">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          {owner}/{repo}
        </span>
        {currentPath && (
          <>
            <ChevronRight className="h-3 w-3 text-zinc-300 dark:text-zinc-600" />
            <span className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
              {currentPath}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// File row
interface FileRowProps {
  item: GitHubContent;
  isLast: boolean;
  onNavigate: (path: string) => void;
  onFileClick: (file: GitHubContent) => void;
}

function FileRow({ item, isLast, onNavigate, onFileClick }: FileRowProps) {
  const isDir = item.type === 'dir';

  function handleClick() {
    if (isDir) {
      onNavigate(item.path);
    } else {
      onFileClick(item);
    }
  }

  return (
    <li
      className={`group flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 ${
        !isLast ? 'border-b border-zinc-100/70 dark:border-zinc-700/30' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${isDir ? 'Open folder' : 'View file'}: ${item.name}`}
    >
      {/* Icon */}
      <span className="shrink-0">
        {isDir ? (
          <Folder className="h-4 w-4 text-sky-500 group-hover:hidden dark:text-sky-400" />
        ) : null}
        {isDir ? (
          <FolderOpen className="hidden h-4 w-4 text-sky-500 group-hover:block dark:text-sky-400" />
        ) : (
          <FileIcon filename={item.name} />
        )}
      </span>

      {/* Name */}
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          isDir
            ? 'font-medium text-zinc-800 dark:text-zinc-100'
            : 'text-zinc-600 dark:text-zinc-300'
        } group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors`}
      >
        {item.name}
      </span>

      {/* File size */}
      {!isDir && item.size > 0 && (
        <span className="shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {formatFileSize(item.size)}
        </span>
      )}

      {/* Chevron for dirs */}
      {isDir && (
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-300 transition-transform duration-150 group-hover:translate-x-0.5 dark:text-zinc-600" />
      )}
    </li>
  );
}

// File icon by extension

function FileIcon({ filename }: { filename: string }) {
  const ext = getFileExtension(filename);

  const codeExts = [
    'ts', 'tsx', 'js', 'jsx', 'py', 'rb', 'go', 'rs',
    'java', 'c', 'cpp', 'cs', 'php', 'swift', 'kt',
    'css', 'scss', 'html', 'vue', 'svelte', 'sh', 'yaml', 'yml',
  ];

  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];
  const jsonExts  = ['json', 'jsonc', 'lock'];

  if (codeExts.includes(ext)) {
    return <FileCode className="h-4 w-4 text-violet-500 dark:text-violet-400" />;
  }
  if (imageExts.includes(ext)) {
    return <FileImage className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />;
  }
  if (jsonExts.includes(ext)) {
    return <FileJson className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
  }
  return <FileText className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />;
}