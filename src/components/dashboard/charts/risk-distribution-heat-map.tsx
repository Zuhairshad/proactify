
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { RiskIssue } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { HeatMapFilter } from "../dashboard-client";

const probabilityLevels = [
    { label: "Very High", value: 0.9, range: [0.8, 1.0] },
    { label: "High", value: 0.7, range: [0.6, 0.8] },
    { label: "Medium", value: 0.5, range: [0.4, 0.6] },
    { label: "Low", value: 0.3, range: [0.2, 0.4] },
    { label: "Very Low", value: 0.1, range: [0, 0.2] },
];

const impactLevels = [
    { label: "Very Low", value: 0.05, range: [0, 0.05] },
    { label: "Low", value: 0.1, range: [0.05, 0.1] },
    { label: "Medium", value: 0.2, range: [0.1, 0.2] },
    { label: "High", value: 0.4, range: [0.2, 0.4] },
    { label: "Very High", value: 0.8, range: [0.4, 1.0] },
];

const getRiskColor = (score: number, count: number): string => {
    if (count === 0) return "bg-muted/30";
    if (score >= 0.18) return `bg-red-500`;
    if (score >= 0.06) return `bg-yellow-400`;
    return `bg-green-500`;
};

const getTextColor = (score: number, count: number): string => {
    if (count === 0) return "text-muted-foreground";
    if (score >= 0.18) return "text-white";
    return "text-gray-800";
}

interface RiskDistributionHeatMapProps {
    data: RiskIssue[];
    onCellClick: (filter: HeatMapFilter) => void;
    activeFilter: HeatMapFilter;
}


export function RiskDistributionHeatMap({ data, onCellClick, activeFilter }: RiskDistributionHeatMapProps) {
    const heatMapData = React.useMemo(() => {
        const grid: number[][] = Array(5)
            .fill(0)
            .map(() => Array(5).fill(0));

        data.forEach((risk) => {
            const probability = risk.Probability || 0;
            const impact = risk["Impact Rating (0.05-0.8)"] || 0;

            // Find the correct cell indexes
            let probIndex = probabilityLevels.findIndex(
                (level) => probability >= level.range[0] && probability < level.range[1]
            );
            let impIndex = impactLevels.findIndex(
                (level) => impact >= level.range[0] && impact < level.range[1]
            );

            if (probIndex === -1) probIndex = probability >= 0.8 ? 0 : 4;
            if (impIndex === -1) impIndex = impact >= 0.4 ? 4 : 0;

            grid[probIndex][impIndex]++;
        });

        return grid;
    }, [data]);

    const isActive = (probIndex: number, impIndex: number): boolean => {
        if (!activeFilter || activeFilter.type !== "heatmap") return false;
        return (
            activeFilter.probIndex === probIndex && activeFilter.impIndex === impIndex
        );
    };

    return (
        <TooltipProvider>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="flex flex-col justify-between py-2">
                        <div className="text-sm font-medium text-center -rotate-90 whitespace-nowrap origin-center w-8">
                            Probability
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-5 gap-1 mb-2">
                            {impactLevels.map((impact, idx) => (
                                <div
                                    key={impact.label}
                                    className="text-xs text-center font-medium text-muted-foreground"
                                >
                                    {impact.label}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-1">
                            {probabilityLevels.map((probability, probIndex) => (
                                <div key={probability.label} className="flex gap-1">
                                    {impactLevels.map((impact, impIndex) => {
                                        const count = heatMapData[probIndex][impIndex];
                                        const score = probability.value * impact.value;
                                        const active = isActive(probIndex, impIndex);

                                        return (
                                            <Tooltip key={impIndex}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() =>
                                                            onCellClick({
                                                                type: "heatmap",
                                                                probIndex,
                                                                impIndex,
                                                                label: `${probability.label} Probability / ${impact.label} Impact`,
                                                            })
                                                        }
                                                        className={cn(
                                                            "flex-1 aspect-square rounded flex items-center justify-center text-sm font-semibold transition-all duration-200",
                                                            getRiskColor(score, count),
                                                            getTextColor(score, count),
                                                            active && "ring-2 ring-primary ring-offset-2",
                                                            count > 0 && "hover:scale-110 hover:shadow-lg cursor-pointer",
                                                            count === 0 && "cursor-default"
                                                        )}
                                                    >
                                                        {count > 0 ? count : ""}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-xs">
                                                        <p className="font-semibold">
                                                            {probability.label} Probability
                                                        </p>
                                                        <p className="font-semibold">{impact.label} Impact</p>
                                                        <p className="mt-1">Risk Count: {count}</p>
                                                        <p>Risk Score: {(score * 100).toFixed(1)}%</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                    <div className="w-20 flex items-center pl-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {probability.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-500"></div>
                                <span>Low Risk</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-yellow-400"></div>
                                <span>Medium Risk</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-red-500"></div>
                                <span>High Risk</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quadrant Zone Labels */}
                <div className="relative mt-2 h-6 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold w-full max-w-md">
                        <div className="text-center text-red-600 dark:text-red-400">🔴 URGENT ACTION</div>
                        <div className="text-center text-amber-600 dark:text-amber-400">⚠️ PRIORITY</div>
                    </div>
                </div>
                <div className="relative h-6 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold w-full max-w-md">
                        <div className="text-center text-yellow-600 dark:text-yellow-400">📋 MONITOR</div>
                        <div className="text-center text-green-600 dark:text-green-400">✅ ACCEPTABLE</div>
                    </div>
                </div>

                <div className="text-center font-medium text-muted-foreground text-xs pt-1">
                    Impact / Severity
                </div>
            </div>
        </TooltipProvider>
    );
}
