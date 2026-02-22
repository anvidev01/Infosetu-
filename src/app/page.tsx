/**
 * app/page.tsx — Hub Dashboard (Home)
 * GIGW 3.0 · WCAG 2.2 AA
 * H1: "Welcome to InfoSetu" → H2: "Quick Actions" & "Notifications"
 */
import type { Metadata } from "next";
import SearchBar from "@/components/dashboard/SearchBar";
import QuickActionGrid from "@/components/dashboard/QuickActionGrid";
import NotificationPanel from "@/components/dashboard/NotificationPanel";

export const metadata: Metadata = {
  title: "Dashboard — All Citizen Services",
  description:
    "Access Aadhaar, PAN, Passport, Ration Card, ITR filing and 100+ government " +
    "services in one place. InfoSetu — integrated digital services for every Indian citizen.",
};

export default function DashboardPage() {
  return (
    <>
      {/* ── Hero / Welcome banner ── */}
      <section
        className="bg-[#1A237E] text-white pt-10 pb-14 px-4"
        aria-labelledby="dashboard-heading"
      >
        <div className="max-w-screen-xl mx-auto">
          {/* H1 — one per page, represents the page purpose */}
          <h1
            id="dashboard-heading"
            className="text-2xl sm:text-3xl font-black mb-1 leading-tight"
          >
            Welcome to InfoSetu 🇮🇳
          </h1>
          <p className="text-white/80 text-base mb-6 max-w-xl">
            सरकारी सेवाएं, एक जगह। — Government services, all in one place.
          </p>

          {/* Search */}
          <SearchBar />

          {/* Popular tags */}
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Popular services quick links">
            {["Aadhaar", "PAN Card", "PM-KISAN", "Passport", "Ration Card", "ITR"].map((tag) => (
              <a
                key={tag}
                href={`/services?q=${encodeURIComponent(tag)}`}
                className="
                  px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold
                  hover:bg-white/25 transition-colors duration-150
                  border border-white/20
                "
                aria-label={`Search for ${tag}`}
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content area ── */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left: Quick Actions (2/3 width on large) */}
          <div className="lg:col-span-2">
            {/* H2 for the services section */}
            <h2 className="text-xl font-black text-[#1A237E] mb-5">
              Quick Actions
            </h2>
            <QuickActionGrid />
          </div>

          {/* Right: Notifications sidebar */}
          {/* <aside> landmark for supplementary content */}
          <aside aria-label="Your notifications and pending items">
            <h2 className="text-xl font-black text-[#1A237E] mb-5">
              Your Dashboard
            </h2>

            {/* User status card */}
            <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-[#1A237E]/10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full bg-[#E8EAF6] flex items-center justify-center text-2xl"
                  aria-hidden="true"
                >
                  👤
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111111]">Welcome, Citizen</p>
                  <p className="text-xs text-[#616161]">Last login: Today, 13:42</p>
                </div>
              </div>
              <a
                href="/login"
                className="
                  block w-full text-center
                  touch-target py-2.5 rounded-xl
                  bg-[#1A237E] text-white text-sm font-bold
                  hover:bg-[#283593] transition-colors duration-150
                "
                aria-label="Sign in to your InfoSetu account to track applications"
              >
                Sign In to Track Applications
              </a>
            </div>

            {/* Notifications */}
            <NotificationPanel />

            {/* Help link */}
            <div className="mt-5 bg-[#E8F5E9] rounded-2xl p-4 border border-[#2E7D32]/20">
              <p className="text-sm font-bold text-[#2E7D32] mb-1">Need help?</p>
              <p className="text-xs text-[#2E7D32]/80 mb-3">
                Call our helpline or chat with us in your language.
              </p>
              <div className="flex gap-2">
                <a
                  href="tel:1800111555"
                  className="
                    flex-1 text-center py-2 rounded-lg
                    bg-[#2E7D32] text-white text-xs font-bold
                    hover:bg-green-700 transition-colors
                  "
                  aria-label="Call toll-free helpline 1800-111-555"
                >
                  📞 1800-111-555
                </a>
                <a
                  href="/help"
                  className="
                    flex-1 text-center py-2 rounded-lg
                    border border-[#2E7D32] text-[#2E7D32] text-xs font-bold
                    hover:bg-[#2E7D32] hover:text-white transition-colors
                  "
                >
                  Help Centre
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}