// Design Tokens - Centralized Color & Theme System
// Based on UI/UX best practices and accessibility standards

export const SEVERITY_COLORS = {
    critical: {
        border: 'border-l-red-600',
        bg: 'bg-red-600',
        text: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-950',
        gradient: 'red' as const,
        hex: '#DC2626',
    },
    high: {
        border: 'border-l-orange-600',
        bg: 'bg-orange-600',
        text: 'text-orange-600 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-950',
        gradient: 'orange' as const,
        hex: '#EA580C',
    },
    medium: {
        border: 'border-l-amber-500',
        bg: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-100 dark:bg-amber-950',
        gradient: 'orange' as const,
        hex: '#F59E0B',
    },
    low: {
        border: 'border-l-green-500',
        bg: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-950',
        gradient: 'green' as const,
        hex: '#10B981',
    },
    info: {
        border: 'border-l-blue-500',
        bg: 'bg-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-950',
        gradient: 'blue' as const,
        hex: '#3B82F6',
    },
} as const;

export const METRIC_CATEGORIES = {
    financial: {
        border: 'border-l-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-950',
        gradient: 'blue' as const,
    },
    risk: {
        border: 'border-l-orange-500',
        text: 'text-orange-600 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-950',
        gradient: 'orange' as const,
    },
    performance: {
        border: 'border-l-green-500',
        text: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-950',
        gradient: 'green' as const,
    },
    warning: {
        border: 'border-l-red-500',
        text: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-950',
        gradient: 'red' as const,
    },
    neutral: {
        border: 'border-l-purple-500',
        text: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-100 dark:bg-purple-950',
        gradient: 'purple' as const,
    },
} as const;

// Helper function to get severity level based on risk score
export function getRiskSeverity(score: number): keyof typeof SEVERITY_COLORS {
    if (score >= 0.15) return 'critical';
    if (score >= 0.08) return 'high';
    if (score >= 0.03) return 'medium';
    return 'low';
}

// Helper function to get color by status
export function getStatusColor(status: string): typeof SEVERITY_COLORS[keyof typeof SEVERITY_COLORS] {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('critical') || statusLower.includes('overdue')) return SEVERITY_COLORS.critical;
    if (statusLower.includes('high') || statusLower.includes('urgent')) return SEVERITY_COLORS.high;
    if (statusLower.includes('medium') || statusLower.includes('warning')) return SEVERITY_COLORS.medium;
    if (statusLower.includes('low') || statusLower.includes('resolved') || statusLower.includes('closed')) return SEVERITY_COLORS.low;
    return SEVERITY_COLORS.info;
}
