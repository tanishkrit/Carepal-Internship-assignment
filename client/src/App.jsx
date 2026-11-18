import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Public Feedback Portal View (distraction-free for families)
  if (activeTab === 'feedback') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Floating Quick Return Pill for evaluation demo convenience */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleNavigateHome}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition-all flex items-center space-x-1.5"
          >
            <span>← Return to Admin Dashboard</span>
          </button>
        </div>

        <FeedbackPortal
          token={activeToken}
          onNavigateHome={handleNavigateHome}
        />
      </div>
    );
  }

  // Admin & Operations View with Left Vertical Sidebar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      
      {/* 1. Left Vertical Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.history.pushState({}, '', '/');
        }}
        triageAlertCount={triageAlertCount}
        onOpenDigest={() => setIsDigestOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper (shifted by sidebar width on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        
        {/* Sticky Top Header */}
        <TopHeader
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenDigest={() => setIsDigestOpen(true)}
          triageAlertCount={triageAlertCount}
        />

        {/* Content View Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
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
        </main>

        {/* Operations Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© 2026 TheCarePal Home Healthcare India • Clinical Quality Ops</span>
            <div className="flex items-center space-x-3 text-slate-400">
              <button 
                onClick={() => handleSelectToken('demo-active-token')} 
                className="hover:text-teal-700 transition-colors"
              >
                Test Patient Form
              </button>
              <span>•</span>
              <button 
                onClick={() => setIsDigestOpen(true)} 
                className="hover:text-teal-700 transition-colors"
              >
                Weekly Ops Email
              </button>
              <span>•</span>
              <a 
                href={api.getExportCsvUrl()} 
                download 
                className="hover:text-teal-700 transition-colors"
              >
                Download CSV
              </a>
            </div>
          </div>
        </footer>

      </div>

      {/* Weekly Operations Email Digest Modal */}
      <EmailDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
      />

    </div>
  );
}
