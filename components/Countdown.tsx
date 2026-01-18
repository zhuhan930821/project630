'use client';

import { useState, useEffect } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const TARGET_DATE = new Date('2026-06-30T00:00:00').getTime();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        clearInterval(interval);
        // 这里可以处理时间到的逻辑
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
          milliseconds: Math.floor((distance % 1000) / 10), // 只显示两位毫秒
        });
      }
    }, 10); // 10毫秒刷新一次

    return () => clearInterval(interval);
  }, [TARGET_DATE]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-900 rounded-xl border border-red-900/30 shadow-2xl shadow-red-900/20">
      <h2 className="text-zinc-500 text-xs uppercase tracking-[0.2em] mb-4">生存倒计时 (6月30日)</h2>
      
      <div className="flex items-baseline space-x-2 md:space-x-6 text-white font-mono">
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl font-bold text-red-500">{timeLeft.days}</span>
          <span className="text-xs text-zinc-600 mt-1">DAYS</span>
        </div>
        <span className="text-2xl text-zinc-700">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-zinc-600 mt-1">HRS</span>
        </div>
        <span className="text-2xl text-zinc-700">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-zinc-600 mt-1">MIN</span>
        </div>
        <span className="text-2xl text-zinc-700">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-zinc-600 mt-1">SEC</span>
        </div>
        <span className="text-2xl text-zinc-700">.</span>
         <div className="flex flex-col items-center w-16 md:w-24">
          <span className="text-2xl md:text-4xl text-red-400 opacity-80">{String(timeLeft.milliseconds).padStart(2, '0')}</span>
          <span className="text-xs text-zinc-600 mt-1">MS</span>
        </div>
      </div>
    </div>
  );
}