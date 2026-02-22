/**
 * GovFooter.tsx — GIGW 3.0 mandatory footer
 * Includes all legally required links, Grievance Officer details,
 * NIC/STQC certification badge, and dynamic Last Updated date.
 * WCAG: landmark <footer>, contentinfo role, descriptive link text.
 */
"use client";

const LAST_UPDATED = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
});

const LEGAL_LINKS = [
    { href: "/accessibility-statement", label: "Accessibility Statement" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use", label: "Terms of Use" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/website-policies", label: "Website Policies" },
    { href: "/sitemap", label: "Sitemap" },
    { href: "/rss", label: "RSS Feeds" },
    { href: "/contact", label: "Contact Us" },
];

const QUICK_LINKS = [
    { href: "/services", label: "All Services" },
    { href: "/status", label: "Track Application" },
    { href: "/apply/aadhaar", label: "Apply for Aadhaar" },
    { href: "/apply/pan", label: "Update PAN" },
    { href: "/apply/passport", label: "Track Passport" },
    { href: "/grievance", label: "File Grievance" },
    { href: "/help", label: "Help & FAQs" },
];

export default function GovFooter() {
    return (
        <footer
            className="bg-[#1A237E] text-white"
            aria-label="Site footer — Government of India Infosetu platform"
        >
            {/* ── Main footer grid ── */}
            <div className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                {/* Column 1: Branding */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/emblem-white.png"
                            alt="State Emblem of India — Satyameva Jayate"
                            width={36}
                            height={36}
                            className="w-9 h-9 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span className="text-lg font-black tracking-tight">InfoSetu</span>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed mb-4">
                        Integrated Government Digital Services Platform for all Indian citizens.
                        Powered by MeitY &amp; NIC.
                    </p>
                    {/* Social links */}
                    <div className="flex gap-3" aria-label="Social media links">
                        {[
                            { href: "https://twitter.com/meity_official", label: "MeitY on Twitter/X", icon: "𝕏" },
                            { href: "https://www.youtube.com/@meity", label: "MeitY on YouTube", icon: "▶" },
                            { href: "https://facebook.com/meityofficial", label: "MeitY on Facebook", icon: "f" },
                        ].map(({ href, label, icon }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${label} (opens in new tab)`}
                                className="
                  touch-target w-9 h-9 flex items-center justify-center
                  rounded-full bg-white/10 text-sm font-bold
                  hover:bg-white/25 transition-colors duration-150
                "
                            >
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <nav aria-label="Quick service links">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">
                        Quick Links
                    </h2>
                    <ul className="space-y-2">
                        {QUICK_LINKS.map(({ href, label }) => (
                            <li key={href}>
                                <a
                                    href={href}
                                    className="
                    text-sm text-white/80 hover:text-white
                    underline-offset-2 hover:underline
                    transition-colors duration-100
                  "
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Column 3: Legal Links */}
                <nav aria-label="Legal and policy links">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">
                        Policies
                    </h2>
                    <ul className="space-y-2">
                        {LEGAL_LINKS.map(({ href, label }) => (
                            <li key={href}>
                                <a
                                    href={href}
                                    className="
                    text-sm text-white/80 hover:text-white
                    underline-offset-2 hover:underline
                    transition-colors duration-100
                  "
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Column 4: Grievance Officer */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">
                        Grievance Officer
                    </h2>
                    <address className="not-italic text-sm text-white/80 leading-relaxed space-y-1">
                        <p className="font-semibold text-white">Shri Rajesh Kumar</p>
                        <p>Director, MeitY</p>
                        <p>
                            <a
                                href="mailto:grievance@meity.gov.in"
                                className="underline hover:text-white transition-colors"
                                aria-label="Email grievance officer at grievance@meity.gov.in"
                            >
                                grievance@meity.gov.in
                            </a>
                        </p>
                        <p>
                            <a
                                href="tel:+911123048000"
                                className="underline hover:text-white transition-colors"
                                aria-label="Call grievance officer at +91 11 2304 8000"
                            >
                                +91 11 2304 8000
                            </a>
                        </p>
                    </address>

                    {/* NIC / STQC Certification Badge */}
                    <div className="mt-6 flex items-center gap-3">
                        <div
                            className="
                flex items-center gap-1.5
                bg-white/10 rounded-lg px-3 py-2
              "
                            aria-label="NIC certified website"
                        >
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="7" stroke="#4CAF50" strokeWidth="1.5" />
                                <path d="M5 8l2 2 4-4" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xs font-bold text-white/90">NIC Certified</span>
                        </div>
                        <div
                            className="
                flex items-center gap-1.5
                bg-white/10 rounded-lg px-3 py-2
              "
                            aria-label="STQC certified website"
                        >
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="7" stroke="#2196F3" strokeWidth="1.5" />
                                <path d="M5 8l2 2 4-4" stroke="#2196F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-xs font-bold text-white/90">STQC</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom copyright bar ── */}
            <div className="border-t border-white/15">
                <div className="max-w-screen-xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
                    <p>
                        Copyright &copy; 2026 Ministry of Electronics &amp; Information Technology,
                        Government of India. All Rights Reserved.
                    </p>
                    <p>
                        <span>Last Updated: </span>
                        <time dateTime={new Date().toISOString().split("T")[0]}>
                            {LAST_UPDATED}
                        </time>
                    </p>
                </div>
            </div>
        </footer>
    );
}
