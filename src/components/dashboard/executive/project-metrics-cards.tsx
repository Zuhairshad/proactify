import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskIssue, Product } from "@/lib/types";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { Sparkline } from "@/components/ui/sparkline";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { METRIC_CATEGORIES, SEVERITY_COLORS } from "@/lib/design-tokens";
import { TrendingUp, TrendingDown } from "lucide-react";

type ProjectMetricsCardsProps = {
    products: Product[];
    risks: RiskIssue[];
};

export function ProjectMetricsCards({ products, risks }: ProjectMetricsCardsProps) {
    // Calculate metrics
    const projectCount = products.length;
    const totalPOValue = products.reduce((sum, p) => sum + (p.value || 0), 0);
    const totalBudgetContingency = risks.reduce((sum, r) => sum + (r["Budget Contingency"] || 0), 0);
    const projectedVA = totalBudgetContingency * 1.1; // 10% above contingency as projection

    const totalRisks = risks.length;
    const totalEMV = risks.reduce((sum, r) => {
        const prob = r.Probability || 0;
        const impact = r["Impact Value ($)"] || 0;
        return sum + (prob * impact);
    }, 0);

    const totalContingency = totalBudgetContingency;
    const deficitSurplus = totalContingency - totalEMV;

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value.toFixed(0)}`;
    };

    // Mock trend data for sparklines (in production, this would come from historical data)
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
            title: "Projects",
            value: projectCount,
            numericValue: projectCount,
            category: METRIC_CATEGORIES.neutral,
            trend: { value: 0, direction: 'stable' as const },
            sparklineData: generateTrendData(projectCount, 'stable'),
            isNumeric: true,
        },
        {
            title: "PO Value",
            value: formatCurrency(totalPOValue),
            numericValue: totalPOValue,
            category: METRIC_CATEGORIES.financial,
            trend: { value: 8, direction: 'up' as const },
            sparklineData: generateTrendData(totalPOValue, 'up'),
            isNumeric: false,
        },
        {
            title: "BID VA",
            value: formatCurrency(totalBudgetContingency),
            numericValue: totalBudgetContingency,
            category: METRIC_CATEGORIES.financial,
            trend: { value: 5, direction: 'up' as const },
            sparklineData: generateTrendData(totalBudgetContingency, 'up'),
            isNumeric: false,
        },
        {
            title: "Projected VA",
            value: formatCurrency(projectedVA),
            numericValue: projectedVA,
            category: METRIC_CATEGORIES.performance,
            trend: { value: 10, direction: 'up' as const },
            sparklineData: generateTrendData(projectedVA, 'up'),
            isNumeric: false,
        },
        {
            title: "Total No of Risk",
            value: totalRisks,
            numericValue: totalRisks,
            category: METRIC_CATEGORIES.risk,
            trend: { value: 12, direction: 'up' as const },
            sparklineData: generateTrendData(totalRisks, 'up'),
            isNumeric: true,
        },
        {
            title: "Total EMV",
            value: formatCurrency(totalEMV),
            numericValue: totalEMV,
            category: METRIC_CATEGORIES.warning,
            trend: { value: 15, direction: 'up' as const },
            sparklineData: generateTrendData(totalEMV, 'up'),
            isNumeric: false,
        },
        {
            title: "Total Contingency",
            value: formatCurrency(totalContingency),
            numericValue: totalContingency,
            category: METRIC_CATEGORIES.performance,
            trend: { value: 3, direction: 'up' as const },
            sparklineData: generateTrendData(totalContingency, 'up'),
            isNumeric: false,
        },
        {
            title: "Deficit/Surplus",
            value: formatCurrency(Math.abs(deficitSurplus)),
            numericValue: Math.abs(deficitSurplus),
            subtitle: deficitSurplus >= 0 ? "Surplus" : "Deficit",
            category: deficitSurplus >= 0 ? METRIC_CATEGORIES.performance : METRIC_CATEGORIES.warning,
            trend: { value: Math.abs(Math.round((deficitSurplus / totalContingency) * 100)), direction: deficitSurplus >= 0 ? 'up' as const : 'down' as const },
            sparklineData: generateTrendData(Math.abs(deficitSurplus), deficitSurplus >= 0 ? 'up' : 'down'),
            isNumeric: false,
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
                        metric.category.border
                    )}
                >
                    <AnimatedGradient variant={metric.category.gradient} />
                    <CardHeader className="pb-2 space-y-0 relative z-10">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
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
                                        ? "text-green-600 dark:text-green-400"
                                        : metric.trend.direction === 'down'
                                            ? "text-red-600 dark:text-red-400"
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
                        {metric.subtitle && (
                            <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                        )}
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
