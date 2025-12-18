"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { RiskIssue } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/design-tokens";

type RiskResponsesChartProps = {
    data: RiskIssue[];
};

const RESPONSE_COLORS = {
    'Avoidance': SEVERITY_COLORS.critical.hex,
    'Transfer': SEVERITY_COLORS.high.hex,
    'Mitigation': SEVERITY_COLORS.medium.hex,
    'Acceptance': SEVERITY_COLORS.low.hex,
    'Other': SEVERITY_COLORS.info.hex,
    'No Strategy': '#9CA3AF', // Gray
};

export function RiskResponsesChart({ data }: RiskResponsesChartProps) {
    // Categorize mitigation strategies
    const categorizeMitigation = (plan: string | null | undefined): string => {
        if (!plan || plan.trim() === "") return "No Strategy";

        const planLower = plan.toLowerCase();

        if (planLower.includes("avoid") || planLower.includes("eliminate")) return "Avoidance";
        if (planLower.includes("transfer") || planLower.includes("outsourc")) return "Transfer";
        if (planLower.includes("mitigat") || planLower.includes("reduc")) return "Mitigation";
        if (planLower.includes("accept") || planLower.includes("monitor")) return "Acceptance";

        return "Other";
    };

    // Count by mitigation strategy
    const strategyCounts = data.reduce((acc, risk) => {
        const strategy = categorizeMitigation(risk.MitigationPlan);
        acc[strategy] = (acc[strategy] || 0) + 1;
        return {};
    }, {} as Record<string, number>);

    const chartData = Object.entries(strategyCounts)
        .map(([name, value]) => ({
            name,
            value,
            color: RESPONSE_COLORS[name as keyof typeof RESPONSE_COLORS] || RESPONSE_COLORS.Other,
        }))
        .sort((a, b) => b.value - a.value);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / data.payload.value) * 100).toFixed(1);
            return (
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {data.value} risks ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => (
                        <span className="text-xs">{value} ({entry.value})</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
