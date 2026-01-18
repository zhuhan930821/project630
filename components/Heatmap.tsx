'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function Heatmap() {
  const [history, setHistory] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    // 拉取过去 35 天的数据
    const { data } = await supabase
      .from('daily_history')
      .select('date, completed_count')
      .order('date', { ascending: false })
      .limit(35);

    if (data) {
      // 转换成字典格式: { '2026-01-18': 3, '2026-01-17': 1 }
      const historyMap: Record<string, number> = {};
      data.forEach((item) => {
        historyMap[item.date] = item.completed_count;
      });
      setHistory(historyMap);
    }
  };

  // 生成过去 30 天的日期数组
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i)); // 从29天前倒推到今天
    return d.toISOString().split('T')[0]; // 格式: YYYY-MM-DD
  });

  // 根据完成数量决定颜色
  const getColor = (count: number | undefined) => {
    if (count === undefined) return 'bg-zinc-900'; // 无记录 (灰色)
    if (count === 0) return 'bg-zinc-800';         // 有记录但没做 (深灰)
    if (count === 1) return 'bg-green-900/60';     // 做了一点 (暗绿)
    if (count === 2) return 'bg-green-700/80';     // 做了大半 (中绿)
    if (count === 3) return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'; // 完美 (亮绿+发光)
    return 'bg-zinc-900';
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs text-zinc-500 uppercase tracking-widest">历史战绩 (Last 30 Days)</h3>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map((date) => (
          <div 
            key={date} 
            title={`${date}: 完成 ${history[date] || 0} 个`}
            className={`h-4 w-full rounded-sm transition-all duration-500 ${getColor(history[date])}`} 
          />
        ))}
      </div>
    </div>
  );
}