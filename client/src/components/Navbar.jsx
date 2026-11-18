import React from 'react';
import { HeartHandshake, BarChart3, AlertCircle, KeyRound, Download, Mail, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onOpenDigest, triageAlertCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">TheCarePal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Task FS-08
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Visit Feedback & Care Quality Intelligence</p>
            </div>
          </div>

          {/* Navigation Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-800 shadow-xs border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === 'triage'
                  ? 'bg-rose-50 text-rose-800 shadow-xs border border-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Incident Triage</span>
              {triageAlertCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {triageAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'tokens'
                  ? 'bg-blue-50 text-blue-800 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Demo Links</span>
            </button>
          </nav>

          {/* Top Right Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDigest}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              title="Open Weekly Operations Email Digest"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Weekly Email</span>
            </button>

            <a
              href={api.getExportCsvUrl()}
              download
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Export all feedback to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
