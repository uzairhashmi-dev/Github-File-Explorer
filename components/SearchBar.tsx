"use client";

// components/SearchBar.tsx
// GitHub username search — recent searches dropdown, keyboard navigation.

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, Trash2, ArrowRight } from "lucide-react";
import { useSearch } from "@/store/githubStore";

export default function SearchBar() {
  const router = useRouter();
  const {
    searchQuery,
    recentSearches,
    setSearchQuery,
    fetchUser,
    addRecent,
    clearRecent,
    removeRecent,
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = "search-listbox";

  // ── Open on focus if recents exist
  function handleFocus() {
    if (recentSearches.length > 0) {
      setIsOpen(true);
    }
  }

  // ── Click outside closes dropdown
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ── "/" shortcut focuses search
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── Input change
  function handleChange(value: string) {
    setSearchQuery(value);
    setActiveIndex(-1);

    if (value.trim().length === 0) {
      if (recentSearches.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      return;
    }

    // While typing — hide recents, user will press Enter to submit
    setIsOpen(false);
  }

  // ── Submit
  const handleSubmit = useCallback(
    (username: string) => {
      const trimmed = username.trim();
      if (!trimmed) return;
      setIsOpen(false);
      inputRef.current?.blur();
      addRecent(trimmed);
      fetchUser(trimmed);
      router.push(`/user/${trimmed}`);
    },
    [fetchUser, addRecent, router],
  );

  // ── Clear input
  function handleClear() {
    setSearchQuery("");
    setIsOpen(recentSearches.length > 0);
    inputRef.current?.focus();
  }

  // ── Keyboard nav
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const items = isOpen && !searchQuery.trim() ? recentSearches : [];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((p) => (p < items.length - 1 ? p + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((p) => (p > 0 ? p - 1 : items.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          handleSubmit(items[activeIndex]);
        } else if (searchQuery.trim()) {
          handleSubmit(searchQuery);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  const showRecents =
    isOpen && recentSearches.length > 0 && !searchQuery.trim();

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400 dark:text-zinc-500" />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showRecents}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder="Search GitHub username…"
          value={searchQuery}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-10 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-all duration-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/15 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/15"
        />

        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mobile submit button */}
      {searchQuery.trim() && (
        <button
          onMouseDown={() => handleSubmit(searchQuery)}
          className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-violet-700 sm:hidden"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Dropdown — absolute inside containerRef, always visible */}
      {showRecents && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[9999] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
        >
          {/* Header */}
          <li className="flex items-center justify-between border-b border-zinc-100 px-4 py-2 dark:border-zinc-700/60">
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              Recent searches
            </span>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                clearRecent();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </li>

          {/* Recent items */}
          {recentSearches.map((username, index) => (
            <li
              key={username}
              id={`search-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSubmit(username);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex cursor-pointer items-center gap-3 border-b border-zinc-100 px-4 py-3 transition-colors duration-100 last:border-0 dark:border-zinc-700/50 ${
                index === activeIndex
                  ? "bg-violet-50 dark:bg-violet-950/40"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-700/40"
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {username[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {username}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    removeRecent(username);
                  }}
                  className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
                  aria-label={`Remove ${username} from recent searches`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
              </div>{" "}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
