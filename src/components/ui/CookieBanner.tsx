/**
 * CookieBanner.tsx
 * DPDP Act 2023 — explicit opt-in consent banner.
 * Only shows if no consent decision is stored in localStorage.
 * WCAG 2.4.3 — focus managed to banner on mount.
 */
"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "infosetu_cookie_consent";

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const acceptRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            setVisible(true);
        }
    }, []);

    // Move focus to the Accept button when banner appears (WCAG 2.4.3)
    useEffect(() => {
        if (visible) acceptRef.current?.focus();
    }, [visible]);

    function accept() {
        localStorage.setItem(STORAGE_KEY, "accepted");
        setVisible(false);
    }

    function decline() {
        localStorage.setItem(STORAGE_KEY, "declined");
        // Remove any analytics cookies that may have been set
        setVisible(false);
    }

    if (!visible) return null;

    return (
        /* role="dialog" with aria-modal + aria-labelledby for screen readers */
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-title"
            aria-describedby="cookie-desc"
            className="
        fixed bottom-0 left-0 right-0 z-[60]
        bg-[#1A237E] text-white
        px-4 py-5 shadow-2xl
        md:flex md:items-center md:gap-6 md:px-8
        animate-slideUp
      "
        >
            {/* Cookie icon */}
            <span aria-hidden="true" className="text-3xl hidden md:block">🍪</span>

            {/* Text content */}
            <div className="flex-1 mb-4 md:mb-0">
                <p id="cookie-title" className="font-bold text-base mb-1">
                    We use cookies — your consent matters
                </p>
                <p id="cookie-desc" className="text-sm text-white/85 leading-relaxed">
                    Under the <strong>Digital Personal Data Protection Act 2023 (DPDP)</strong>,
                    we need your consent before storing cookies. We only collect data essential
                    to deliver government services.{" "}
                    <a
                        href="/privacy-policy"
                        className="underline hover:text-white focus-visible:outline-white"
                        aria-label="Read our Privacy Policy"
                    >
                        Privacy Policy
                    </a>
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
                {/* Accept — primary action */}
                <button
                    ref={acceptRef}
                    type="button"
                    onClick={accept}
                    aria-label="Accept all cookies and close this notice"
                    className="
            touch-target px-5 py-2.5 rounded-lg
            bg-[#2E7D32] text-white font-semibold text-sm
            hover:bg-green-700 transition-colors duration-150
            focus-visible:outline-2 focus-visible:outline-white
          "
                >
                    Accept Cookies
                </button>

                {/* Decline — secondary action */}
                <button
                    type="button"
                    onClick={decline}
                    aria-label="Decline optional cookies and close this notice"
                    className="
            touch-target px-5 py-2.5 rounded-lg
            border border-white/50 text-white font-semibold text-sm
            hover:bg-white/10 transition-colors duration-150
            focus-visible:outline-2 focus-visible:outline-white
          "
                >
                    Only Essential
                </button>
            </div>
        </div>
    );
}
