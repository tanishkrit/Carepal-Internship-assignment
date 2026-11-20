import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Smile, 
  Frown, 
  Calendar, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp,
  Sparkles,
  Trash2,
  Share2
} from 'lucide-react';
import StarRating from './StarRating';
import api from '../services/api';

export default function CaregiverModal({ nurseId, onClose, onDelete, onOpenShareModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    if (nurseId) {
      loadDossier(nurseId);
    }
  }, [nurseId]);

  async function loadDossier(id) {
    setLoading(true);
    try {
      const res = await api.getNurseDossier(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching nurse dossier:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAction(type) {
    if (type === 'commendation') {
      setActionNotice('🌟 Formal Care Commendation logged and sent to caregiver profile.');
    } else {
      setActionNotice('📋 Clinical Quality Audit request dispatched to Operations Supervisor.');
    }
    setTimeout(() => setActionNotice(''), 4000);
  }

  if (!nurseId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-40 h-5 bg-white/10 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          ) : data ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
              <div className="flex items-center space-x-4">
                <img
                  src={data.avatar_url || 'https://images.unsplash.com/photo-1594824813637-296316719b9d?w=150'}
                  alt={data.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-extrabold text-white">{data.name}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                      {data.experience_years} Years Exp
                    </span>
                  </div>
                  <p className="text-xs text-teal-200 mt-0.5">{data.specialty}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-300 mt-2">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{data.city} Hub</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <span>{data.phone}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Score Badge */}
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0 self-start sm:self-auto">
                <div className="flex items-center justify-center space-x-1 text-2xl font-black text-amber-300">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
                  <span>{data.stats?.avgRating || '—'}</span>
                </div>
                <div className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mt-0.5">
                  {data.stats?.reviewCount || 0} Visits Rated
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500">Loading caregiver evaluation dossier...</p>
            </div>
          ) : data ? (
            <>
              {/* Action Banner if triggered */}
              {actionNotice && (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold animate-fade-in flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Dimension Metrics Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3.5 flex items-center justify-between">
                  <span>Care Quality Dimension Averages</span>
                  <span className="text-[10px] text-slate-400 font-normal">Benchmark standard: 4.0 ★</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Punctuality</span>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">{data.stats?.avgPunctuality || '0.0'} ★</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-teal-500 h-full rounded-full" 
                        style={{ width: `${((data.stats?.avgPunctuality || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Care Quality</span>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">{data.stats?.avgQuality || '0.0'} ★</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-teal-500 h-full rounded-full" 
                        style={{ width: `${((data.stats?.avgQuality || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Hygiene</span>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">{data.stats?.avgHygiene || '0.0'} ★</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-teal-500 h-full rounded-full" 
                        style={{ width: `${((data.stats?.avgHygiene || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Behaviour</span>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">{data.stats?.avgBehaviour || '0.0'} ★</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-teal-500 h-full rounded-full" 
                        style={{ width: `${((data.stats?.avgBehaviour || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Stream for this nurse */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                  <span>Visit Evaluations Received ({data.reviews?.length || 0})</span>
                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                    <span className="text-emerald-700 flex items-center">
                      <Smile className="w-3.5 h-3.5 mr-0.5" />
                      {data.stats?.positiveCount || 0} Positive
                    </span>
                    <span>•</span>
                    <span className="text-rose-700 flex items-center">
                      <Frown className="w-3.5 h-3.5 mr-0.5" />
                      {data.stats?.negativeCount || 0} Negative
                    </span>
                  </div>
                </h3>

                <div className="space-y-3">
                  {data.reviews?.length > 0 ? (
                    data.reviews.map((rev) => (
                      <div key={rev.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between text-xs">
                          <div>
                            <span className="font-extrabold text-slate-900">{rev.patient_name}</span>
                            <span className="text-slate-400 font-normal"> ({rev.family_name}) • {rev.care_type}</span>
                          </div>
                          <div className="flex items-center space-x-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{rev.average_rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{rev.sanitized_comment || 'No comment provided'}"
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <div className="flex items-center space-x-2">
                            <span>P: {rev.punctuality}★</span>
                            <span>•</span>
                            <span>Q: {rev.care_quality}★</span>
                            <span>•</span>
                            <span>H: {rev.hygiene}★</span>
                            <span>•</span>
                            <span>B: {rev.behaviour}★</span>
                            <span>•</span>
                            <span>NPS: {rev.nps_score}/10</span>
                          </div>
                          <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                      No customer reviews recorded yet for this caregiver.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenShareModal && data && (
              <button
                onClick={() => {
                  onOpenShareModal(data.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs"
                title={`Generate feedback link for ${data.name}`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Feedback Form</span>
              </button>
            )}
            <button
              onClick={() => handleAction('commendation')}
              className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Issue Commendation</span>
            </button>
            <button
              onClick={() => handleAction('audit')}
              className="px-3.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Supervisor Audit</span>
            </button>
            {onDelete && data && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove caregiver "${data.name}" from the active roster?`)) {
                    onDelete(data.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-xl transition-colors flex items-center space-x-1"
                title="Remove caregiver member from active roster"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}
