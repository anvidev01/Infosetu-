/**
 * QuickActionCard.tsx — Individual Quick Action tile
 * WCAG 2.5.8 — 44×44px minimum touch target
 * WCAG 1.1.1 — descriptive icon aria-hidden, link has visible text
 * WCAG 2.4.4 — link purpose clear from context
 */
import Link from "next/link";

export interface QuickAction {
    id: string;
    label: string;       /* short tile label          */
    description: string; /* subtitle / helper text    */
    icon: string;        /* emoji or SVG component    */
    href: string;        /* destination URL           */
    category: "personal" | "family" | "financial" | "grievance";
    isNew?: boolean;
    isPopular?: boolean;
}

interface QuickActionCardProps {
    action: QuickAction;
}

const CATEGORY_COLORS: Record<QuickAction["category"], { bg: string; text: string; ring: string }> = {
    personal: { bg: "bg-[#E8EAF6]", text: "text-[#1A237E]", ring: "ring-[#1A237E]/20" },
    family: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", ring: "ring-[#2E7D32]/20" },
    financial: { bg: "bg-[#FFF8E1]", text: "text-[#E65100]", ring: "ring-[#E65100]/20" },
    grievance: { bg: "bg-[#FCE4EC]", text: "text-[#880E4F]", ring: "ring-[#880E4F]/20" },
};

export default function QuickActionCard({ action }: QuickActionCardProps) {
    const colors = CATEGORY_COLORS[action.category];

    return (
        <Link
            href={action.href}
            /* WCAG 2.4.4 — link purpose clear from aria-label */
            aria-label={`${action.label} — ${action.description}`}
            className="
        group relative flex flex-col items-center text-center
        bg-white rounded-2xl p-5 gap-3
        border border-gray-100
        shadow-sm hover:shadow-lg
        transition-all duration-200
        hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#1A237E]
        /* WCAG 2.5.8 — min 44×44px, card is fully clickable */
        min-h-[140px]
      "
        >
            {/* Badge(s) */}
            {action.isPopular && (
                <span
                    aria-label="Popular service"
                    className="
            absolute top-3 right-3
            text-[10px] font-bold uppercase tracking-wide
            bg-[#1A237E] text-white px-2 py-0.5 rounded-full
          "
                >
                    Popular
                </span>
            )}
            {action.isNew && (
                <span
                    aria-label="New service"
                    className="
            absolute top-3 right-3
            text-[10px] font-bold uppercase tracking-wide
            bg-[#2E7D32] text-white px-2 py-0.5 rounded-full
          "
                >
                    New
                </span>
            )}

            {/* Icon container */}
            <div
                aria-hidden="true"
                className={`
          w-14 h-14 rounded-xl flex items-center justify-center text-2xl
          ${colors.bg} ${colors.ring} ring-1
          group-hover:scale-110 transition-transform duration-200
        `}
            >
                {action.icon}
            </div>

            {/* Label — h3 inside a grid section (correct hierarchy from page h2) */}
            <div>
                <h3 className={`text-sm font-bold leading-tight ${colors.text}`}>
                    {action.label}
                </h3>
                <p className="text-xs text-[#616161] mt-1 leading-snug">
                    {action.description}
                </p>
            </div>

            {/* Arrow — decorative, indicates interactivity */}
            <span
                aria-hidden="true"
                className={`
          text-xs font-bold flex items-center gap-1 mt-auto
          ${colors.text} opacity-0 group-hover:opacity-100
          transition-opacity duration-150
        `}
            >
                Apply now →
            </span>
        </Link>
    );
}
