import React, { useState } from 'react';
import { Habit, HabitLog } from '../types';
import { logHabit, deleteHabit } from '../services/mockApi';

interface DashboardProps {
  habits: Habit[];
  logs: HabitLog[];
  onDataChange: () => void;
  onAddHabit: () => void;
}

// ✅ STRICT UTC: Créer une date UTC midnight
const createUTCDate = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month - 1, day));
};

// ✅ Helper: Get Monday of the week (UTC date at 00:00:00)
const getMondayOfWeek = (date: Date): Date => {
  // Utiliser la date UTC
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));

  const day = utcDate.getUTCDay();
  const diff = utcDate.getUTCDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(utcDate);
  monday.setUTCDate(diff);
  return monday;
};

// ✅ Helper: Convert Date to ISO string YYYY-MM-DD (STRICT UTC)
const toISODate = (d: Date): string => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ Helper: Get today's date in UTC
const getTodayUTC = (): string => {
  const now = new Date();
  return toISODate(now);
};

const Dashboard: React.FC<DashboardProps> = ({ habits, logs, onDataChange, onAddHabit }) => {
  // Initialize to the start of the current week (Monday at 00:00 UTC)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));
    return getMondayOfWeek(utcDate);
  });

  const [editingCell, setEditingCell] = useState<{ habit: Habit, date: string, value: string } | null>(null);

  // Helper to get dates of the selected week
  const getWeekDates = (startDate: Date): Date[] => {
    const dates = [];
    const current = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    ));

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);
  const todayUTC = getTodayUTC();

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setUTCDate(newDate.getUTCDate() + (offset * 7));
    setCurrentWeekStart(getMondayOfWeek(newDate));
  };

  const handleToggle = async (habit: Habit, dateStr: string) => {
    const existingLog = logs.find(l => l.habitId === habit.id && l.date === dateStr);

    if (habit.type === 'boolean') {
      const newValue = existingLog && existingLog.value > 0 ? 0 : 1;
      await logHabit(habit.id, dateStr, newValue);
      onDataChange();
    } else {
      setEditingCell({
        habit,
        date: dateStr,
        value: existingLog && existingLog.value > 0 ? existingLog.value.toString() : ''
      });
    }
  };

  const handleSaveNumeric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;

    const val = editingCell.value === '' ? 0 : parseFloat(editingCell.value);

    if (!isNaN(val)) {
      await logHabit(editingCell.habit.id, editingCell.date, val);
      onDataChange();
    }
    setEditingCell(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(id);
      onDataChange();
    }
  };

  const getCellStyles = (habit: Habit, dateStr: string) => {
    const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
    const isDone = log && log.value > 0;

    const base = "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs transition-all duration-200 cursor-pointer border";

    // Empty State (Not Done)
    if (!isDone) return `${base} bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-${habit.color}-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500`;

    // Boolean Done
    if (habit.type === 'boolean') {
      return `${base} bg-${habit.color}-500 border-${habit.color}-600 text-white shadow-sm transform hover:scale-105`;
    }

    // Numeric styling
    const dailyGoal = habit.goal && habit.period === 'daily' ? habit.goal : 0;
    const isGoalMet = dailyGoal > 0 && log && log.value >= dailyGoal;

    return `${base} bg-${habit.color}-500 text-white border-${habit.color}-600 font-bold ${isGoalMet ? 'ring-2 ring-offset-1 ring-green-400 dark:ring-offset-slate-900' : ''}`;
  };

  const formatWeekRange = () => {
    const end = new Date(weekDates[6]);
    const startStr = weekDates[0].toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
    const endStr = end.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="space-y-6 relative">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Focus</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Track your progress day by day</p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-600 dark:text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-slate-200 min-w-[140px] text-center">
            {formatWeekRange()}
          </span>
          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-600 dark:text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          onClick={onAddHabit}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Habit
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">

        {/* Days Header */}
        <div className="grid grid-cols-[1.5fr,repeat(7,1fr)] gap-2 p-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider self-end">Habit</div>
          {weekDates.map((date, i) => {
            // ✅ Comparer en UTC strict
            const dateStr = toISODate(date);
            const isToday = dateStr === todayUTC;
            return (
              <div key={i} className={`text-center flex flex-col items-center ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}>
                <span className="text-xs font-medium uppercase">
                  {date.toLocaleString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                </span>
                <span className={`text-sm font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}`}>
                  {date.getUTCDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {habits.length === 0 && (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
              No habits yet. Click "New Habit" to get started.
            </div>
          )}
          {habits.map(habit => {
            const weekDateStrings = weekDates.map(d => toISODate(d));
            const weeklyLogs = logs.filter(l => l.habitId === habit.id && weekDateStrings.includes(l.date));

            let currentVal = 0;
            let target = 0;
            let unitLabel = habit.unit || '';

            if (habit.period === 'daily') {
              target = 7;
              unitLabel = 'days';
              if (habit.type === 'boolean') {
                currentVal = weeklyLogs.filter(l => l.value > 0).length;
              } else {
                const dailyGoal = habit.goal || 0;
                currentVal = weeklyLogs.filter(l => l.value >= dailyGoal).length;
              }
            } else {
              target = habit.goal || 0;
              if (habit.type === 'boolean') {
                currentVal = weeklyLogs.filter(l => l.value > 0).length;
                unitLabel = 'times';
              } else {
                currentVal = weeklyLogs.reduce((acc, l) => acc + l.value, 0);
              }
            }

            const isTargetMet = target > 0 && currentVal >= target;

            // Tag Logic
            let tagText = habit.period;
            if (habit.period === 'daily' && habit.type === 'numeric' && habit.goal) {
              tagText += ` • ${habit.goal} ${habit.unit || ''}`;
            } else if (habit.period === 'weekly' && habit.goal) {
              tagText += ` • ${habit.goal} ${habit.unit || (habit.type === 'boolean' ? 'times' : '')}`;
            }

            return (
              <div key={habit.id} className="grid grid-cols-[1.5fr,repeat(7,1fr)] gap-2 p-4 items-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">

                {/* Habit Info */}
                <div className="pr-4 min-w-0">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{habit.title}</h4>
                      <button onClick={() => handleDelete(habit.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-${habit.color}-50 dark:bg-${habit.color}-900/30 text-${habit.color}-700 dark:text-${habit.color}-300 uppercase tracking-wide`}>
                        {tagText}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar / Text */}
                  <div className="mt-2">
                    {target > 0 ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-gray-500 dark:text-slate-400">
                          <span>{Math.round(currentVal * 10) / 10} / {target} {unitLabel}</span>
                          <span className={isTargetMet ? "text-green-600 dark:text-green-400" : ""}>{isTargetMet ? "Goal Met" : Math.round((currentVal / target) + Number.EPSILON) + "%"}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${isTargetMet ? 'bg-green-500' : `bg-${habit.color}-500`}`}
                            style={{ width: `${Math.min((currentVal / target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-slate-600">No goal set</p>
                    )}
                  </div>
                </div>

                {/* Days Checkboxes */}
                {weekDates.map((date, i) => {
                  const dateStr = toISODate(date);
                  const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);

                  return (
                    <div key={i} className="flex justify-center">
                      <div
                        className={getCellStyles(habit, dateStr)}
                        onClick={() => handleToggle(habit, dateStr)}
                      >
                        {habit.type === 'boolean' && log && log.value > 0 && (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {habit.type === 'numeric' && log && log.value > 0 && (
                          <span className="text-[10px]">{log.value}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Numeric Input Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" onClick={() => setEditingCell(null)}></div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden transform transition-all sm:max-w-sm w-full relative z-10 border dark:border-slate-700">
            <form onSubmit={handleSaveNumeric}>
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2">
                  Log Progress: {editingCell.habit.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  {new Date(editingCell.date + 'T00:00:00Z').toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Value ({editingCell.habit.unit || 'units'})
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      step="any"
                      autoFocus
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 dark:border-slate-600 rounded-md py-2 border bg-white dark:bg-slate-700 dark:text-white"
                      placeholder="0"
                      value={editingCell.value}
                      onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                    />
                    {editingCell.habit.unit && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-slate-400 sm:text-sm">
                          {editingCell.habit.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t dark:border-slate-700">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setEditingCell(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;