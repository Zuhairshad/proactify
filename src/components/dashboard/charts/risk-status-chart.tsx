"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { RiskIssue } from "@/lib/types"

const chartConfig = {
  count: { label: "Count" },
  Open: { label: "Open", color: "hsl(var(--chart-1))" },
  Closed: { label: "Closed", color: "hsl(var(--chart-2))" },
  Mitigated: { label: "Mitigated", color: "hsl(var(--chart-3))" },
  Transferred: { label: "Transferred", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

type RiskStatusChartProps = {
  data: RiskIssue[];
}

export function RiskStatusChart({ data }: RiskStatusChartProps) {
  const chartData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {
      Open: 0,
      Closed: 0,
      Mitigated: 0,
      Transferred: 0,
    };

    // Mock previous period data (in production would come from historical data)
    const previousCounts: Record<string, number> = {
      Open: 2,
      Closed: 8,
      Mitigated: 4,
      Transferred: 1,
    };

    data.forEach(item => {
      if (item.type === 'Risk') {
        const status = item['Risk Status'] || 'Open';
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      }
    });

    return Object.keys(statusCounts).map(status => {
      const current = statusCounts[status];
      const previous = previousCounts[status] || 0;
      const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
      const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

      return {
        status,
        count: current,
        trend,
        change: Math.abs(Math.round(change)),
        fill: chartConfig[status as keyof typeof chartConfig]?.color || 'hsl(var(--muted))'
      };
    });
  }, [data]);

  const CustomLabel = (props: any) => {
    const { x, y, width, value, payload } = props;
    if (!payload) return null;

    const trend = payload.trend;
    const change = payload.change;

    if (!trend || trend === 'stable' || !change || change === 0) return null;

    return (
      <g>
        <text x={x + width / 2} y={y - 10} fill="currentColor" textAnchor="middle" className="text-xs">
          {trend === 'up' ? (
            <tspan className="fill-green-600">↑{change}%</tspan>
          ) : (
            <tspan className="fill-red-600">↓{change}%</tspan>
          )}
        </text>
      </g>
    );
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 25, right: 5, bottom: 5, left: -20 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="status"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Bar dataKey="count" radius={4}>
            <LabelList content={<CustomLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
