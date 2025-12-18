// Accessibility Pattern Definitions for Color-Blind Users
// SVG patterns to supplement color-coding

export const AccessibilityPatterns = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
            {/* Critical/High Risk - Diagonal Stripes */}
            <pattern id="pattern-critical" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </pattern>

            {/* Medium Risk - Dots */}
            <pattern id="pattern-medium" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="1.5" fill="currentColor" opacity="0.3" />
            </pattern>

            {/* Low Risk - Horizontal Lines */}
            <pattern id="pattern-low" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0,4 l8,0" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            </pattern>

            {/* Very Low/Safe - Crosshatch */}
            <pattern id="pattern-safe" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0,0 l8,8 M8,0 l-8,8" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </pattern>
        </defs>
    </svg>
);

// Helper to get pattern ID for accessibility overlay
export function getAccessibilityPattern(score: number): string | null {
    if (score >= 0.15) return 'url(#pattern-critical)';
    if (score >= 0.08) return 'url(#pattern-medium)';
    if (score >= 0.03) return 'url(#pattern-low)';
    return 'url(#pattern-safe)';
}
