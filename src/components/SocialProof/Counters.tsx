import React, { useEffect, useState } from 'react';

// Add interfaces
interface AnimatedCounterProps {
    value: number;
    duration?: number;
    formatter?: (val: number) => string | number;
}

interface LiveCounterProps {
    min: number;
    max: number;
    updateInterval?: number;
    formatter?: (val: number) => string | number;
}

// Utility function remains the same
export const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Add types to AnimatedCounter
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
    value, 
    duration = 2000, 
    formatter = (val: number) => val 
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;
        const startValue = displayValue;

        const updateValue = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
            const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart);
            
            setDisplayValue(currentValue);
            if (percentage < 1) {
                animationFrame = requestAnimationFrame(updateValue);
            }
        };

        animationFrame = requestAnimationFrame(updateValue);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration, displayValue]);

    return <>{formatter(displayValue)}</>;
};

// Add types to LiveCounter
export const LiveCounter: React.FC<LiveCounterProps> = ({ 
    min, 
    max, 
    updateInterval = 3000, 
    formatter = (val: number) => val 
}) => {
    const [value, setValue] = useState(min);
    const [previousValue, setPreviousValue] = useState(min);

    useEffect(() => {
        const interval = setInterval(() => {
            setPreviousValue(value);
            const change = Math.floor((Math.random() - 0.3) * (max - min) * 0.1);
            const newValue = Math.max(min, Math.min(max, value + change));
            setValue(newValue);
        }, updateInterval);

        return () => clearInterval(interval);
    }, [min, max, updateInterval, value]);

    return <AnimatedCounter 
        value={value} 
        duration={updateInterval * 0.8} 
        formatter={formatter}
    />;
};