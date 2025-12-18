import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
    variant?: "blue" | "orange" | "red" | "green" | "purple" | "default";
    className?: string;
}

export function AnimatedGradient({ variant = "default", className }: AnimatedGradientProps) {
    const gradients = {
        blue: "from-blue-400/20 via-cyan-400/20 to-blue-600/20",
        orange: "from-orange-400/20 via-amber-400/20 to-orange-600/20",
        red: "from-red-400/20 via-pink-400/20 to-red-600/20",
        green: "from-green-400/20 via-emerald-400/20 to-green-600/20",
        purple: "from-purple-400/20 via-violet-400/20 to-purple-600/20",
        default: "from-primary/10 via-primary/5 to-primary/10",
    };

    return (
        <div
            className={cn(
                "absolute inset-0 -z-10 opacity-50",
                "bg-gradient-to-br",
                gradients[variant],
                "animate-gradient-shift",
                className
            )}
            style={{
                backgroundSize: "200% 200%",
            }}
        />
    );
}
