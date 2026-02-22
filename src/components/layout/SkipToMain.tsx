/**
 * SkipToMain.tsx — WCAG 2.4.1 Bypass Block
 * First focusable element on every page.
 * Visually hidden until keyboard-focused; jumps to #main-content.
 */
export default function SkipToMain() {
    return (
        <a
            href="#main-content"
            className="skip-link"
            /* Accessibility: Announce purpose clearly */
            aria-label="Skip navigation and go to main content"
        >
            Skip to Main Content
        </a>
    );
}
