/**
 * QuickActionGrid.tsx — Category-tabbed grid of Quick Action tiles
 * WCAG 4.1.1 — ARIA tab panel pattern (role="tablist", role="tab", role="tabpanel")
 * WCAG 2.1.1 — full keyboard navigation (arrow keys handled)
 */
"use client";

import { useState, useRef, KeyboardEvent } from "react";
import QuickActionCard, { type QuickAction } from "./QuickActionCard";

/* ── All 16 Quick Action tiles ─────────────────────────────── */
const ALL_ACTIONS: QuickAction[] = [
    /* Personal */
    { id: "aadhaar", category: "personal", icon: "🪪", label: "Apply for Aadhaar", description: "Enrol or get a new Aadhaar card", href: "/apply/aadhaar", isPopular: true },
    { id: "pan", category: "personal", icon: "💳", label: "Update PAN", description: "Correct or update your PAN details", href: "/apply/pan" },
    { id: "passport", category: "personal", icon: "📘", label: "Track Passport", description: "Check passport application status", href: "/status?type=passport" },
    { id: "licence", category: "personal", icon: "🚗", label: "Download Licence", description: "Get your driving licence PDF", href: "/services/driving-licence" },
    /* Family */
    { id: "birth", category: "family", icon: "👶", label: "Birth Certificate", description: "Apply for a birth certificate", href: "/apply/birth-certificate" },
    { id: "marriage", category: "family", icon: "💍", label: "Marriage Registration", description: "Register your marriage online", href: "/apply/marriage-registration" },
    { id: "ration", category: "family", icon: "🍚", label: "Ration Card", description: "Apply or update ration card", href: "/apply/ration-card" },
    { id: "school", category: "family", icon: "🏫", label: "School Admission", description: "Admission to government schools", href: "/apply/school-admission", isNew: true },
    /* Financial */
    { id: "pmkisan", category: "financial", icon: "🌾", label: "PM-KISAN Status", description: "Check your PM-KISAN instalment status", href: "/services/pm-kisan", isPopular: true },
    { id: "pension", category: "financial", icon: "🧓", label: "Check Pension", description: "View your pension account details", href: "/services/pension" },
    { id: "itr", category: "financial", icon: "📊", label: "File ITR", description: "File your income tax return", href: "/services/itr" },
    { id: "gst", category: "financial", icon: "🏢", label: "GST Registration", description: "Register your business for GST", href: "/apply/gst-registration" },
    /* Grievance */
    { id: "complaint", category: "grievance", icon: "📣", label: "File Complaint", description: "Register a complaint with authorities", href: "/apply/complaint" },
    { id: "track-griev", category: "grievance", icon: "🔍", label: "Track Grievance", description: "Track your filed grievance", href: "/status?type=grievance" },
    { id: "escalate", category: "grievance", icon: "⬆️", label: "Escalate Issue", description: "Escalate unresolved grievance", href: "/services/escalate" },
    { id: "rti", category: "grievance", icon: "📜", label: "RTI Request", description: "File Right to Information request", href: "/apply/rti", isNew: true },
];

const TABS = [
    { id: "all", label: "All Services" },
    { id: "personal", label: "Personal" },
    { id: "family", label: "Family" },
    { id: "financial", label: "Financial" },
    { id: "grievance", label: "Grievance" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function QuickActionGrid() {
    const [activeTab, setActiveTab] = useState<TabId>("all");
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const filtered = activeTab === "all"
        ? ALL_ACTIONS
        : ALL_ACTIONS.filter((a) => a.category === activeTab);

    /* Arrow-key navigation between tabs (WCAG 2.1.1) */
    function handleKeyDown(e: KeyboardEvent, idx: number) {
        if (e.key === "ArrowRight") {
            const next = (idx + 1) % TABS.length;
            tabRefs.current[next]?.focus();
            setActiveTab(TABS[next].id);
        } else if (e.key === "ArrowLeft") {
            const prev = (idx - 1 + TABS.length) % TABS.length;
            tabRefs.current[prev]?.focus();
            setActiveTab(TABS[prev].id);
        }
    }

    return (
        <section aria-label="Quick action services">
            {/* Tab bar */}
            <div
                role="tablist"
                aria-label="Filter services by category"
                className="flex gap-2 flex-wrap mb-6"
            >
                {TABS.map((tab, idx) => (
                    <button
                        key={tab.id}
                        ref={(el) => { tabRefs.current[idx] = el; }}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                        onClick={() => setActiveTab(tab.id)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className={`
              touch-target px-4 py-2 rounded-full text-sm font-semibold
              transition-all duration-150 border
              ${activeTab === tab.id
                                ? "bg-[#1A237E] text-white border-[#1A237E] shadow-sm"
                                : "bg-white text-[#616161] border-gray-200 hover:border-[#1A237E] hover:text-[#1A237E]"
                            }
            `}
                    >
                        {tab.label}
                        {/* Count badge */}
                        <span
                            aria-hidden="true"
                            className={`
                ml-1.5 text-xs opacity-70
                ${activeTab === tab.id ? "text-white" : "text-[#616161]"}
              `}
                        >
                            ({tab.id === "all" ? ALL_ACTIONS.length : ALL_ACTIONS.filter((a) => a.category === tab.id).length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Grid panel */}
            <div
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                className="
          grid grid-cols-2 gap-3
          sm:grid-cols-3
          lg:grid-cols-4
          animate-fadeIn
        "
            >
                {filtered.map((action) => (
                    <QuickActionCard key={action.id} action={action} />
                ))}
            </div>
        </section>
    );
}
