/**
 * GovHeader.tsx — GIGW 3.0 compliant government header
 * Includes: State Emblem, Ministry name, Language toggle, Voice input btn
 * WCAG: landmark <header>, proper alt text, 44×44px touch targets
 */
"use client";

import Link from "next/link";
import LanguageToggle from "@/components/ui/LanguageToggle";
import VoiceMicButton from "@/components/ui/VoiceMicButton";

interface GovHeaderProps {
    onVoiceResult?: (transcript: string) => void;
    onLanguageChange?: (code: string) => void;
}

export default function GovHeader({ onVoiceResult, onLanguageChange }: GovHeaderProps) {
    return (
        <header
            className="w-full"
            aria-label="Government of India — Infosetu platform header"
        >
            {/* ── Top utility bar ── */}
            <div className="bg-[#1A237E] text-white">
                <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-4">

                    {/* Left: Emblem + Ministry name */}
                    <div className="flex items-center gap-3">
                        {/* State Emblem — GIGW requires it on every page */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/emblem-dark.png"
                            alt="State Emblem of India — Satyameva Jayate"
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                                /* Fallback: hide broken image, screen readers still get alt text */
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                        <div>
                            <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-none">
                                Government of India
                            </p>
                            <p className="text-sm font-bold leading-tight">
                                Ministry of Electronics &amp; Information Technology
                            </p>
                        </div>
                    </div>

                    {/* Right: Language selector + Voice mic */}
                    <div className="flex items-center gap-2">
                        <LanguageToggle onChange={onLanguageChange} />
                        <VoiceMicButton onResult={onVoiceResult} />
                    </div>
                </div>
            </div>

            {/* ── Main header band ── */}
            <div className="bg-white border-b-4 border-[#1A237E] shadow-sm">
                <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

                    {/* Platform branding */}
                    <Link
                        href="/"
                        aria-label="Infosetu home — Integrated Government Digital Services Platform"
                        className="flex items-center gap-3 group"
                    >
                        <div
                            className="w-10 h-10 rounded-lg bg-[#1A237E] flex items-center justify-center shrink-0"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                                <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9 22 9 12 15 12 15 22" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#1A237E] leading-none group-hover:underline">
                                InfoSetu
                            </h1>
                            <p className="text-[11px] text-[#616161] leading-tight mt-0.5">
                                Integrated Government Digital Services
                            </p>
                        </div>
                    </Link>

                    {/* Primary navigation */}
                    <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
                        {[
                            { href: "/", label: "Dashboard" },
                            { href: "/services", label: "Services" },
                            { href: "/status", label: "Check Status" },
                            { href: "/grievance", label: "Grievance" },
                            { href: "/help", label: "Help" },
                        ].map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="
                  touch-target px-3 py-2 rounded-lg text-sm font-semibold
                  text-[#1A237E] hover:bg-[#F5F5F5]
                  transition-colors duration-150
                "
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Sign In CTA */}
                    <Link
                        href="/login"
                        aria-label="Sign in to your Infosetu account"
                        className="
              touch-target hidden sm:inline-flex items-center gap-2
              px-4 py-2 rounded-lg
              bg-[#1A237E] text-white text-sm font-semibold
              hover:bg-[#283593] transition-colors duration-150
            "
                    >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Sign In
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        aria-label="Open navigation menu"
                        aria-expanded="false"
                        aria-controls="mobile-nav"
                        className="md:hidden touch-target text-[#1A237E] rounded-lg hover:bg-[#F5F5F5]"
                    >
                        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
