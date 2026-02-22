/**
 * SearchBar.tsx — Top search bar with Hindi/English placeholder
 * WCAG 3.3.2 — descriptive label; WCAG 2.4.7 — visible focus
 * Voice input supported via onVoiceResult prop from VoiceMicButton
 */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
}

export default function SearchBar({
    placeholder = "Search services… / सेवाएं खोजें…",
    className = "",
}: SearchBarProps) {
    const [query, setQuery] = useState("");
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/services?q=${encodeURIComponent(query.trim())}`);
        }
    }

    function handleClear() {
        setQuery("");
        inputRef.current?.focus();
    }

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            aria-label="Search for government services"
            className={`relative w-full max-w-2xl mx-auto ${className}`}
        >
            {/* Label — visually hidden but present for screen readers (WCAG 1.3.1) */}
            <label htmlFor="service-search" className="sr-only">
                Search government services in English or Hindi
            </label>

            {/* Search icon */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#616161]"
            >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M11.5 11.5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            </span>

            <input
                ref={inputRef}
                id="service-search"
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label="Search government services"
                className="
          w-full h-12 pl-11 pr-28 rounded-xl
          border-2 border-[#1A237E]/20 bg-white
          text-[#111111] text-base
          placeholder:text-[#616161]
          focus:outline-none focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/20
          transition-all duration-150
          shadow-sm hover:shadow-md
        "
            />

            {/* Clear button — only shown when there's input */}
            {query && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="
            touch-target absolute right-16 top-1/2 -translate-y-1/2
            text-[#616161] hover:text-[#111111] transition-colors
          "
                >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>
            )}

            {/* Submit button */}
            <button
                type="submit"
                aria-label="Submit search"
                className="
          touch-target absolute right-2 top-1/2 -translate-y-1/2
          px-4 h-9 rounded-lg
          bg-[#1A237E] text-white text-sm font-semibold
          hover:bg-[#283593] active:scale-95
          transition-all duration-150
        "
            >
                Search
            </button>
        </form>
    );
}
