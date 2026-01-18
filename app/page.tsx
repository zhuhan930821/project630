'use client';

import { useState, useEffect } from 'react';
import Countdown from '@/components/Countdown';
import Heatmap from '@/components/Heatmap';
import { supabase } from '@/utils/supabase';

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 编辑功能状态
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // 获取今天的日期字符串 (YYYY-MM-DD)
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    checkAndLoadData();
  }, []);

  // 核心逻辑：检查日期 + 加载数据
  const checkAndLoadData = async () => {
    setLoading(true);
    const todayStr = getTodayString();

    // A. 拉取 tasks 表里的数据
    const { data: currentTasks } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: true });

    if (!currentTasks || currentTasks.length === 0) {
      setLoading(false);
      return;
    }

    // B. 检查日期：如果数据库里的日期不是今天，说明是旧数据
    const dbDate = currentTasks[0].task_date; 

    if (dbDate && dbDate !== todayStr) {
      console.log(`发现旧数据 (${dbDate})，正在归档并重置...`);
      
      // 1. 算出那天的完成数
      const count = currentTasks.filter((t: any) => t.completed).length;

      // 2. 存入 daily_history (归档)
      await supabase.from('daily_history').upsert(
        { date: dbDate, completed_count: count }, 
        { onConflict: 'date' }
      );

      // 3. 重置 tasks 表 (把日期改成今天，completed 设为 false)
      await supabase.from('tasks').update({ 
        task_date: todayStr, 
        completed: false 
      }).gt('id', 0);

      // 4. 前端刷新
      window.location.reload();
      
    } else {
      // C. 如果日期就是今天，直接显示
      setTasks(currentTasks);
      setLoading(false);
    }
  };

  // --- 交互逻辑 ---

  const toggleTask = async (id: number, currentStatus: boolean) => {
    // 乐观更新
    const newStatus = !currentStatus;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t));
    await supabase.from('tasks').update({ completed: newStatus }).eq('id', id);
  };

  const startEditing = (task: any) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveText = async (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text: editText } : t));
    setEditingId(null);
    await supabase.from('tasks').update({ text: editText }).eq('id', id);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  // 3个全做完变成金色，否则是深灰色
  const progressColor = completedCount === 3 ? 'bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-zinc-800';

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">System Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-12 font-sans selection:bg-red-900">
      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">PROJECT 630</h1>
          <p className="text-zinc-500 text-sm">Action or Rejection.</p>
        </div>

        {/* 1. 倒计时 */}
        <Countdown />

        {/* 2. 任务控制台 */}
        <div className={`transition-all duration-700 ease-in-out p-8 rounded-2xl border border-zinc-800 ${progressColor}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">今日核心任务 ({getTodayString()})</h3>
            <span className="font-mono text-2xl">{completedCount}/3</span>
          </div>
          
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`group flex items-center p-4 rounded-lg border transition-all ${
                  task.completed 
                    ? 'bg-black/20 border-transparent' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {/* 打钩框 */}
                <div 
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`cursor-pointer w-6 h-6 rounded border mr-4 flex-shrink-0 flex items-center justify-center transition-colors ${
                    task.completed ? 'bg-white border-white' : 'border-zinc-600'
                  }`}
                >
                  {task.completed && <div className="w-3 h-3 bg-black rounded-sm" />}
                </div>

                {/* 编辑框逻辑 */}
                {editingId === task.id ? (
                  <input 
                    autoFocus
                    type="text" 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveText(task.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveText(task.id)}
                    className="bg-transparent border-b border-white text-white focus:outline-none w-full"
                  />
                ) : (
                  <span 
                    onClick={() => startEditing(task)}
                    className={`flex-1 text-sm md:text-base cursor-text ${
                      task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                    }`}
                    title="点击修改任务"
                  >
                    {task.text}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {completedCount === 3 && (
            <div className="mt-6 text-center text-sm font-bold text-black bg-white/90 py-2 rounded animate-pulse">
              今日安全 (SAFE)
            </div>
          )}
        </div>

        {/* 3. 热力图 */}
        <Heatmap />

      </div>
    </main>
  );
}