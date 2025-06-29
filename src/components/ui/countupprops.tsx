import { useState, useEffect, useRef } from "react";

interface CountUpProps {
    start: number;
    end: number;
    duration?: number;
}

const CountUp = ({ start = 0, end, duration = 2000 }: CountUpProps) => {
    const [count, setCount] = useState(start);
    const countRef = useRef(count);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        countRef.current = count;
        setCount(start);
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // Make effect more natural with easing
            const easedProgress = easeInOutQuad(progress);
            // Calculate the current count based on eased progress
            const currentCount = Math.floor(start + (end - start) * easedProgress);

            countRef.current = currentCount;
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        // Begin the animation
        requestAnimationFrame(animate);

        return () => {
            // Cleanup function to cancel the animation if component unmounts
            startTimeRef.current = null;
        }
    }, [start, end, duration]);
    
    // Easing function for a smooth transition
    const easeInOutQuad = (t: number) => {
        return 1 - (1- t) * (1 - t);
    }
    return <>{count}</>
};

export default CountUp; 