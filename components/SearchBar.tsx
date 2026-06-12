'use client';

// GitHub username search — debounced input, recent searches dropdown,

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useSearch } from '@/store/githubStore';

const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const router = useRouter();
  const {
    searchQuery,
    recentSearches,
    setSearchQuery,
    fetchUser,
    addRecent,
    clearRecent,
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0 });

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Update dropdown position
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, []);

  // ── Open dropdown when input focused and recent searches exist ────────────
  function handleFocus() {
    if (recentSearches.length > 0 || searchQuery.length >= 2) {
      updatePosition();
      setIsOpen(true);
    }
  }

  // ── Click outside closes dropdown
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // ── Scroll/resize update 
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // ── "/" keyboard shortcut → focus search 
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Input change 
  function handleChange(value: string) {
    setSearchQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length === 0) {
      if (recentSearches.length > 0) {
        updatePosition();
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      return;
    }

    updatePosition();
    setIsOpen(true);
  }

  // ── Submit — go to user page 
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
    [fetchUser, addRecent, router]
  );

  // ── Keyboard nav 
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const items = searchQuery.trim() ? [] : recentSearches;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((p) => (p < items.length - 1 ? p + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((p) => (p > 0 ? p - 1 : items.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          handleSubmit(items[activeIndex]);
        } else if (searchQuery.trim()) {
          handleSubmit(searchQuery);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  function handleClear() {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }

  const showRecents = isOpen && recentSearches.length > 0 && !searchQuery.trim();

  return (
    <>
      {/* Input */}
      <div ref={containerRef} className="relative w-full max-w-xl">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400 dark:text-zinc-500" />

          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search GitHub username…"
            value={searchQuery}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-10 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-all duration-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/15 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/15"
          />

          {searchQuery && (
            <button
              onClick={handleClear}
              aria-label="Clear"
              className="absolute right-3 rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search button — shown next to input on mobile */}
        {searchQuery.trim() && (
          <button
            onMouseDown={() => handleSubmit(searchQuery)}
            className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-violet-700 sm:hidden"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown — fixed position, always on top */}
      {showRecents && (
        <ul
          role="listbox"
          style={{
            position: 'fixed',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            zIndex: 9999,
          }}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
        >
          {/* Header */}
          <li className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-700/60">
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              <Clock className="h-3.5 w-3.5" />
              Recent searches
            </span>
            <button
              onMouseDown={clearRecent}
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
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={() => handleSubmit(username)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-100 border-b border-zinc-100 last:border-0 dark:border-zinc-700/50 ${
                index === activeIndex
                  ? 'bg-violet-50 dark:bg-violet-950/40'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/40'
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
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}