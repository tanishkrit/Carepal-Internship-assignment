import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  PhoneCall, 
  User, 
  Calendar, 
  ShieldAlert, 
  Check, 
  Search, 
  Filter,
  MessageSquare
} from 'lucide-react';
import StarRating from '../components/StarRating';
import api from '../services/api';

export default function IncidentTriage({ onStatusChange }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | contacted | resolved
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [notesDrafts, setNotesDrafts] = useState({});

  useEffect(() => {
    loadTriageQueue();
  }, []);

  async function loadTriageQueue() {
    setLoading(true);
    try {
      const res = await api.getTriageQueue();
      if (res.success) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error('Error fetching triage queue:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id, newStatus) {
    setUpdatingId(id);
    const notes = notesDrafts[id];
    try {
      const res = await api.updateTriage(id, newStatus, notes);
      if (res.success) {
        // Optimistically update local state
        setIncidents(prev =>
          prev.map(item => (item.id === id ? { ...item, triage_status: newStatus, triage_notes: notes || item.triage_notes } : item))
        );
        if (onStatusChange) onStatusChange();
      }
    } catch (err) {
      alert(err.message || 'Failed to update incident status.');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredIncidents = incidents.filter(inc => {
    const matchesStatus = filterStatus === 'all' || inc.triage_status === filterStatus;
    const matchesSearch =
      search === '' ||
      inc.nurse_name.toLowerCase().includes(search.toLowerCase()) ||
      inc.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      (inc.sanitized_comment && inc.sanitized_comment.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = incidents.filter(i => i.triage_status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 to-rose-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            <span>Care Quality Early Warning System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Low-Score Incident Triage Queue</h1>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl mt-1">
            Visits flagged with rating drops (&le; 3.0), punctuality delays, or caregiver behavioral concerns. Operations reaches out proactively before family complaints escalate.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center shrink-0">
          <div className="text-3xl font-extrabold text-white">{pendingCount}</div>
          <div className="text-[11px] font-semibold uppercase text-rose-200 mt-0.5">Pending Action</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['all', 'pending', 'contacted', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status} ({status === 'all' ? incidents.length : incidents.filter(i => i.triage_status === status).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search nurse, patient, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Loading incident queue...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Incidents in Selected View</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All flagged low-score visits have either been addressed or no entries match your search filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map(inc => {
            const isPending = inc.triage_status === 'pending';
            const isContacted = inc.triage_status === 'contacted';
            const isResolved = inc.triage_status === 'resolved';

            return (
              <div
                key={inc.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md ${
                  isPending
                    ? 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/20'
                    : isContacted
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  
                  {/* Left Column: Details */}
                  <div className="space-y-3 flex-1">
                    
                    {/* Urgency and Status Tags */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isPending ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        isContacted ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        Status: {inc.triage_status}
                      </span>

                      {inc.average_rating <= 2.0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Critical Concern (&le; 2.0)</span>
                        </span>
                      )}

                      {inc.has_profanity === 1 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Abusive Language Masked
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        Submitted: {new Date(inc.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Nurse & Patient info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Caregiver</span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{inc.nurse_name}</div>
                        <div className="text-slate-500 text-[11px]">{inc.nurse_specialty} • Tel: {inc.nurse_phone}</div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Patient & Family</span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{inc.patient_name} ({inc.family_name})</div>
                        <div className="text-slate-500 text-[11px]">Visit Date: {inc.visit_date} • {inc.care_type}</div>
                      </div>
                    </div>

                    {/* Dimension Ratings */}
                    <div className="flex flex-wrap items-center gap-3 text-xs py-1">
                      <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-slate-200">
                        <span className="text-slate-500">Overall:</span>
                        <StarRating value={inc.average_rating} readOnly size="sm" />
                      </div>
                      <div className="text-slate-600">Punctuality: <strong className={inc.punctuality <= 2 ? 'text-rose-600 font-bold' : ''}>{inc.punctuality}★</strong></div>
                      <div className="text-slate-600">Quality: <strong className={inc.care_quality <= 2 ? 'text-rose-600 font-bold' : ''}>{inc.care_quality}★</strong></div>
                      <div className="text-slate-600">Hygiene: <strong className={inc.hygiene <= 2 ? 'text-rose-600 font-bold' : ''}>{inc.hygiene}★</strong></div>
                      <div className="text-slate-600">Behaviour: <strong className={inc.behaviour <= 2 ? 'text-rose-600 font-bold' : ''}>{inc.behaviour}★</strong></div>
                      <div className="text-slate-600">NPS: <strong className={inc.nps_score <= 4 ? 'text-rose-600 font-bold' : ''}>{inc.nps_score} / 10</strong></div>
                    </div>

                    {/* Family Comment */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] uppercase font-bold mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Family's Observation</span>
                      </div>
                      <p className="text-slate-800 font-medium italic">"{inc.sanitized_comment || 'No comment text provided'}"</p>
                    </div>

                    {/* Triage Notes Log */}
                    {inc.triage_notes && (
                      <div className="text-[11px] text-teal-800 bg-teal-50/70 p-2.5 rounded-lg border border-teal-200">
                        <strong>Operations Action Note:</strong> {inc.triage_notes}
                      </div>
                    )}

                  </div>

                  {/* Right Column: Actions */}
                  <div className="lg:w-80 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3 shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                      Triage Action & Resolution Log
                    </span>

                    {/* Quick Resolution Templates */}
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Quick Note Templates:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'Family called; concern resolved.',
                          'Caregiver coached on hygiene.',
                          'Replacement nurse assigned.'
                        ].map((snippet) => (
                          <button
                            key={snippet}
                            type="button"
                            onClick={() => setNotesDrafts({ ...notesDrafts, [inc.id]: snippet })}
                            className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 font-medium transition-colors text-left"
                          >
                            + {snippet}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      placeholder="Add investigation or outreach notes..."
                      value={notesDrafts[inc.id] !== undefined ? notesDrafts[inc.id] : (inc.triage_notes || '')}
                      onChange={(e) => setNotesDrafts({ ...notesDrafts, [inc.id]: e.target.value })}
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-2xs"
                    />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => handleUpdateStatus(inc.id, 'contacted')}
                        disabled={updatingId === inc.id || isContacted}
                        className="py-2 px-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Contacted</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(inc.id, 'resolved')}
                        disabled={updatingId === inc.id || isResolved}
                        className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </button>
                    </div>

                    {isResolved && (
                      <button
                        onClick={() => handleUpdateStatus(inc.id, 'pending')}
                        disabled={updatingId === inc.id}
                        className="w-full text-center text-[10px] text-slate-500 hover:text-rose-600 font-medium py-1"
                      >
                        Re-open Incident as Pending
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
