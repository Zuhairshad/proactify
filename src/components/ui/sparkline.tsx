import { Line, LineChart, ResponsiveContainer } from "recharts";

type SparklineProps = {
    data: number[];
    color?: string;
    showDot?: boolean;
};

export function Sparkline({ data, color = "#3B82F6", showDot = false }: SparklineProps) {
    const chartData = data.map((value, index) => ({ value, index }));

    return (
        <ResponsiveContainer width="100%" height={32}>
            <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={showDot}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
