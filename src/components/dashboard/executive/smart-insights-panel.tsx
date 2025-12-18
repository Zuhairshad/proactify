import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import type { RiskIssue } from "@/lib/types";
import { cn } from "@/lib/utils";

type SmartInsightsPanelProps = {
    risks: RiskIssue[];
};

export function SmartInsightsPanel({ risks }: SmartInsightsPanelProps) {
    // Generate smart insights
    const insights = generateInsights(risks);

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    Key Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border-l-2",
                                insight.type === "critical" && "bg-red-50 dark:bg-red-950/20 border-l-red-500",
                                insight.type === "warning" && "bg-amber-50 dark:bg-amber-950/20 border-l-amber-500",
                                insight.type === "success" && "bg-green-50 dark:bg-green-950/20 border-l-green-500",
                                insight.type === "info" && "bg-blue-50 dark:bg-blue-950/20 border-l-blue-500"
                            )}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                {insight.icon}
                            </div>
                            <p className="text-sm flex-1">
                                {insight.message}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function generateInsights(risks: RiskIssue[]) {
    const insights = [];

    // Critical risks insight
    const criticalRisks = risks.filter(r => {
        const score = (r.Probability || 0) * (r["Impact Rating (0.05-0.8)"] || 0);
        return score >= 0.15;
    });

    if (criticalRisks.length > 0) {
        insights.push({
            type: "critical" as const,
            icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
            message: `${criticalRisks.length} ${criticalRisks.length === 1 ? 'risk requires' : 'risks require'} immediate attention (critical severity).`,
        });
    }

    // Find project with highest EMV
    const projectEMV = risks.reduce((acc, risk) => {
        const project = risk.ProjectCode || "Unknown";
        const emv = (risk.Probability || 0) * (risk["Impact Value ($)"] || 0);
        acc[project] = (acc[project] || 0) + emv;
        return acc;
    }, {} as Record<string, number>);

    const topProject = Object.entries(projectEMV).sort((a, b) => b[1] - a[1])[0];
    if (topProject && topProject[1] > 0) {
        insights.push({
            type: "warning" as const,
            icon: <TrendingUp className="h-4 w-4 text-amber-600" />,
            message: `Project "${topProject[0]}" has highest EMV exposure: $${(topProject[1] / 1000000).toFixed(2)}M.`,
        });
    }

    // Mitigation completion rate
    const risksWithMitigation = risks.filter(r => r.MitigationPlan && r.MitigationPlan.trim() !== "").length;
    const completionRate = risks.length > 0 ? Math.round((risksWithMitigation / risks.length) * 100) : 0;

    if (completionRate < 70) {
        insights.push({
            type: "warning" as const,
            icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
            message: `Only ${completionRate}% of risks have mitigation plans defined.`,
        });
    } else {
        insights.push({
            type: "success" as const,
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            message: `Strong mitigation coverage: ${completionRate}% of risks have defined plans.`,
        });
    }

    // Trend insight (mock for now - would use historical data)
    const openRisksCount = risks.filter(r => {
        const status = String(r["Risk Status"] || r.Status || "");
        return status === "Open" || status === "In Progress";
    }).length;

    insights.push({
        type: "info" as const,
        icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
        message: `Currently tracking ${openRisksCount} active ${openRisksCount === 1 ? 'risk' : 'risks'} across all projects.`,
    });

    return insights.slice(0, 4); // Limit to top 4 insights
}
