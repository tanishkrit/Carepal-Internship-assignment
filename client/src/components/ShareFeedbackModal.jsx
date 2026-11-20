import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Clock, 
  User, 
  Calendar, 
  ShieldCheck, 
  MessageCircle, 
  Mail,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

export default function ShareFeedbackModal({ 
  isOpen, 
  onClose, 
  initialNurseId = null,
  onOpenFormDirectly
}) {
  const [nurses, setNurses] = useState([]);
  const [loadingNurses, setLoadingNurses] = useState(true);
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [patientName, setPatientName] = useState('Mrs. Maya Kapoor');
  const [familyName, setFamilyName] = useState('Kapoor Family');
  const [expiryDays, setExpiryDays] = useState(3);
  
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNurses();
      setGeneratedResult(null);
      setCopied(false);
    }
  }, [isOpen]);

  async function loadNurses() {
    setLoadingNurses(true);
    try {
      const res = await api.getNurses();
      if (res.success && res.data.length > 0) {
        setNurses(res.data);
        if (initialNurseId && res.data.some(n => n.id === initialNurseId)) {
          setSelectedNurseId(initialNurseId);
        } else {
          setSelectedNurseId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading caregivers:', err);
    } finally {
      setLoadingNurses(false);
    }
  }

  async function handleGenerate(e) {
    if (e) e.preventDefault();
    if (!selectedNurseId) return;

    setGenerating(true);
    try {
      const selectedNurse = nurses.find(n => n.id === selectedNurseId);
      const res = await api.generateToken({
        nurseId: selectedNurseId,
        patientName: patientName.trim() || 'Patient',
        familyName: familyName.trim() || 'Family',
        careType: selectedNurse?.specialty || 'General Care',
        expiryDays: Number(expiryDays)
      });

      if (res.success) {
        const fullUrl = `${window.location.origin}${res.data.feedbackUrl}`;
        setGeneratedResult({
          ...res.data,
          fullUrl,
          nurse: selectedNurse || res.data.nurse
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to generate feedback link');
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleWhatsAppShare() {
    if (!generatedResult) return;
    const text = encodeURIComponent(
      `Dear ${familyName}, please take a moment to evaluate your home care visit with ${generatedResult.nurse.name} on TheCarePal:\n\n${generatedResult.fullUrl}\n\nThis unique link works once and expires in ${expiryDays} days. Thank you!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  function handleEmailShare() {
    if (!generatedResult) return;
    const subject = encodeURIComponent(`TheCarePal Visit Feedback: ${generatedResult.nurse.name}`);
    const body = encodeURIComponent(
      `Dear ${familyName},\n\nWe hope your visit with ${generatedResult.nurse.name} went well. To help our clinical team ensure the highest quality of care, please complete your feedback using this link:\n\n${generatedResult.fullUrl}\n\nNote: This link works once and remains active for ${expiryDays} days.\n\nWarm regards,\nTheCarePal Operations Team`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }

  if (!isOpen) return null;

  const currentNurse = nurses.find(n => n.id === selectedNurseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Share Visit Feedback Link</h2>
              <p className="text-[11px] text-teal-200">Generate a unique single-use feedback link for any caregiver or doctor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {!generatedResult ? (
            /* Step 1: Configuration Form */
            <form onSubmit={handleGenerate} className="space-y-4">
              
              {/* Caregiver Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                  <span>1. Select Caregiver / Doctor <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Choose who was on duty</span>
                </label>

                {loadingNurses ? (
                  <div className="h-10 bg-slate-100 animate-pulse rounded-xl"></div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedNurseId}
                      onChange={(e) => setSelectedNurseId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-semibold text-slate-800"
                    >
                      {nurses.map(nurse => (
                        <option key={nurse.id} value={nurse.id}>
                          {nurse.name} — {nurse.specialty} ({nurse.city})
                        </option>
                      ))}
                    </select>

                    {/* Caregiver Card Preview */}
                    {currentNurse && (
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-teal-50/70 border border-teal-200/80">
                        <img
                          src={currentNurse.avatar_url || 'https://images.unsplash.com/photo-1594824813637-296316719b9d?w=150'}
                          alt={currentNurse.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-slate-900">{currentNurse.name}</div>
                          <div className="text-[11px] text-teal-700">{currentNurse.specialty} • {currentNurse.city}</div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Patient & Family Details */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block mb-2">2. Patient & Care Recipient Context</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block mb-1">Patient Full Name</span>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Mrs. Sarla Kapoor"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Family / Contact Group</span>
                    <input
                      type="text"
                      required
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="e.g. Kapoor Family"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Expiration Window */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                  <span>3. Link Expiration Window</span>
                  <span className="text-[10px] text-slate-400 font-normal">Link works 1 time only</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 1, label: '24 Hours' },
                    { days: 3, label: '3 Days (Std)' },
                    { days: 7, label: '7 Days' },
                    { days: 14, label: '14 Days' }
                  ].map(item => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => setExpiryDays(item.days)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                        expiryDays === item.days
                          ? 'bg-teal-50 text-teal-800 border-teal-500 ring-2 ring-teal-500/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={generating || !selectedNurseId}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{generating ? 'Generating Unique Token...' : `Create Link for ${currentNurse?.name || 'Caregiver'}`}</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  🔒 Single-use guarantee: the link will automatically seal upon family submission.
                </p>
              </div>

            </form>
          ) : (
            /* Step 2: Generated Result & Multi-channel Sharing */
            <div className="space-y-5 animate-fade-in">
              
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm text-emerald-950">
                  Unique Feedback Link Ready!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Caregiver: <strong>{generatedResult.nurse.name}</strong> • Patient: <strong>{patientName}</strong>
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-2">
                  Expires in {expiryDays} Days • Works Once
                </span>
              </div>

              {/* Link Box */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Single-Use Link URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedResult.fullUrl}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 shrink-0 shadow-xs"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Instant Share Channels */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block mb-2">Quick Share Channels</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send via WhatsApp</span>
                  </button>

                  <button
                    onClick={handleEmailShare}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send via Email</span>
                  </button>
                </div>
              </div>

              {/* Actions: Open in Form or Generate Another */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenFormDirectly) {
                      onOpenFormDirectly(generatedResult.token);
                      onClose();
                    } else {
                      window.open(generatedResult.fullUrl, '_blank');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>Open Form Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="w-full sm:w-auto px-3.5 py-2 text-teal-700 hover:text-teal-900 font-bold transition-colors"
                >
                  Generate Another Link ↻
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
