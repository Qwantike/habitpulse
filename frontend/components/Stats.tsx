import React, { useMemo, useState } from 'react';
import { Habit, HabitLog } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

interface StatsProps {
  habits: Habit[];
  logs: HabitLog[];
  isDarkMode?: boolean;
}

// Map Tailwind color names to Hex values for Recharts
const CHART_COLORS: Record<string, string> = {
  indigo: '#6366f1',
  rose: '#f43f5e',
  emerald: '#10b981',
  sky: '#0ea5e9',
  orange: '#f97316',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  gray: '#9ca3af',
};

const getColor = (colorName: string) => CHART_COLORS[colorName] || CHART_COLORS.indigo;

// Helper to get ISO date string YYYY-MM-DD
const toISODate = (d: Date) => d.toISOString().split('T')[0];

const Stats: React.FC<StatsProps> = ({ habits, logs, isDarkMode = false }) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');

  // Default selection
  const activeHabitId = selectedHabitId || (habits.length > 0 ? habits[0].id : '');
  const selectedHabit = habits.find(h => h.id === activeHabitId);

  // Dynamic chart colors based on theme
  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b';

  // --- 1. Global Adherence Rate (Last 28 Days) ---
  const adherenceData = useMemo(() => {
    return habits.map(habit => {
      const today = new Date();
      // Use 28 days window (4 weeks)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 28);
      
      let successCount = 0;
      let totalCount = 0;

      if (habit.period === 'daily') {
         totalCount = 28;
         for (let i = 0; i < 28; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i + 1);
            const dateStr = toISODate(d);
            const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
            
            const target = habit.goal || 1;
            const value = log ? log.value : 0;
            if (value >= target) successCount++;
         }
      } else {
         // Weekly
         totalCount = 4;
         for (let w = 0; w < 4; w++) {
             const chunkStart = new Date(today);
             chunkStart.setDate(today.getDate() - ((w + 1) * 7) + 1);
             
             let weekTotal = 0;
             for (let d = 0; d < 7; d++) {
                const dayDate = new Date(chunkStart);
                dayDate.setDate(chunkStart.getDate() + d);
                const dateStr = toISODate(dayDate);
                const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
                
                if (log) {
                   if (habit.type === 'boolean') weekTotal += (log.value > 0 ? 1 : 0);
                   else weekTotal += log.value;
                }
             }
             const target = habit.goal || 1;
             if (weekTotal >= target) successCount++;
         }
      }

      const percentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
      
      return {
        name: habit.title,
        percentage: Math.round(percentage),
        color: habit.color
      };
    });
  }, [habits, logs]);

  // --- 2. Trend Data (Last 14 Days) ---
  const trendData = useMemo(() => {
    if (!selectedHabit) return [];
    
    const data = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = toISODate(d);
      const log = logs.find(l => l.habitId === activeHabitId && l.date === dateStr);
      
      data.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        value: log ? log.value : 0,
        fullDate: dateStr
      });
    }
    return data;
  }, [activeHabitId, habits, logs]);

  // --- 3. Calendar Heatmap Data (Last 90 days) ---
  const calendarData = useMemo(() => {
    if (!selectedHabit) return [];
    const days = [];
    const today = new Date();
    // Start 90 days ago
    const start = new Date(today);
    start.setDate(today.getDate() - 90);

    for (let i = 0; i <= 90; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = toISODate(d);
        const log = logs.find(l => l.habitId === activeHabitId && l.date === dateStr);
        
        let intensity = 0; // 0 (none), 1 (some), 2 (met goal)
        const target = selectedHabit.goal || 1;
        const val = log ? log.value : 0;

        if (val >= target) intensity = 2;
        else if (val > 0) intensity = 1;

        days.push({
            date: d,
            dateStr,
            value: val,
            intensity,
            dayOfWeek: d.getDay()
        });
    }
    return days;
  }, [activeHabitId, selectedHabit, logs]);

  // --- 4. Streaks Calculation ---
  const streakStats = useMemo(() => {
     if (!selectedHabit) return { current: 0, best: 0 };
     
     if (selectedHabit.period === 'daily') {
        // Daily Logic
        const metDates = new Set<string>();
        logs.forEach(l => {
            if (l.habitId === activeHabitId) {
                const target = selectedHabit.goal || 1;
                if (l.value >= target) metDates.add(l.date);
            }
        });

        const sortedDates = Array.from(metDates).sort();
        if (sortedDates.length === 0) return { current: 0, best: 0 };

        // Current Streak
        let currentStreak = 0;
        const today = new Date();
        const todayStr = toISODate(today);
        let checkDate = new Date(today);
        
        if (!metDates.has(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const str = toISODate(checkDate);
            if (metDates.has(str)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Best Streak
        let maxStreak = 1;
        let tempStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i-1]);
            const curr = new Date(sortedDates[i]);
            const diffTime = Math.abs(curr.getTime() - prev.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays === 1) tempStreak++;
            else tempStreak = 1;
            
            if (tempStreak > maxStreak) maxStreak = tempStreak;
        }
        
        return { current: currentStreak, best: maxStreak };

     } else {
        // Weekly Logic
        const getMonday = (d: Date) => {
          const date = new Date(d);
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          date.setDate(diff);
          date.setHours(0,0,0,0);
          return date;
        };
        const getWeekKey = (d: Date) => toISODate(getMonday(d));

        const weeklySuccess = new Set<string>();
        const logsByWeek: Record<string, number> = {};

        logs.forEach(l => {
            if (l.habitId === activeHabitId) {
                const date = new Date(l.date);
                const weekKey = getWeekKey(date);
                
                const val = selectedHabit.type === 'boolean' 
                    ? (l.value > 0 ? 1 : 0)
                    : l.value;
                
                logsByWeek[weekKey] = (logsByWeek[weekKey] || 0) + val;
            }
        });

        const target = selectedHabit.goal || 1;
        Object.entries(logsByWeek).forEach(([weekKey, total]) => {
            if (total >= target) {
                weeklySuccess.add(weekKey);
            }
        });

        // Current Streak
        let currentStreak = 0;
        const today = new Date();
        const thisWeekKey = getWeekKey(today);
        
        let checkDate = new Date(thisWeekKey);
        
        // If current week is done, start count
        if (weeklySuccess.has(thisWeekKey)) {
             currentStreak++;
        }
        
        // Check backwards (Week - 1, Week - 2...)
        checkDate.setDate(checkDate.getDate() - 7);
        while (true) {
            const key = toISODate(checkDate);
            if (weeklySuccess.has(key)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 7);
            } else {
                break;
            }
        }

        // Best Streak
        const sortedWeeks = Array.from(weeklySuccess).sort();
        let maxStreak = 0;
        if (sortedWeeks.length > 0) {
            maxStreak = 1;
            let tempStreak = 1;
            for (let i = 1; i < sortedWeeks.length; i++) {
                const prev = new Date(sortedWeeks[i-1]);
                const curr = new Date(sortedWeeks[i]);
                const diffTime = Math.abs(curr.getTime() - prev.getTime());
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 7) tempStreak++;
                else tempStreak = 1;
                
                if (tempStreak > maxStreak) maxStreak = tempStreak;
            }
        }

        return { current: currentStreak, best: maxStreak };
     }
  }, [selectedHabit, logs, activeHabitId]);

  // --- 5. Day of Week Performance (Radar) ---
  const dayOfWeekData = useMemo(() => {
    if (!selectedHabit) return [];
    
    // Initialize counters 0 (Sun) to 6 (Sat)
    const distribution = Array(7).fill(0);
    const success = Array(7).fill(0);
    const today = new Date();

    // Look at last 90 days
    for(let i=0; i<90; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        
        const dateStr = toISODate(d);
        const dayIndex = new Date(dateStr).getUTCDay();

        distribution[dayIndex]++; 
        
        const log = logs.find(l => l.habitId === activeHabitId && l.date === dateStr);
        const target = selectedHabit.goal || 1;
        
        const isSuccess = selectedHabit.period === 'daily' 
            ? (log && log.value >= target)
            : (log && log.value > 0);

        if (isSuccess) {
            success[dayIndex]++;
        }
    }

    const daysLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return daysLabel.map((label, i) => ({
        subject: label,
        A: distribution[i] > 0 ? Math.round((success[i] / distribution[i]) * 100) : 0,
        fullMark: 100
    }));

  }, [selectedHabit, logs, activeHabitId]);


  if (habits.length === 0) {
    return <div className="text-gray-500 dark:text-slate-400 text-center py-10">Create habits to see analytics.</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Row: Global Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Adherence Rate */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 lg:col-span-2 transition-colors">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Global Success Rate</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Percentage of goals met over the last 28 days.</p>
            <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adherenceData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 12, fill: axisColor}} />
                <Tooltip 
                    cursor={{fill: isDarkMode ? '#334155' : '#f1f5f9'}}
                    formatter={(value: number) => [`${value}%`, 'Success Rate']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: tooltipBg, color: tooltipText }}
                    itemStyle={{ color: tooltipText }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={16}>
                    {adherenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.color)} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Streaks Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-center transition-colors">
            {selectedHabit ? (
                <>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Streaks <span className="text-gray-400 dark:text-slate-500 font-normal text-sm">({selectedHabit.title})</span></h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div>
                                <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold tracking-wider">Current Streak</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{streakStats.current} <span className="text-sm font-normal text-gray-500 dark:text-slate-400">{selectedHabit.period === 'weekly' ? 'weeks' : 'days'}</span></p>
                            </div>
                            <div className="text-orange-500">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.45-.412-1.725a1 1 0 00-1.846-.487c-.135.27-.35.887-.35 1.584 0 .937.26 1.86.643 2.69.805 1.745 2.22 3.12 3.966 3.86 1.48.626 3.16.623 4.67.06a5.05 5.05 0 002.5-2.07 5.05 5.05 0 00.565-2.583c-.026-.84-.25-1.635-.593-2.338-.343-.703-.837-1.32-1.31-1.815-.473-.496-.957-.864-1.29-1.055-.333-.19-.487-.215-.494-.216z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <div>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase font-bold tracking-wider">Best Streak</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{streakStats.best} <span className="text-sm font-normal text-gray-500 dark:text-slate-400">{selectedHabit.period === 'weekly' ? 'weeks' : 'days'}</span></p>
                            </div>
                            <div className="text-indigo-500">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" /></svg>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-400 dark:text-slate-500">
                    <p>Select a habit below to see Streak stats.</p>
                </div>
            )}
        </div>
      </div>

      {/* Control Bar for Detailed Stats */}
      <div className="flex items-center justify-between pt-4">
         <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detailed Analysis</h3>
         <select 
             value={activeHabitId}
             onChange={(e) => setSelectedHabitId(e.target.value)}
             className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
           >
             {habits.map(h => (
               <option key={h.id} value={h.id}>{h.title}</option>
             ))}
         </select>
      </div>

      {selectedHabit && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Consistency Map (Heatmap) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 lg:col-span-2 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-700 dark:text-slate-200">Consistency Calendar</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                        <span>Less</span>
                        <div className="w-3 h-3 bg-gray-100 dark:bg-slate-700 rounded-sm"></div>
                        <div className={`w-3 h-3 bg-${selectedHabit.color}-200 dark:bg-${selectedHabit.color}-900 rounded-sm`}></div>
                        <div className={`w-3 h-3 bg-${selectedHabit.color}-500 rounded-sm`}></div>
                        <span>More</span>
                    </div>
                </div>
                
                {/* Heatmap Grid */}
                <div className="flex flex-wrap gap-1">
                    {calendarData.map((day, i) => (
                        <div 
                            key={i} 
                            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-all relative group
                                ${day.intensity === 0 ? 'bg-gray-100 dark:bg-slate-700' : ''}
                                ${day.intensity === 1 ? `bg-${selectedHabit.color}-300 dark:bg-${selectedHabit.color}-800 opacity-60` : ''}
                                ${day.intensity === 2 ? `bg-${selectedHabit.color}-500` : ''}
                            `}
                        >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                {day.date.toLocaleDateString()} : {day.value}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-right">Last 90 days</p>
            </div>

            {/* Radar Chart (Day of Week) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                <h4 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-2">Performance by Day of Week</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Frequency of activity (Weekly) or success (Daily) per weekday.</p>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dayOfWeekData}>
                            <PolarGrid stroke={gridColor} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: axisColor, fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Success Rate"
                                dataKey="A"
                                stroke={getColor(selectedHabit.color)}
                                fill={getColor(selectedHabit.color)}
                                fillOpacity={0.5}
                            />
                            <Tooltip 
                                formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: tooltipBg, color: tooltipText }}
                                itemStyle={{ color: tooltipText }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Trend Line (Existing) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                <h4 className="text-md font-semibold text-gray-700 dark:text-slate-200 mb-2">Recent Trend (Last 14 Days)</h4>
                 <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Your daily value logs.</p>
                <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="date" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: tooltipBg, color: tooltipText }}
                        itemStyle={{ color: tooltipText }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={getColor(selectedHabit.color)} 
                        strokeWidth={3}
                        dot={{ r: 4, fill: isDarkMode ? '#1e293b' : 'white', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        name={selectedHabit.unit || 'Value'}
                    />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </div>

          </div>
      )}
    </div>
  );
};

export default Stats;