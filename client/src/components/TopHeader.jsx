import React from 'react';
import { 
  Menu, 
  Mail, 
  Download, 
  Activity, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export default function TopHeader({ 
  activeTab, 
  onToggleSidebar, 
  onOpenDigest, 
  triageAlertCount = 0 
}) {
  const titles = {
    dashboard: {
      title: 'Care Quality Intelligence',
      subtitle: 'Real-time visit evaluations, caregiver metrics & longitudinal trends'
    },
    triage: {
      title: 'Incident Triage Action Center',
      subtitle: 'Proactive intervention queue for ratings ≤ 3.0 and care concerns'
    },
    tokens: {
      title: 'Single-Use Token Sandbox',
      subtitle: 'Evaluation links, boundary condition tests & instant link generation'
    }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left: Mobile Toggle + Page Heading */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
              {current.title}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Status Indicator Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Normal</span>
          </div>

          {/* Incident Triage Notification Pill if alerts exist */}
          {triageAlertCount > 0 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{triageAlertCount} Alert{triageAlertCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Direct Public Form Link (No Login) */}
          <a
            href="/feedback/demo-active-token"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 text-xs font-bold transition-all shadow-2xs"
            title="Open Public Family Feedback Form (No Login Required)"
          >
            <span>Open Feedback Form</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
          </a>

          {/* Email Digest Action */}
          <button
            onClick={onOpenDigest}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-xs font-semibold transition-all shadow-2xs"
            title="Open Weekly Operations Email Digest"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Weekly Email</span>
          </button>

          {/* CSV Export Action */}
          <a
            href={api.getExportCsvUrl()}
            download
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs"
            title="Export full feedback report as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>

        </div>

      </div>
    </header>
  );
}
