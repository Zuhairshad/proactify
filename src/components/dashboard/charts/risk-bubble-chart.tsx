"use client";

import { Scatter, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine, ReferenceArea, Label } from "recharts";
import type { RiskIssue } from "@/lib/types";
import { SEVERITY_COLORS, getRiskSeverity } from "@/lib/design-tokens";

type RiskBubbleChartProps = {
    data: RiskIssue[];
};

export function RiskBubbleChart({ data }: RiskBubbleChartProps) {
    // Prepare data for bubble chart
    const bubbleData = data
        .filter(risk => {
            const prob = risk.Probability;
            const impact = risk["Impact Rating (0.05-0.8)"];
            return prob != null && impact != null && prob > 0 && impact > 0;
        })
        .map((risk, index) => {
            const probability = risk.Probability || 0;
            const impactRating = risk["Impact Rating (0.05-0.8)"] || 0;
            const impactValue = risk["Impact Value ($)"] || 0;
            const status = risk["Risk Status"] || risk.Status || "Open";

            const riskScore = probability * impactRating;
            const severity = getRiskSeverity(riskScore);

            return {
                x: probability,
                y: impactRating,
                z: Math.max(impactValue / 100000, 20), // Bubble size based on impact value
                name: risk.Title || `Risk ${index + 1}`,
                project: risk.ProjectCode || risk["Project Code"] || "Unknown",
                status,
                score: riskScore,
                color: SEVERITY_COLORS[severity].hex,
            };
        });

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm mb-1">{data.name}</p>
                    <p className="text-xs text-muted-foreground mb-1">Project: {data.project}</p>
                    <p className="text-xs">Probability: {(data.x * 100).toFixed(0)}%</p>
                    <p className="text-xs">Impact: {data.y.toFixed(2)}</p>
                    <p className="text-xs">Score: {data.score.toFixed(3)}</p>
                    <p className="text-xs mt-1">
                        <span
                            className="inline-block w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: data.color }}
                        />
                        {data.score >= 0.15 ? "Critical" : data.score >= 0.08 ? "High" : data.score >= 0.03 ? "Medium" : "Low"}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

                {/* Quadrant zones */}
                <ReferenceArea x1={0} x2={0.5} y1={0.4} y2={1} fill={SEVERITY_COLORS.medium.hex} fillOpacity={0.05} />
                <ReferenceArea x1={0.5} x2={1} y1={0.4} y2={1} fill={SEVERITY_COLORS.critical.hex} fillOpacity={0.1} />
                <ReferenceArea x1={0} x2={0.5} y1={0} y2={0.4} fill={SEVERITY_COLORS.low.hex} fillOpacity={0.05} />
                <ReferenceArea x1={0.5} x2={1} y1={0} y2={0.4} fill={SEVERITY_COLORS.high.hex} fillOpacity={0.05} />

                {/* Risk appetite threshold line */}
                <ReferenceLine
                    segment={[{ x: 0, y: 0.15 }, { x: 1, y: 0.15 }]}
                    stroke={SEVERITY_COLORS.critical.hex}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                >
                    <Label value="Risk Appetite Threshold" position="insideTopRight" className="text-xs" fill={SEVERITY_COLORS.critical.hex} />
                </ReferenceLine>

                <XAxis
                    type="number"
                    dataKey="x"
                    name="Probability"
                    domain={[0, 1]}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Probability', position: 'insideBottom', offset: -15, fill: 'hsl(var(--muted-foreground))' }}
                    className="text-xs"
                />
                <YAxis
                    type="number"
                    dataKey="y"
                    name="Impact Rating"
                    domain={[0, 1]}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Impact Rating', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                    className="text-xs"
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Impact Value" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={bubbleData}>
                    {bubbleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );
}
