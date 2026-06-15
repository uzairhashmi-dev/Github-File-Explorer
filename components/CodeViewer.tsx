'use client';
// components/CodeViewer.tsx
// Displays decoded file content with line numbers, copy button, raw link.
// No external syntax highlighting package — uses CSS classes for clean display.
import { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  FileCode,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { decodeFileContent, formatFileSize, getFileExtension } from '@/lib/githubApi';
import { CodeViewerSkeleton } from '@/components/Loader';
import type { GitHubFileContent } from '@/types/github';

interface CodeViewerProps {
  file: GitHubFileContent | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  onClose: () => void;
}
// Max lines to show before "Show more" button
const PREVIEW_LINES = 100;

export default function CodeViewer({ file, status, onClose }: CodeViewerProps) {

  const [copied, setCopied]       = useState(false);
  const [expanded, setExpanded]   = useState(false);

  // Decode base64 content once
  const content = useMemo(() => {
    if (!file) return '';
    return decodeFileContent(file.content);
  }, [file]);

  const lines       = content.split('\n');
  const isTruncated = lines.length > PREVIEW_LINES && !expanded;
  const visibleLines = isTruncated ? lines.slice(0, PREVIEW_LINES) : lines;
  // ── Copy to clipboard 
  async function handleCopy() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  // ── Loading 
  if (status === 'loading') {
    return <CodeViewerSkeleton />;
  }
  // ── Error / idle 
  if (status === 'error' || !file) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white py-12 text-center dark:border-zinc-700/60 dark:bg-zinc-800/60">
        <FileCode className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {status === 'error' ? 'Failed to load file content.' : 'Select a file to view its code.'}
        </p>
      </div>
    );
  }

  const ext       = getFileExtension(file.name);
  const lineCount = lines.length;

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/60">

      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-zinc-700/60 dark:bg-zinc-900/40">

        <FileCode className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {file.name}
        </span>

        {/* Meta badges */}
        <div className="hidden items-center gap-2 sm:flex">
          {ext && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              {ext}
            </span>
          )}
          <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {lineCount.toLocaleString()} lines
          </span>
          <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {formatFileSize(file.size)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Copy */}
          <button
            onClick={handleCopy}
            aria-label="Copy code"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:border-violet-400 hover:text-violet-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Raw */}
          {file.download_url && (
            <a
              href={file.download_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View raw file"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Raw</span>
            </a>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close file viewer"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:border-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Code block */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {visibleLines.map((line, index) => (
              <tr
                key={index}
                className="group hover:bg-violet-50/40 dark:hover:bg-violet-950/20"
              >
                {/* Line number */}
                <td
                  className="select-none border-r border-zinc-100 px-3 py-0.5 text-right tabular-nums text-zinc-400 dark:border-zinc-700/50 dark:text-zinc-600"
                  style={{ minWidth: '3rem' }}
                >
                  {index + 1}
                </td>

                {/* Code */}
                <td className="px-4 py-0.5 font-mono text-zinc-800 dark:text-zinc-200">
                  <pre className="whitespace-pre">{line || ' '}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Show more / less  */}
      {lines.length > PREVIEW_LINES && (
        <div className="border-t border-zinc-100 dark:border-zinc-700/60">
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex w-full items-center justify-center gap-2 py-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-violet-600 dark:text-zinc-400 dark:hover:bg-zinc-700/30 dark:hover:text-violet-400"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {lines.length - PREVIEW_LINES} more lines
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Footer  */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2 dark:border-zinc-700/60">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          {lineCount.toLocaleString()} lines · {formatFileSize(file.size)}
        </span>
        {file.html_url && (
          <a
            href={file.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-zinc-400 transition-colors hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400"
          >
            View on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}