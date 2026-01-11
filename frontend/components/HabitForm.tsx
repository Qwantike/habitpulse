import React, { useState } from 'react';
import { Habit, HabitType, HabitPeriod } from '../types';

interface HabitFormProps {
  onClose: () => void;
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
}

const COLORS = [
  { name: 'Indigo', value: 'indigo' },
  { name: 'Red', value: 'rose' },
  { name: 'Green', value: 'emerald' },
  { name: 'Blue', value: 'sky' },
  { name: 'Orange', value: 'orange' },
  { name: 'Purple', value: 'violet' },
];

const HabitForm: React.FC<HabitFormProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>('boolean');
  const [period, setPeriod] = useState<HabitPeriod>('daily');
  const [goal, setGoal] = useState<string>('');
  const [unit, setUnit] = useState('');
  const [color, setColor] = useState('indigo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Logic: If Daily Boolean, force goal to be undefined (implicit 1/1)
    const isDailyBoolean = type === 'boolean' && period === 'daily';
    const finalGoal = isDailyBoolean ? undefined : (goal ? Number(goal) : undefined);

    await onSubmit({
      title,
      type,
      period,
      color,
      goal: finalGoal,
      unit: type === 'numeric' ? unit : (period === 'weekly' ? 'times' : undefined)
    });
    setLoading(false);
    onClose();
  };

  // Check condition to disable goal input
  const isGoalInputDisabled = type === 'boolean' && period === 'daily';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border dark:border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                Create New Habit
              </h3>
              <div className="mt-4 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Habit Title</label>
                  <input 
                    type="text" 
                    required 
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="e.g. Gym, Read, Water"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {/* Tracking Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Tracking Style</label>
                  <div className="mt-1 flex space-x-4">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium focus:outline-none transition-colors ${type === 'boolean' ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                      onClick={() => setType('boolean')}
                    >
                      Checkbox (Yes/No)
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium focus:outline-none transition-colors ${type === 'numeric' ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                      onClick={() => setType('numeric')}
                    >
                      Numeric Value
                    </button>
                  </div>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Goal Frequency</label>
                  <div className="mt-1 flex space-x-4">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium focus:outline-none transition-colors ${period === 'daily' ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                      onClick={() => setPeriod('daily')}
                    >
                      Daily Goal
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium focus:outline-none transition-colors ${period === 'weekly' ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                      onClick={() => setPeriod('weekly')}
                    >
                      Weekly Goal
                    </button>
                  </div>
                </div>

                {/* Goal Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isGoalInputDisabled ? 'text-gray-400 dark:text-slate-600' : 'text-gray-700 dark:text-slate-300'}`}>
                      {type === 'boolean' ? 'Target Frequency' : 'Target Value'}
                    </label>
                    <input 
                      type="number" 
                      required={period === 'weekly'} // Mandatory for weekly
                      disabled={isGoalInputDisabled}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder={isGoalInputDisabled ? "Not applicable" : (type === 'boolean' ? "e.g. 5 (times)" : "e.g. 10000")}
                      value={isGoalInputDisabled ? '' : goal}
                      onChange={e => setGoal(e.target.value)}
                    />
                    {type === 'boolean' && period === 'weekly' && (
                       <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">How many times per week?</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Unit (Optional)</label>
                    <input 
                      type="text" 
                      disabled={type === 'boolean'}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder={type === 'boolean' ? "times" : "e.g. steps, pages"}
                      value={type === 'boolean' ? 'times' : unit}
                      onChange={e => setUnit(e.target.value)}
                    />
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Color Theme</label>
                  <div className="flex space-x-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`w-8 h-8 rounded-full focus:outline-none ring-2 ring-offset-2 dark:ring-offset-slate-800 ${color === c.value ? 'ring-gray-400 dark:ring-slate-400' : 'ring-transparent'}`}
                        style={{ backgroundColor: `var(--color-${c.value}-500)` }} 
                      >
                         <span className={`block w-full h-full rounded-full bg-${c.value}-500 hover:bg-${c.value}-600`}></span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t dark:border-slate-700">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {loading ? 'Creating...' : 'Create Habit'}
              </button>
              <button 
                type="button" 
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HabitForm;