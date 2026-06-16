import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import MaintenancePlanner from './pages/MaintenancePlanner';
import ChatBot from './pages/ChatBot';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'symptoms' && <SymptomChecker />}
          {activeTab === 'maintenance' && <MaintenancePlanner />}
          {activeTab === 'chatbot' && <ChatBot />}
        </main>
      </div>
    </div>
  );
}

export default App;
