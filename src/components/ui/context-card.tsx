import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type ContextCardProps = {
    trend: "up" | "down" | "stable";
    trendValue?: string;
    why: string;
    action: string;
    variant?: "info" | "warning" | "success";
};

export function ContextCard({ trend, trendValue, why, action, variant = "info" }: ContextCardProps) {
    const variantStyles = {
        info: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
        warning: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
        success: "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
    };

    return (
        <Card className={cn("border-l-4 p-3", variantStyles[variant])}>
            <div className="flex items-start gap-3 text-sm">
                <div className="flex items-center gap-2 flex-1">
                    {trend === "up" && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <TrendingUp className="h-4 w-4" />
                            {trendValue && <span className="font-medium">{trendValue}</span>}
                        </div>
                    )}
                    {trend === "down" && (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <TrendingDown className="h-4 w-4" />
                            {trendValue && <span className="font-medium">{trendValue}</span>}
                        </div>
                    )}
                    {trend === "stable" && (
                        <span className="text-muted-foreground font-medium">Stable</span>
                    )}
                </div>
            </div>
            <div className="mt-2 space-y-1.5">
                <div className="flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{why}</p>
                </div>
                <div className="flex items-start gap-2">
                    <Target className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs font-medium leading-relaxed">{action}</p>
                </div>
            </div>
        </Card>
    );
}
