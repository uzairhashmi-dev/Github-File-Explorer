"use client";

// Top navigation — logo, quick search trigger, dark/light toggle.

import Link from "next/link";
import { Sun, Moon, Search } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useSearch } from "@/store/githubStore";

// Inline SVG — replaces lucide Github (not exported in this version)
function GithubIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { setSearchQuery } = useSearch();

  const isDark = theme === "dark";

  function handleLogoClick() {
    // Reset search on logo click
    setSearchQuery("");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#0d1117]/90 transition-colors duration-300">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Brand  */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 transition-transform duration-200 group-hover:scale-110">
            <GithubIcon
              className="h-4 w-4 text-white dark:text-zinc-900"
              strokeWidth={2}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              GitExplorer
            </span>
            <span className="hidden text-[10px] font-medium tracking-widest text-zinc-400 dark:text-zinc-500 sm:block">
              FILE EXPLORER
            </span>
          </div>
        </Link>

        {/* ── Right controls  */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const input =
                document.querySelector<HTMLInputElement>('input[type="text"]');
              input?.focus();
            }}
            className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500 transition-all duration-200 hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:border-violet-500 dark:hover:text-violet-400 md:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search user…</span>
            <kbd className="ml-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-zinc-600 dark:bg-zinc-700">
              /
            </kbd>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-all duration-200 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          {/* Dark / light toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="group flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-all duration-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-violet-500 dark:hover:bg-violet-950/50 dark:hover:text-violet-400"
          >
            {isDark ? (
              <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
