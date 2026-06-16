import React from 'react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'chatbot', label: '🤖 AI Chat' },
];

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="glass-panel" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1.5rem', padding: '0.8rem 1.5rem',
    }}>
      <div
        className="logo"
        style={{ fontSize: '1.4rem', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}
        onClick={() => setActiveTab('dashboard')}
      >
        <span className="neon-text-blue">Euro</span><span className="neon-text-amber">Diag</span>
      </div>
      <div className="nav-links" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.2s ease',
              border: activeTab === tab.id ? '1px solid var(--accent-blue)' : '1px solid transparent',
              backgroundColor: activeTab === tab.id ? 'rgba(0, 243, 255, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
