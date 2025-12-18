import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskIssue } from "@/lib/types";
import { AlertCircle, Clock, DollarSign, Activity, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type IssueInsightsPanelProps = {
    issues: RiskIssue[];
};

export function IssueInsightsPanel({ issues }: IssueInsightsPanelProps) {
    // Calculate insights
    const criticalCount = issues.filter(i =>
        i.Priority === 'Critical' || i.Priority === '(1) High'
    ).length;

    const now = new Date();
    const agingIssues = issues.filter(i => {
        if (!i.createdAt) return false;
        const created = new Date(i.createdAt);
        const daysOpen = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return daysOpen > 30 && (i.Status === 'Open' || i.Status === 'Escalated');
    }).length;

    const totalImpact = issues.reduce((sum, i) => sum + (i['Impact ($)'] || 0), 0);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value.toFixed(0)}`;
    };

    // Mock avg resolution time (would come from trend API)
    const avgResolutionDays = 15;
    const previousAvg = 13;
    const resolutionTrend = avgResolutionDays > previousAvg ? 'slower' : 'faster';
    const resolutionChange = Math.abs(avgResolutionDays - previousAvg);

    const insights = [
        {
            icon: AlertCircle,
            title: "Critical Issues Alert",
            message: criticalCount > 0
                ? `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} require${criticalCount === 1 ? 's' : ''} immediate attention`
                : "No critical issues at this time",
            color: criticalCount > 0 ? "red" : "green",
            priority: 1,
        },
        {
            icon: Clock,
            title: "Aging Analysis",
            message: agingIssues > 0
                ? `${agingIssues} issue${agingIssues > 1 ? 's' : ''} ha${agingIssues === 1 ? 's' : 've'} been open >30 days`
                : "All issues are being addressed in a timely manner",
            color: agingIssues > 3 ? "red" : agingIssues > 0 ? "amber" : "green",
            priority: 2,
        },
        {
            icon: DollarSign,
            title: "Impact Analysis",
            message: `Total issue impact: ${formatCurrency(totalImpact)}${totalImpact > 100000 ? ' - significant financial exposure' : ''}`,
            color: totalImpact > 100000 ? "amber" : "blue",
            priority: 3,
        },
        {
            icon: Activity,
            title: "Resolution Velocity",
            message: `Average resolution: ${avgResolutionDays} days (${resolutionTrend === 'slower' ? '↑' : '↓'}${resolutionChange} days vs last month)`,
            color: resolutionTrend === 'slower' ? "amber" : "green",
            priority: 4,
        },
    ];

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'red':
                return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100';
            case 'amber':
                return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100';
            case 'green':
                return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-900 dark:text-green-100';
            case 'blue':
            default:
                return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100';
        }
    };

    const getIconColor = (color: string) => {
        switch (color) {
            case 'red':
                return 'text-red-600 dark:text-red-400';
            case 'amber':
                return 'text-amber-600 dark:text-amber-400';
            case 'green':
                return 'text-green-600 dark:text-green-400';
            case 'blue':
            default:
                return 'text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Smart Issue Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className={cn(
                                "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                                getColorClasses(insight.color)
                            )}
                        >
                            <div className="flex items-start gap-2">
                                <insight.icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", getIconColor(insight.color))} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold mb-1">{insight.title}</p>
                                    <p className="text-xs opacity-90 leading-relaxed">{insight.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
