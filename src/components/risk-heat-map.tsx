
"use client";

import { cn } from "@/lib/utils";

interface RiskHeatMapProps {
  probability: number;
  impact: number;
}

const probabilityLevels = [
  { label: "Very High", shortLabel: "…", value: 0.9 },
  { label: "High", shortLabel: "…", value: 0.7 },
  { label: "Medium", shortLabel: "…", value: 0.5 },
  { label: "Low", shortLabel: "…", value: 0.3 },
  { label: "Very Low", shortLabel: "…", value: 0.1 },
];

const impactLevels = [
  { label: "Very Low", value: 0.05 },
  { label: "Low", value: 0.1 },
  { label: "Medium", value: 0.2 },
  { label: "High", value: 0.4 },
  { label: "Very High", value: 0.8 },
];

const getRiskColor = (score: number, isSelected: boolean): string => {
  if (isSelected) {
    // Selected cell - darker/more vibrant
    if (score >= 0.36) return "bg-red-500 shadow-lg ring-2 ring-red-600"; // High/Critical
    if (score >= 0.14) return "bg-red-400 shadow-lg ring-2 ring-red-500";
    if (score >= 0.07) return "bg-yellow-400 shadow-lg ring-2 ring-yellow-500"; // Medium
    if (score >= 0.03) return "bg-yellow-300 shadow-lg ring-2 ring-yellow-400";
    return "bg-green-500 shadow-lg ring-2 ring-green-600"; // Low
  } else {
    // Non-selected - lighter
    if (score >= 0.36) return "bg-red-400"; // High/Critical
    if (score >= 0.14) return "bg-red-300";
    if (score >= 0.07) return "bg-yellow-300"; // Medium
    if (score >= 0.03) return "bg-yellow-200";
    return "bg-green-400"; // Low
  }
};

export function RiskHeatMap({ probability, impact }: RiskHeatMapProps) {
  return (
    <div className="space-y-3">

      <div className="flex gap-3">
        {/* Probability axis label (vertical) */}
        <div className="flex items-center justify-center">
          <div className="text-sm font-medium text-muted-foreground -rotate-90 whitespace-nowrap w-4">
            Probability
          </div>
        </div>

        {/* Main grid container */}
        <div className="flex-1 space-y-2">
          {/* Impact column headers */}
          <div className="grid grid-cols-5 gap-1 text-xs font-medium text-muted-foreground mb-1">
            {impactLevels.map((level) => (
              <div key={level.value} className="text-center">
                {level.label} ({level.value})
              </div>
            ))}
          </div>

          {/* Heatmap grid with row labels */}
          <div className="space-y-1">
            {probabilityLevels.map((prob, probIndex) => (
              <div key={prob.value} className="flex gap-1 items-center">
                {/* Row cells */}
                <div className="grid grid-cols-5 gap-1 flex-1">
                  {impactLevels.map((imp, impIndex) => {
                    const score = prob.value * imp.value;
                    const isSelected = prob.value === probability && imp.value === impact;

                    return (
                      <div
                        key={`${prob.value}-${imp.value}`}
                        title={`Probability: ${prob.label} (${prob.value}), Impact: ${imp.label} (${imp.value}), Score: ${score.toFixed(3)}`}
                        className={cn(
                          "h-12 w-full rounded-md transition-all duration-300",
                          getRiskColor(score, isSelected),
                          !isSelected && "hover:opacity-80 cursor-default"
                        )}
                      />
                    );
                  })}
                </div>
                {/* Row label */}
                <div className="text-xs font-medium text-muted-foreground w-24 pl-2">
                  {prob.label} ({prob.value})
                </div>
              </div>
            ))}
          </div>

          {/* Impact axis label (horizontal) */}
          <div className="text-center text-sm font-medium text-muted-foreground pt-1">
            Impact / Severity
          </div>
        </div>
      </div>
    </div>
  );
}
