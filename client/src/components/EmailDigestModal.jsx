import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, Check, Star, AlertTriangle, Award, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function EmailDigestModal({ isOpen, onClose }) {
  const [digestData, setDigestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'html'

  useEffect(() => {
    if (isOpen) {
      loadDigest();
    }
  }, [isOpen]);

  async function loadDigest() {
    setLoading(true);
    try {
      const res = await api.getWeeklyDigest();
      if (res.success) {
        setDigestData(res.data);
      }
    } catch (err) {
      console.error('Error loading weekly digest:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!digestData?.emailHtml) return;
    navigator.clipboard.writeText(digestData.emailHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Weekly Operations Care Digest</h2>
              <p className="text-xs text-slate-500">Automated summary dispatch for clinical managers and operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Preview
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'html'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HTML Template Source
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadDigest}
              disabled={loading}
              className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
              title="Refresh digest data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'HTML Copied!' : 'Copy HTML'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500">Compiling weekly quality trends and caregiver scorecards...</p>
            </div>
          ) : activeTab === 'preview' ? (
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-6 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">TheCarePal Quality Assurance</span>
                <h1 className="text-xl font-bold mt-1">Weekly Operations Quality Digest</h1>
                <p className="text-xs text-teal-100 mt-1">Week Ending {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>

              {/* KPI Grid */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-center">
                    <div className="text-xl font-extrabold text-teal-800">
                      {digestData?.weeklyStats?.avgRating || '0.0'} <span className="text-xs font-normal text-teal-600">/ 5.0</span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-teal-600 mt-1">Avg Care Quality</div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                    <div className="text-xl font-extrabold text-emerald-800">
                      {digestData?.nps > 0 ? `+${digestData.nps}` : digestData?.nps}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-emerald-600 mt-1">Weekly NPS</div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                    <div className="text-xl font-extrabold text-blue-800">
                      {digestData?.totalReviews || 0}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-blue-600 mt-1">Feedbacks Logged</div>
                  </div>
                </div>

                {/* Dimension Breakdown */}
                <div className="bg-slate-50 rounded-lg p-3.5 mb-6 border border-slate-100">
                  <div className="text-xs font-bold text-slate-700 mb-2">Category Score Averages</div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="text-slate-500 text-[10px]">Punctuality</div>
                      <div className="font-bold text-slate-800">{digestData?.weeklyStats?.avgPunctuality || '0.0'} ★</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Quality of Care</div>
                      <div className="font-bold text-slate-800">{digestData?.weeklyStats?.avgQuality || '0.0'} ★</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Hygiene</div>
                      <div className="font-bold text-slate-800">{digestData?.weeklyStats?.avgHygiene || '0.0'} ★</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Behaviour</div>
                      <div className="font-bold text-slate-800">{digestData?.weeklyStats?.avgBehaviour || '0.0'} ★</div>
                    </div>
                  </div>
                </div>

                {/* Top Caregivers */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-3 border-b border-slate-100 pb-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Top Performing Caregivers of the Week</span>
                  </div>
                  {digestData?.topNurses?.length > 0 ? (
                    <div className="space-y-2">
                      {digestData.topNurses.map((nurse, i) => (
                        <div key={nurse.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white">
                          <div className="flex items-center space-x-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                              #{i + 1}
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-slate-800">{nurse.name}</div>
                              <div className="text-[10px] text-slate-500">{nurse.specialty} • {nurse.city}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-teal-700 flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1 inline" />
                              {nurse.avgScore}
                            </div>
                            <div className="text-[10px] text-slate-400">{nurse.reviewCount} visits</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No feedback entries recorded this week.</p>
                  )}
                </div>

                {/* Priority Incidents */}
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-3 border-b border-slate-100 pb-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Priority Low-Score Incidents ({digestData?.lowScoreIncidents?.length || 0})</span>
                  </div>
                  {digestData?.lowScoreIncidents?.length > 0 ? (
                    <div className="space-y-2">
                      {digestData.lowScoreIncidents.map((inc) => (
                        <div key={inc.id} className="p-3 rounded-lg border border-rose-200 bg-rose-50/60 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-rose-900">{inc.nurseName}</span>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-800">
                              {inc.triage_status}
                            </span>
                          </div>
                          <p className="text-slate-700 italic mb-1.5">"{inc.sanitized_comment || 'No comment text provided'}"</p>
                          <div className="text-[10px] text-slate-500">
                            Patient: {inc.patientName} • Score: <strong className="text-rose-700">{inc.average_rating} / 5.0</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs">
                      ✓ No low-score incidents logged this week. All visits met high quality standards!
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
                Automated clinical report by TheCarePal Quality Assurance System • Internal Confidential
              </div>
            </div>
          ) : (
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap selection:bg-teal-700">
              {digestData?.emailHtml}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
          <span>Sent every Monday at 9:00 AM IST to ops@thecarepal.com</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
