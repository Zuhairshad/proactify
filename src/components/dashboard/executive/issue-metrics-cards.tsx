import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskIssue } from "@/lib/types";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { Sparkline } from "@/components/ui/sparkline";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { METRIC_CATEGORIES } from "@/lib/design-tokens";
import { TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react";

type IssueMetricsCardsProps = {
    issues: RiskIssue[];
};

export function IssueMetricsCards({ issues }: IssueMetricsCardsProps) {
    // Calculate metrics
    const totalIssues = issues.length;
    const openIssues = issues.filter(i => i.Status === 'Open' || i.Status === 'Escalated').length;
    const closedIssues = issues.filter(i => i.Status === 'Closed').length;
    const criticalIssues = issues.filter(i => i.Priority === 'Critical' || i.Priority === '(1) High').length;
    const escalatedIssues = issues.filter(i => i.Status === 'Escalated').length;

    // Calculate impact
    const totalImpact = issues.reduce((sum, i) => {
        const impactValue = (i as any)['Impact ($)'] || 0;
        return sum + impactValue;
    }, 0);

    // Calculate avg resolution time (mock for now, would need historical data)
    const avgResolutionDays = 15;

    // Calculate overdue
    const now = new Date();
    const overdueIssues = issues.filter(i => {
        if (!i.DueDate) return false;
        const dueDate = new Date(i.DueDate);
        return dueDate < now && (i.Status === 'Open' || i.Status === 'Escalated');
    }).length;

    // Calculate response coverage
    const withResponse = issues.filter(i => i.Response && i.Response !== null).length;
    const responseCoverage = totalIssues > 0 ? Math.round((withResponse / totalIssues) * 100) : 0;

    // Calculate escalation rate
    const escalationRate = totalIssues > 0 ? Math.round((escalatedIssues / totalIssues) * 100) : 0;

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value.toFixed(0)}`;
    };

    // Mock trend data (would come from API)
    const generateTrendData = (baseValue: number, trend: 'up' | 'down' | 'stable') => {
        const points = 7;
        const data = [];
        for (let i = 0; i < points; i++) {
            let variance = Math.random() * 0.1;
            if (trend === 'up') variance += i * 0.05;
            if (trend === 'down') variance -= i * 0.05;
            data.push(baseValue * (1 + variance));
        }
        return data;
    };

    const metrics = [
        {
            title: "Total Issues",
            value: totalIssues,
            numericValue: totalIssues,
            category: METRIC_CATEGORIES.neutral,
            trend: { value: 0, direction: 'stable' as const },
            sparklineData: generateTrendData(totalIssues, 'stable'),
            isNumeric: true,
        },
        {
            title: "Open Issues",
            value: openIssues,
            numericValue: openIssues,
            category: openIssues > 5 ? METRIC_CATEGORIES.warning : METRIC_CATEGORIES.performance,
            trend: { value: 15, direction: 'up' as const },
            sparklineData: generateTrendData(openIssues, 'up'),
            isNumeric: true,
        },
        {
            title: "Avg Resolution Time",
            value: `${avgResolutionDays} days`,
            numericValue: avgResolutionDays,
            category: avgResolutionDays > 20 ? METRIC_CATEGORIES.warning : METRIC_CATEGORIES.performance,
            trend: { value: 13, direction: avgResolutionDays > 15 ? 'up' as const : 'down' as const },
            sparklineData: generateTrendData(avgResolutionDays, 'up'),
            isNumeric: false,
            icon: Clock,
        },
        {
            title: "Critical Issues",
            value: criticalIssues,
            numericValue: criticalIssues,
            category: METRIC_CATEGORIES.risk,
            trend: { value: 0, direction: 'stable' as const },
            sparklineData: generateTrendData(criticalIssues, 'stable'),
            isNumeric: true,
            icon: AlertCircle,
            pulse: criticalIssues > 0,
        },
        {
            title: "Total Impact ($)",
            value: formatCurrency(totalImpact),
            numericValue: totalImpact,
            category: METRIC_CATEGORIES.financial,
            trend: { value: 8, direction: 'up' as const },
            sparklineData: generateTrendData(totalImpact, 'up'),
            isNumeric: false,
        },
        {
            title: "Escalation Rate",
            value: `${escalationRate}%`,
            numericValue: escalationRate,
            category: escalationRate > 10 ? METRIC_CATEGORIES.warning : METRIC_CATEGORIES.performance,
            trend: { value: 5, direction: 'down' as const },
            sparklineData: generateTrendData(escalationRate, 'down'),
            isNumeric: false,
        },
        {
            title: "Response Coverage",
            value: `${responseCoverage}%`,
            numericValue: responseCoverage,
            category: responseCoverage < 70 ? METRIC_CATEGORIES.warning : METRIC_CATEGORIES.performance,
            trend: { value: 10, direction: 'up' as const },
            sparklineData: generateTrendData(responseCoverage, 'up'),
            isNumeric: false,
        },
        {
            title: "Overdue Issues",
            value: overdueIssues,
            numericValue: overdueIssues,
            category: overdueIssues > 0 ? METRIC_CATEGORIES.warning : METRIC_CATEGORIES.performance,
            trend: { value: 0, direction: 'stable' as const },
            sparklineData: generateTrendData(overdueIssues, 'stable'),
            isNumeric: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {metrics.map((metric, index) => (
                <Card
                    key={index}
                    className={cn(
                        "relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                        "border-l-4",
                        metric.category.border,
                        metric.pulse && "animate-pulse-slow"
                    )}
                >
                    <AnimatedGradient variant={metric.category.gradient} />
                    <CardHeader className="pb-2 space-y-0 relative z-10">
                        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            {metric.icon && <metric.icon className="h-3 w-3" />}
                            {metric.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-2">
                        <div className="flex items-baseline justify-between">
                            <div className="text-xl font-bold tracking-tight">
                                {metric.isNumeric ? (
                                    <AnimatedNumber value={metric.numericValue as number} duration={1500} />
                                ) : (
                                    metric.value
                                )}
                            </div>
                            {metric.trend && metric.trend.value > 0 && (
                                <div className={cn(
                                    "flex items-center gap-0.5 text-xs font-medium",
                                    metric.trend.direction === 'up'
                                        ? "text-red-600 dark:text-red-400"  // Up is bad for issues
                                        : metric.trend.direction === 'down'
                                            ? "text-green-600 dark:text-green-400"  // Down is good for issues
                                            : "text-muted-foreground"
                                )}>
                                    {metric.trend.direction === 'up' ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : metric.trend.direction === 'down' ? (
                                        <TrendingDown className="h-3 w-3" />
                                    ) : null}
                                    {metric.trend.value}%
                                </div>
                            )}
                        </div>
                        {metric.sparklineData && (
                            <div className="mt-1 -mx-2">
                                <Sparkline
                                    data={metric.sparklineData}
                                    color={metric.category.gradient === 'blue' ? '#3B82F6' :
                                        metric.category.gradient === 'green' ? '#10B981' :
                                            metric.category.gradient === 'orange' ? '#EA580C' :
                                                metric.category.gradient === 'red' ? '#DC2626' : '#8B5CF6'}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
