import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, CircleDot, TrendingUp, LucideIcon } from "lucide-react";
import type { RiskIssue } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { SEVERITY_COLORS, METRIC_CATEGORIES } from "@/lib/design-tokens";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  gradient?: string;
  iconColor?: string;
  gradientVariant?: "blue" | "orange" | "red" | "green";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, description, gradient, iconColor, gradientVariant, trend }: StatCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      "border-l-4",
      gradient
    )}>
      {gradientVariant && <AnimatedGradient variant={gradientVariant} />}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Icon className="w-full h-full" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg bg-opacity-10", iconColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              <TrendingUp className={cn("h-4 w-4", !trend.isPositive && "rotate-180")} />
              {trend.value}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}


type StatsCardsProps = {
  data: RiskIssue[];
  activeView: 'risk' | 'issue';
};

export function StatsCards({ data, activeView }: StatsCardsProps) {
  // Filter data based on active view
  const filteredData = data.filter(item => item.type === (activeView === 'risk' ? 'Risk' : 'Issue'));

  const totalItems = filteredData.length;

  const openItems = filteredData.filter((item) => {
    const status = item["Risk Status"] || item.Status;
    if (!status) return false;
    const statusStr = String(status);
    return statusStr === "Open" || statusStr === "In Progress" || statusStr === "Under Review";
  }).length;

  const highPriorityItems = filteredData.filter((item) => {
    const priority = item.Priority;
    return priority === "High" || priority === "Critical" || priority === "(1) High";
  }).length;

  const resolvedItems = filteredData.filter((item) => {
    const status = item["Risk Status"] || item.Status;
    return status === "Resolved" || status === "Closed" || status === "Mitigated";
  }).length;

  // Calculate percentages for context
  const openPercentage = totalItems > 0 ? Math.round((openItems / totalItems) * 100) : 0;
  const resolvedPercentage = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;
  const highPriorityPercentage = totalItems > 0 ? Math.round((highPriorityItems / totalItems) * 100) : 0;

  // Get view label for descriptions
  const viewLabel = activeView === 'risk' ? 'risks' : 'issues';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Entries"
        value={totalItems}
        icon={CircleDot}
        description={`All ${viewLabel}`}
        gradient={METRIC_CATEGORIES.neutral.border}
        iconColor={METRIC_CATEGORIES.neutral.text + " " + METRIC_CATEGORIES.neutral.iconBg}
        gradientVariant="purple"
      />
      <StatCard
        title="Open Items"
        value={openItems}
        icon={Shield}
        description={`${openPercentage}% of total ${viewLabel}`}
        gradient={METRIC_CATEGORIES.risk.border}
        iconColor={METRIC_CATEGORIES.risk.text + " " + METRIC_CATEGORIES.risk.iconBg}
        gradientVariant="orange"
      />
      <StatCard
        title="High Priority"
        value={highPriorityItems}
        icon={AlertTriangle}
        description={`${highPriorityPercentage}% need attention`}
        gradient={SEVERITY_COLORS.critical.border}
        iconColor={SEVERITY_COLORS.critical.text + " " + SEVERITY_COLORS.critical.iconBg}
        gradientVariant="red"
      />
      <StatCard
        title="Resolved"
        value={resolvedItems}
        icon={CheckCircle2}
        description={`${resolvedPercentage}% completion rate`}
        gradient={SEVERITY_COLORS.low.border}
        iconColor={SEVERITY_COLORS.low.text + " " + SEVERITY_COLORS.low.iconBg}
        gradientVariant="green"
      />
    </div>
  );
}
