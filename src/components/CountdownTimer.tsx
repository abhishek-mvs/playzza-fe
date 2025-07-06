'use client'
import { useState } from "react";


import { formatTimeRemaining } from "@/utils/formatters";
import { useEffect } from "react";

interface CountdownTimerProps {
  expiryTimestamp: bigint;
  size?: 'sm' | 'md' | 'lg';
  showResults?: boolean;
}

export default function CountdownTimer({ expiryTimestamp, size = 'md', showResults = false }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(expiryTimestamp));
    const [isExpired, setIsExpired] = useState(false);
  
    useEffect(() => {
      const timer = setInterval(() => {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const remaining = Number(expiryTimestamp - now);
        if (showResults && remaining <= 0) {

          setTimeRemaining('Out Soon');
          setIsExpired(true);
          clearInterval(timer);
        } else {
          setTimeRemaining(formatTimeRemaining(expiryTimestamp));
        }
      }, 1000);
  
      return () => clearInterval(timer);
    }, [expiryTimestamp]);

    const sizeClasses = {
      sm: 'text-sm px-2 py-1',
      md: 'text-base px-3 py-2', 
      lg: 'text-lg px-4 py-3'
    };

    if (showResults) {
      return (
        <div className={`font-medium rounded-full ${sizeClasses[size]} bg-purple-500 bg-opacity-20 text-purple-300`}>
          🏆 {timeRemaining}
        </div>
      );
    } else {
      return (
        <div className={`font-medium rounded-full ${sizeClasses[size]} ${
          isExpired 
            ? 'bg-red-500 bg-opacity-20 text-red-400' 
            : timeRemaining.includes('h') 
              ? 'bg-green-500 bg-opacity-20 text-white'
              : timeRemaining.includes('m') && parseInt(timeRemaining.split('m')[0]) > 5
                ? 'bg-yellow-500 bg-opacity-20 text-white'
                : 'bg-red-500 bg-opacity-20 text-white'
        }`}>
          ⏰ {timeRemaining}
        </div>
      );
    }
  };