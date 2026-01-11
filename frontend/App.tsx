// App.tsx
import React, { useState, useEffect } from 'react';
import { User, Habit, HabitLog } from './types';
import { STORAGE_KEYS } from './services/api';

import * as authApi from './services/authApi';
import * as habitApi from './services/habitApi';
import * as logApi from './services/logApi';

import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import HabitForm from './components/HabitForm';

type View = 'dashboard' | 'stats';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // --- User & Auth ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // --- View & Theme ---
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || saved === 'light' ? saved : 'dark';
    }
    return 'light';
  });

  // --- Data ---
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Initialize user session ---
  useEffect(() => {
    const init = async () => {
      // ✅ Vérifier le token d'abord
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (!token) {
        setLoading(false);
        setShowLogin(true);
        return;
      }

      try {
        const me = await authApi.getMe();
        setUser(me);
      } catch (error) {
        // Token expiré ou invalide
        authApi.logout();
        setUser(null);
        setShowLogin(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- Theme ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // --- Fetch habits & logs when user is logged in ---
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [fetchedHabits, fetchedLogs] = await Promise.all([
          habitApi.getHabits(),
          logApi.getLogs()
        ]);
        setHabits(fetchedHabits);
        setLogs(fetchedLogs);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };

    fetchData();
  }, [user, refreshTrigger]);

  // --- Logout ---
  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setHabits([]);
    setLogs([]);
    setShowLogin(true);
  };

  // --- Create habit ---
  const handleCreateHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'userId'>) => {
    await habitApi.createHabit(habitData);
    setRefreshTrigger(prev => prev + 1);
  };

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 dark:bg-slate-900">
        Loading…
      </div>
    );
  }

  // --- Auth modals ---
  if (!user) {
    return (
      <>
        {showLogin && (
          <LoginModal
            onLogin={u => {  // ✅ Renommer onSuccess → onLogin
              setUser(u);
              setShowLogin(false);
            }}
            switchToRegister={() => {  // ✅ Renommer onGoRegister → switchToRegister
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}
        {showRegister && (
          <RegisterModal
            onRegister={u => {  // ✅ Renommer onSuccess → onRegister
              setUser(u);
              setShowRegister(false);
            }}
            switchToLogin={() => {  // ✅ Renommer onGoLogin → switchToLogin
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        )}
      </>
    );
  }

  // --- Main App layout ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 fixed h-full transition-colors duration-200">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">HabitPulse</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${view === 'dashboard'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => setView('stats')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${view === 'stats'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="flex items-center">
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </button>

          <div className="flex items-center pt-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-slate-200">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-200">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full text-left text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition-colors pl-11">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {view === 'dashboard' && (
          <Dashboard
            habits={habits}
            logs={logs}
            onDataChange={() => setRefreshTrigger(prev => prev + 1)}
            onAddHabit={() => setShowHabitModal(true)}
          />
        )}
        {view === 'stats' && (
          <Stats habits={habits} logs={logs} isDarkMode={theme === 'dark'} />
        )}
      </main>

      {/* Habit Modal */}
      {showHabitModal && (
        <HabitForm
          onClose={() => setShowHabitModal(false)}
          onSubmit={handleCreateHabit}
        />
      )}
    </div>
  );
};

export default App;
