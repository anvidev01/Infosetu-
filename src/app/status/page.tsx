/**
 * app/status/page.tsx — Application Status Tracker
 * GIGW 3.0 · WCAG 2.2 AA
 * Searches by ARN or mobile number; shows timeline.
 */
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* ── Demo statuses — replace with actual API ── */
const DEMO_STATUSES: Record<string, {
    arn: string; service: string; applicant: string;
    submitted: string; expected: string;
    status: "submitted" | "under_review" | "approved" | "rejected" | "action_required";
    timeline: { date: string; label: string; detail: string; done: boolean }[];
}> = {
    "ARN-TEST-001": {
        arn: "ARN-TEST-001", service: "Aadhaar Card", applicant: "Ramesh Kumar",
        submitted: "15 Feb 2026", expected: "15 Apr 2026",
        status: "under_review",
        timeline: [
            { date: "15 Feb", label: "Application Submitted", detail: "Application received successfully", done: true },
            { date: "17 Feb", label: "Documents Verified", detail: "Submitted documents verified", done: true },
            { date: "20 Feb", label: "Biometric Processing", detail: "Biometric data under processing", done: true },
            { date: "—", label: "Quality Check", detail: "Final quality check pending", done: false },
            { date: "—", label: "Card Dispatch", detail: "Aadhaar card will be posted to address", done: false },
        ],
    },
};

const STATUS_META = {
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    under_review: { label: "Under Review", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    approved: { label: "Approved", color: "bg-green-100 text-[#2E7D32]", dot: "bg-[#2E7D32]" },
    rejected: { label: "Rejected", color: "bg-red-100 text-[#C62828]", dot: "bg-[#C62828]" },
    action_required: { label: "Action Required", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
};

function StatusContent() {
    const searchParams = useSearchParams();
    const initArn = searchParams.get("arn") ?? "";

    const [query, setQuery] = useState(initArn);
    const [searched, setSearched] = useState(!!initArn);
    const [result, setResult] = useState(initArn ? DEMO_STATUSES[initArn] ?? null : null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) { setError("Please enter an ARN or mobile number"); return; }
        setLoading(true); setError(""); setSearched(false);

        /* Simulate API call */
        await new Promise((r) => setTimeout(r, 800));
        const found = DEMO_STATUSES[query.toUpperCase()] ?? null;
        setResult(found);
        setSearched(true);
        setLoading(false);

        if (!found) setError("No application found for this ARN / mobile number.");
    }

    return (
        <div className="max-w-screen-md mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-[#616161]">
                    <li><a href="/" className="hover:text-[#1A237E] hover:underline">Home</a></li>
                    <li aria-hidden="true">›</li>
                    <li className="text-[#1A237E] font-semibold" aria-current="page">Check Status</li>
                </ol>
            </nav>

            {/* H1 */}
            <h1 className="text-2xl font-black text-[#1A237E] mb-2">Track Your Application</h1>
            <p className="text-sm text-[#616161] mb-8">Enter your Application Reference Number (ARN) or registered mobile number.</p>

            {/* Search form */}
            <form
                onSubmit={handleSearch}
                role="search"
                aria-label="Search application status"
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label htmlFor="arn-input" className="text-sm font-semibold text-[#111111] mb-1.5 block">
                            ARN / Mobile Number <span aria-hidden="true" className="text-[#C62828]">*</span>
                        </label>
                        <input
                            id="arn-input"
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setError(""); }}
                            placeholder="e.g. ARN-TEST-001 or 9876543210"
                            aria-required="true"
                            aria-invalid={!!error}
                            aria-describedby={error ? "search-error" : undefined}
                            className="
                w-full h-12 px-4 rounded-xl border-2 text-base
                border-gray-200 focus:border-[#1A237E] focus:ring-2 focus:ring-[#1A237E]/15
                focus:outline-none transition-all
              "
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        aria-label="Track application status"
                        aria-busy={loading}
                        className="
              touch-target sm:self-end px-6 h-12 rounded-xl
              bg-[#1A237E] text-white font-bold text-sm
              hover:bg-[#283593] disabled:opacity-60
              active:scale-95 transition-all duration-150
            "
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg aria-hidden="true" className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Searching…
                            </span>
                        ) : "Track Status"}
                    </button>
                </div>

                {error && (
                    <p id="search-error" role="alert" className="mt-3 text-sm font-semibold text-[#C62828] flex items-center gap-1.5">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="#C62828" />
                            <path d="M8 4.5v3.5M8 10v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error}
                    </p>
                )}

                {/* Demo hint */}
                <p className="text-xs text-[#616161] mt-3">
                    Demo: try <button type="button" className="underline font-semibold text-[#1A237E]" onClick={() => setQuery("ARN-TEST-001")}>ARN-TEST-001</button>
                </p>
            </form>

            {/* Results */}
            {searched && result && (
                <div className="animate-slideUp space-y-6" aria-live="polite" aria-atomic="true">
                    {/* Status card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-base font-bold text-[#1A237E] mb-4">Application Details</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: "ARN", value: result.arn },
                                { label: "Service", value: result.service },
                                { label: "Applicant", value: result.applicant },
                                { label: "Date Submitted", value: result.submitted },
                                { label: "Expected By", value: result.expected },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <dt className="text-xs text-[#616161] font-semibold mb-0.5">{label}</dt>
                                    <dd className="text-sm font-bold text-[#111111]">{value}</dd>
                                </div>
                            ))}
                            <div>
                                <dt className="text-xs text-[#616161] font-semibold mb-1">Current Status</dt>
                                <dd>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_META[result.status].color}`}>
                                        <span aria-hidden="true" className={`w-2 h-2 rounded-full ${STATUS_META[result.status].dot}`} />
                                        {STATUS_META[result.status].label}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-base font-bold text-[#1A237E] mb-5">Application Timeline</h2>
                        <ol aria-label="Application processing timeline" className="relative pl-6 space-y-0">
                            {/* Vertical connector line */}
                            <div aria-hidden="true" className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-200" />

                            {result.timeline.map((item, idx) => (
                                <li key={idx} className="relative pb-6 last:pb-0">
                                    {/* Step dot */}
                                    <div
                                        aria-hidden="true"
                                        className={`
                      absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${item.done
                                                ? "bg-[#2E7D32] border-[#2E7D32]"
                                                : "bg-white border-gray-300"}
                    `}
                                    >
                                        {item.done && (
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="ml-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className={`text-sm font-semibold ${item.done ? "text-[#111111]" : "text-[#616161]"}`}>
                                                {item.label}
                                            </p>
                                            {item.date !== "—" && (
                                                <span className="text-[10px] text-[#616161] bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {item.date}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#616161] mt-0.5">{item.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href={`/apply/${result.service.toLowerCase().replace(/\s/g, "-")}`}
                            className="touch-target flex-1 text-center py-3 rounded-xl border-2 border-[#1A237E] text-[#1A237E] font-bold text-sm hover:bg-[#E8EAF6] transition-colors"
                        >
                            Apply for Another Service
                        </a>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="touch-target flex-1 py-3 rounded-xl bg-[#1A237E] text-white font-bold text-sm hover:bg-[#283593] transition-colors"
                            aria-label="Print or save this application status"
                        >
                            🖨 Print / Save PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Suspense boundary required for useSearchParams in Next.js 15 */
export default function StatusPage() {
    return (
        <Suspense fallback={
            <div className="max-w-screen-md mx-auto px-4 py-16 text-center text-[#616161]" aria-busy="true">
                Loading…
            </div>
        }>
            <StatusContent />
        </Suspense>
    );
}
