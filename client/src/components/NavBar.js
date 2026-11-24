import React from 'react';

export default function NavBar({ activeTab, setActiveTab, darkMode, toggleDarkMode }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
    { id: 'history', label: 'History', icon: '📅' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'badges', label: 'Badges', icon: '🏆' },
  ];

  return (
    <nav className="navbar" role="navigation">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-logo-icon">🎯</span>
          <div className="brand-text-col">
            <strong className="brand-name">HABITORA</strong>
            <span className="brand-tagline">Build habits. Build yourself.</span>
          </div>
        </div>

        <div className="navbar-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="dark-toggle"
            onClick={toggleDarkMode}
            type="button"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
