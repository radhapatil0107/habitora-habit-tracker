import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Stats from './pages/Stats';
import Badges from './pages/Badges';
import { useHabits } from './hooks/useHabits';
import './App.css';

function MainApp() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('habitTracker_dark') === 'true';
  });

  const {
    habits,
    loading,
    error,
    addHabit,
    editHabit,
    removeHabit,
    checkIn,
    undoCheckIn,
  } = useHabits(showToast);

  // Sync dark mode class with document body and localStorage
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('habitTracker_dark', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div>
      {/* Sticky Top Navigation */}
      <NavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <div className="app-container">
        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️</span>
            <span>{error}. Please ensure the backend server is running on port 5000.</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            habits={habits}
            loading={loading}
            onAddHabit={addHabit}
            onEditHabit={editHabit}
            onRemoveHabit={removeHabit}
            onCheckin={checkIn}
            onUndoCheckin={undoCheckIn}
          />
        )}

        {activeTab === 'history' && <History habits={habits} />}

        {activeTab === 'stats' && <Stats habits={habits} />}

        {activeTab === 'badges' && <Badges habits={habits} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
