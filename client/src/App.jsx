import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import IncidentTriage from './pages/IncidentTriage';
import TokenTester from './pages/TokenTester';
import FeedbackPortal from './pages/FeedbackPortal';
import EmailDigestModal from './components/EmailDigestModal';
import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    // If URL is /feedback/... start in feedback mode
    if (window.location.pathname.startsWith('/feedback')) {
      return 'feedback';
    }
    return 'dashboard';
  });

  const [activeToken, setActiveToken] = useState(() => {
    const pathParts = window.location.pathname.split('/');
    const fbIdx = pathParts.indexOf('feedback');
    if (fbIdx !== -1 && pathParts[fbIdx + 1]) {
      return pathParts[fbIdx + 1];
    }
    return 'demo-active-token';
  });

  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [triageAlertCount, setTriageAlertCount] = useState(0);

  useEffect(() => {
    loadAlertCount();
  }, []);

  async function loadAlertCount() {
    try {
      const res = await api.getMetrics();
      if (res.success) {
        setTriageAlertCount(res.data.lowScoreAlertsCount || 0);
      }
    } catch (err) {
      console.error('Error fetching alert count:', err);
    }
  }

  function handleSelectToken(token) {
    setActiveToken(token);
    setActiveTab('feedback');
    window.history.pushState({}, '', `/feedback/${token}`);
  }

  function handleNavigateHome() {
    setActiveTab('dashboard');
    window.history.pushState({}, '', '/');
    loadAlertCount();
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/feedback')) {
        const parts = window.location.pathname.split('/');
        setActiveToken(parts[parts.length - 1] || 'demo-active-token');
        setActiveTab('feedback');
      } else {
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Show Navbar when in Admin mode */}
      {activeTab !== 'feedback' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'feedback') {
              window.history.pushState({}, '', '/');
            }
          }}
          onOpenDigest={() => setIsDigestOpen(true)}
          triageAlertCount={triageAlertCount}
        />
      )}

      {/* Main Content Area */}
      <main className={activeTab === 'feedback' ? 'flex-1' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6'}>
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTriage={() => setActiveTab('triage')}
            onOpenDigest={() => setIsDigestOpen(true)}
          />
        )}

        {activeTab === 'triage' && (
          <IncidentTriage
            onStatusChange={loadAlertCount}
          />
        )}

        {activeTab === 'tokens' && (
          <TokenTester
            onSelectToken={handleSelectToken}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackPortal
            token={activeToken}
            onNavigateHome={handleNavigateHome}
          />
        )}
      </main>

      {/* Operations Email Digest Modal */}
      <EmailDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
      />

      {/* Footer (Admin Mode) */}
      {activeTab !== 'feedback' && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 TheCarePal Quality Assurance System • Built for Task FS-08</span>
            <div className="flex space-x-4 text-slate-400">
              <button onClick={() => handleSelectToken('demo-active-token')} className="hover:text-teal-700">
                Test Public Form
              </button>
              <span>•</span>
              <button onClick={() => setIsDigestOpen(true)} className="hover:text-teal-700">
                Weekly Ops Email
              </button>
              <span>•</span>
              <a href={api.getExportCsvUrl()} download className="hover:text-teal-700">
                Download CSV
              </a>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
