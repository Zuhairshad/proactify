import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KPIStatusBadgeProps = {
    value: number;
    threshold: {
        good: number;
        warning: number;
    };
    higherIsBetter?: boolean;
};

export function KPIStatusBadge({ value, threshold, higherIsBetter = true }: KPIStatusBadgeProps) {
    const getStatus = () => {
        if (higherIsBetter) {
            if (value >= threshold.good) return { color: "bg-green-500", label: "On Target", icon: "🟢" };
            if (value >= threshold.warning) return { color: "bg-amber-500", label: "Warning", icon: "🟡" };
            return { color: "bg-red-500", label: "Critical", icon: "🔴" };
        } else {
            if (value <= threshold.good) return { color: "bg-green-500", label: "On Target", icon: "🟢" };
            if (value <= threshold.warning) return { color: "bg-amber-500", label: "Warning", icon: "🟡" };
            return { color: "bg-red-500", label: "Critical", icon: "🔴" };
        }
    };

    const status = getStatus();

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-sm">{status.icon}</span>
            <div className={cn("h-2 w-2 rounded-full", status.color)} />
            <span className="text-xs text-muted-foreground">{status.label}</span>
        </div>
    );
}
