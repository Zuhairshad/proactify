
"use client";

import type { RiskIssue, Product } from "@/lib/types";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopRisksList } from "./top-risks-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskDistributionHeatMap } from "@/components/dashboard/charts/risk-distribution-heat-map";
import { RiskScoreBreakdownChart } from "@/components/dashboard/charts/risk-score-breakdown-chart";
import * as React from "react";
import { RiskStatusChart } from "../charts/risk-status-chart";
import { OverdueRiskChart } from "../charts/overdue-risk-chart";
import { RiskResponsesChart } from "../charts/risk-responses-chart";
import { RiskBubbleChart } from "../charts/risk-bubble-chart";
import { ProjectMetricsCards } from "./project-metrics-cards";
import { SmartInsightsPanel } from "./smart-insights-panel";
import { IssueMetricsCards } from "./issue-metrics-cards";
import { IssueInsightsPanel } from "./issue-insights-panel";
import { ContextCard } from "@/components/ui/context-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";

type ExecutiveDashboardClientProps = {
    top10Risks: (RiskIssue & { riskScore: number; ProjectName: string })[];
    allOpenRisks: RiskIssue[];
    allRisks: RiskIssue[];
    allIssues: RiskIssue[];
    allData: RiskIssue[];
    products: Product[];
};

export function ExecutiveDashboardClient({
    top10Risks,
    allOpenRisks,
    allRisks,
    allIssues,
    allData,
    products
}: ExecutiveDashboardClientProps) {
    const [activeTab, setActiveTab] = React.useState<'risk' | 'issue'>('risk');

    // Calculate metrics for dynamic titles
    const openRisksCount = allRisks.filter(r => r['Risk Status'] === 'Open').length;
    const criticalRisksCount = allRisks.filter(r => {
        const score = (r.Probability || 0) * (r['Impact Rating (0.05-0.8)'] || 0);
        return score >= 0.15;
    }).length;

    // Issue metrics
    const openIssuesCount = allIssues.filter(i => i.Status === 'Open' || i.Status === 'Escalated').length;
    const criticalIssuesCount = allIssues.filter(i => i.Priority === 'Critical' || i.Priority === '(1) High').length;

    const overdueRisksCount = allRisks.filter(r => {
        if (!r.DueDate) return false;
        const dueDate = new Date(r.DueDate);
        const now = new Date();
        const status = r["Risk Status"] || r.Status;
        return dueDate < now && status !== "Closed" && status !== "Resolved";
    }).length;

    return (
        <div className="space-y-6">
            <Tabs defaultValue="risk" value={activeTab} onValueChange={(value) => setActiveTab(value as 'risk' | 'issue')}>
                <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
                    <TabsTrigger value="risk">
                        <Shield className="mr-2 h-4 w-4" />
                        Risks
                    </TabsTrigger>
                    <TabsTrigger value="issue">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Issues
                    </TabsTrigger>
                </TabsList>

                {/* RISK VIEW */}
                <TabsContent value="risk" className="space-y-6 mt-6">
                    <ProjectMetricsCards products={products} risks={allRisks} />

                    <SmartInsightsPanel risks={allRisks} />

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <ContextCard
                                        trend={openRisksCount > 2 ? "up" : "stable"}
                                        trendValue={openRisksCount > 2 ? "+12% vs last month" : ""}
                                        why="Open risk count indicates active project challenges requiring management attention."
                                        action="Review and prioritize mitigation plans for open risks."
                                        variant={openRisksCount > 3 ? "warning" : "info"}
                                    />
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Risk Status: {openRisksCount} Open</CardTitle>
                                            <CardDescription>Active risks requiring attention and monitoring.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RiskStatusChart data={allRisks} />
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="space-y-3">
                                    <ContextCard
                                        trend={criticalRisksCount > 0 ? "up" : "down"}
                                        trendValue={criticalRisksCount > 0 ? "Critical risks detected" : "No critical risks"}
                                        why="High-severity risks (score ≥ 0.15) demand immediate executive intervention."
                                        action={criticalRisksCount > 0 ? "Escalate critical risks to leadership today." : "Maintain current risk management practices."}
                                        variant={criticalRisksCount > 0 ? "warning" : "success"}
                                    />
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Risk Rating: {criticalRisksCount} Critical</CardTitle>
                                            <CardDescription>Risk severity distribution by probability × impact score.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RiskScoreBreakdownChart
                                                data={allRisks}
                                                onBarClick={() => { }}
                                                activeFilter={null}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Risk Responses Count</CardTitle>
                                        <CardDescription>Distribution by mitigation strategy type.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RiskResponsesChart data={allRisks} />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Overdue Risks: {overdueRisksCount} Past Due</CardTitle>
                                        <CardDescription>Risks requiring immediate attention - past mitigation deadline.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <OverdueRiskChart data={allRisks} />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Risk Distribution Heat Map</CardTitle>
                                        <CardDescription>Overall risk concentration by impact and probability.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <RiskDistributionHeatMap
                                            data={allRisks}
                                            onCellClick={() => { }}
                                            activeFilter={null}
                                        />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bubble Chart</CardTitle>
                                        <CardDescription>Risk visualization by probability and impact rating.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RiskBubbleChart data={allRisks} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <TopRisksList risks={top10Risks} />
                        </div>
                    </div>
                </TabsContent>

                {/* ISSUE VIEW */}
                <TabsContent value="issue" className="space-y-6 mt-6">
                    <IssueMetricsCards issues={allIssues} />

                    <IssueInsightsPanel issues={allIssues} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <ContextCard
                                trend={openIssuesCount > 5 ? "up" : "stable"}
                                trendValue={openIssuesCount > 5 ? "+15% vs last month" : ""}
                                why="Open issue count indicates current operational challenges requiring resolution."
                                action="Prioritize critical and high-priority issues for immediate action."
                                variant={openIssuesCount > 5 ? "warning" : "info"}
                            />
                            <Card>
                                <CardHeader>
                                    <CardTitle>Issue Status: {openIssuesCount} Open</CardTitle>
                                    <CardDescription>Distribution of issues by current status.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RiskStatusChart data={allIssues} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-3">
                            <ContextCard
                                trend="stable"
                                trendValue=""
                                why="Priority distribution helps identify workload and resource allocation needs."
                                action="Ensure critical issues have assigned owners and action plans."
                                variant="info"
                            />
                            <Card>
                                <CardHeader>
                                    <CardTitle>Issue Priority: {criticalIssuesCount} Critical</CardTitle>
                                    <CardDescription>Distribution of issues by priority level.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RiskScoreBreakdownChart
                                        data={allIssues}
                                        onBarClick={() => { }}
                                        activeFilter={null}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
