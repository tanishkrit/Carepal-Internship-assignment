import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  KeyRound, 
  Mail, 
  Download, 
  ExternalLink, 
  HeartHandshake, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Activity,
  X
} from 'lucide-react';
import api from '../services/api';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  triageAlertCount = 0, 
  onOpenDigest, 
  onOpenShareModal,
  isOpen = false, 
  onClose = () => {} 
}) {
  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Quality Dashboard',
      subtitle: 'Analytics & Care Trends',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'triage',
      label: 'Incident Triage',
      subtitle: 'Low-Score Alerts Queue',
      icon: AlertTriangle,
      badge: triageAlertCount > 0 ? triageAlertCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'tokens',
      label: 'Demo Link Sandbox',
      subtitle: 'Single-Use Tokens & Test Links',
      icon: KeyRound,
      badge: 'Demo',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
    },
    {
      id: 'feedback',
      label: 'Family Feedback Form',
      subtitle: 'Unique Link (No Login)',
      icon: ExternalLink,
      badge: 'Public',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Vertical Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c1427] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Section */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => { setActiveTab('dashboard'); onClose(); }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-[#0c1427] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-teal-400 transition-colors">
                    TheCarePal
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    FS-08
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Care Quality Intelligence</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Ops Status Badge */}
          <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between text-xs">
            <span className="flex items-center space-x-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-medium text-slate-300">Live Quality Monitor</span>
            </span>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Active</span>
          </div>

          {/* Nav Items */}
          <div className="px-4 py-5 space-y-6">
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Core Operations
              </div>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'feedback') {
                          if (onOpenShareModal) {
                            onOpenShareModal();
                          } else {
                            setActiveTab('feedback');
                          }
                        } else {
                          setActiveTab(item.id);
                        }
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-white border-l-4 border-teal-400 shadow-sm shadow-teal-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs ${isActive ? 'text-white font-bold' : 'text-slate-300'}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Actions & Reports */}
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Reports & Actions
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => { onOpenDigest(); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-teal-400 group-hover:bg-slate-800">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>Weekly Ops Digest</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider bg-teal-500/10 px-1.5 py-0.5 rounded">
                    Email
                  </span>
                </button>

                <a
                  href={api.getExportCsvUrl()}
                  download
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-teal-400 group-hover:bg-slate-800">
                      <Download className="w-4 h-4" />
                    </div>
                    <span>Export Feedback CSV</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                    .CSV
                  </span>
                </a>

                <button
                  onClick={() => { 
                    if (onOpenShareModal) {
                      onOpenShareModal();
                    } else {
                      setActiveTab('feedback');
                    }
                    onClose(); 
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-teal-400 group-hover:bg-slate-800">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <span>Share Doctor Form</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User / Profile Footer Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs border border-teal-500/30">
              OP
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Operations Console</div>
              <div className="text-[10px] text-slate-400 truncate">Clinical Quality Lead</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400" title="Connected"></div>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-500">
            TheCarePal India • v1.0.0 (FS-08)
          </div>
        </div>

      </aside>
    </>
  );
}
