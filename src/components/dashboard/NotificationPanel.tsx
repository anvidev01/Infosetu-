/**
 * NotificationPanel.tsx
 * Displays pending applications and renewal reminders.
 * WCAG: aria-live="polite", role="region", descriptive headings.
 */
"use client";

import Link from "next/link";

interface Notification {
    id: string;
    type: "pending" | "renewal" | "action" | "success";
    title: string;
    detail: string;
    date: string;
    href?: string;
    arn?: string;
}

/* Demo data — replace with API call */
const NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "pending",
        title: "Passport application pending verification",
        detail: "ARN: PS-2026-00428 · Police verification awaited",
        date: "20 Feb 2026",
        href: "/status?arn=PS-2026-00428",
        arn: "PS-2026-00428",
    },
    {
        id: "2",
        type: "renewal",
        title: "Driving licence expiring soon",
        detail: "Expires 15 Mar 2026 — renew now to avoid penalty",
        date: "22 Feb 2026",
        href: "/apply/licence-renewal",
    },
    {
        id: "3",
        type: "action",
        title: "Ration card — documents required",
        detail: "Upload proof of residence to proceed",
        date: "18 Feb 2026",
        href: "/apply/ration-card",
    },
    {
        id: "4",
        type: "success",
        title: "PAN update successful",
        detail: "Your PAN details have been updated",
        date: "14 Feb 2026",
    },
];

const TYPE_STYLES: Record<Notification["type"], { dot: string; badge: string; label: string }> = {
    pending: { dot: "bg-[#EF6C00]", badge: "bg-orange-50 text-orange-700 border-orange-200", label: "Pending" },
    renewal: { dot: "bg-[#C62828]", badge: "bg-red-50 text-red-700 border-red-200", label: "Renewal" },
    action: { dot: "bg-[#1A237E]", badge: "bg-blue-50 text-blue-700 border-blue-200", label: "Action" },
    success: { dot: "bg-[#2E7D32]", badge: "bg-green-50 text-green-700 border-green-200", label: "Complete" },
};

export default function NotificationPanel() {
    const unread = NOTIFICATIONS.filter((n) => n.type !== "success").length;

    return (
        /* role="complementary" maps to <aside>; region with label for NVDA/JAWS */
        <section
            aria-label="Notifications and reminders"
            aria-live="polite"
            aria-atomic="false"
            className="bg-white rounded-2xl shadow-sm border border-[#1A237E]/10 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-[#1A237E] flex items-center gap-2">
                    Notifications
                    {/* Unread badge */}
                    {unread > 0 && (
                        <span
                            aria-label={`${unread} unread notifications`}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C62828] text-white text-[10px] font-bold"
                        >
                            {unread}
                        </span>
                    )}
                </h2>
                <Link
                    href="/notifications"
                    className="text-xs font-semibold text-[#1A237E] hover:underline"
                    aria-label="View all notifications"
                >
                    View all
                </Link>
            </div>

            {/* Notification list */}
            <ul className="divide-y divide-gray-50" aria-label="Notification items">
                {NOTIFICATIONS.map((n) => {
                    const style = TYPE_STYLES[n.type];
                    return (
                        <li key={n.id} className="px-5 py-4 hover:bg-[#F5F5F5] transition-colors">
                            <div className="flex items-start gap-3">
                                {/* Coloured dot indicator */}
                                <span
                                    aria-hidden="true"
                                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`}
                                />

                                <div className="flex-1 min-w-0">
                                    {/* Title + badge */}
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span
                                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${style.badge}`}
                                        >
                                            {style.label}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#111111] leading-snug">
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-[#616161] mt-0.5">{n.detail}</p>
                                    <p className="text-[11px] text-[#616161]/70 mt-1">{n.date}</p>
                                </div>

                                {/* CTA arrow */}
                                {n.href && (
                                    <Link
                                        href={n.href}
                                        aria-label={`Take action: ${n.title}`}
                                        className="
                      touch-target shrink-0 text-[#1A237E]
                      hover:bg-[#1A237E]/10 rounded-lg
                      flex items-center justify-center
                      transition-colors duration-150
                    "
                                    >
                                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
