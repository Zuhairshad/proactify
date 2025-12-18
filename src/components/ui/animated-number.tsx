import { useEffect, useRef } from 'react';

// Custom hook for animated number counting
export function useCountUp(end: number, duration: number = 1000, start: number = 0) {
    const elementRef = useRef<HTMLSpanElement>(null);
    const frameRef = useRef<number>();

    useEffect(() => {
        if (!elementRef.current) return;

        const element = elementRef.current;
        const startTime = Date.now();
        const updateNumber = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;

            element.textContent = Math.round(current).toString();

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(updateNumber);
            }
        };

        frameRef.current = requestAnimationFrame(updateNumber);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [end, duration, start]);

    return elementRef;
}

// Animated number component
type AnimatedNumberProps = {
    value: number;
    duration?: number;
    className?: string;
};

export function AnimatedNumber({ value, duration = 1000, className }: AnimatedNumberProps) {
    const ref = useCountUp(value, duration);
    return <span ref={ref} className={className}>0</span>;
}
