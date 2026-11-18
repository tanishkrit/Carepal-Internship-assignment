import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Calendar, 
  User, 
  Send, 
  PhoneCall, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import StarRating from '../components/StarRating';
import NpsSelector from '../components/NpsSelector';
import api from '../services/api';

export default function FeedbackPortal({ token: propToken, onNavigateHome }) {
  // Extract token from prop or URL pathname /feedback/:token
  const [token, setToken] = useState(() => {
    if (propToken) return propToken;
    const pathParts = window.location.pathname.split('/');
    const fbIdx = pathParts.indexOf('feedback');
    if (fbIdx !== -1 && pathParts[fbIdx + 1]) {
      return pathParts[fbIdx + 1];
    }
    return 'demo-active-token';
  });

  const [loading, setLoading] = useState(true);
  const [tokenState, setTokenState] = useState(null); // { valid, status, data, message, error }
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [punctuality, setPunctuality] = useState(0);
  const [careQuality, setCareQuality] = useState(0);
  const [hygiene, setHygiene] = useState(0);
  const [behaviour, setBehaviour] = useState(0);
  const [npsScore, setNpsScore] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  async function verifyToken(t) {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.verifyToken(t);
      setTokenState(res);
    } catch (err) {
      if (err.data) {
        setTokenState(err.data);
      } else {
        setTokenState({
          valid: false,
          error: 'network_error',
          message: 'Unable to connect to TheCarePal server. Please check your network connection.'
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!punctuality || !careQuality || !hygiene || !behaviour) {
      setErrorMessage('Please provide a star rating for all 4 care dimensions.');
      return;
    }

    if (npsScore === null) {
      setErrorMessage('Please select how likely you are to recommend TheCarePal (0 to 10).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        token,
        punctuality,
        careQuality,
        hygiene,
        behaviour,
        npsScore,
        comment
      };

      const res = await api.submitFeedback(payload);
      if (res.success) {
        setSubmittedSuccess(true);
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 animate-bounce">
          <Heart className="w-8 h-8 text-teal-600 fill-teal-100" />
        </div>
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-700">Verifying secure feedback link...</p>
        <p className="text-xs text-slate-400 mt-1">TheCarePal Patient Care Quality</p>
      </div>
    );
  }

  // 2. Already Submitted State
  if (tokenState?.status === 'submitted') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Feedback Already Recorded</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Thank you! Feedback for this visit by <strong>{tokenState.nurseName || 'your caregiver'}</strong> has already been submitted on{' '}
            <span className="font-semibold text-slate-700">
              {tokenState.submittedAt ? new Date(tokenState.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'file'}
            </span>. Each feedback link works only once to guarantee record integrity.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 text-left mb-6 space-y-2 border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>Need further assistance or wish to update feedback?</span>
            </div>
            <p>Our Care Operations Concierge is available 24/7 at <strong className="text-teal-700">+91 800-CAREPAL</strong> or email <strong className="text-teal-700">support@thecarepal.com</strong>.</p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Open Operations Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Expired Token State
  if (tokenState?.status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Clock className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Feedback Link Expired</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            This visit feedback link expired on{' '}
            <span className="font-semibold text-slate-700">
              {tokenState.expiresAt ? new Date(tokenState.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'date'}
            </span>. For clinical accuracy and timely care quality follow-ups, feedback links remain valid for 3 to 7 days after the visit.
          </p>

          <div className="bg-amber-50 rounded-xl p-4 text-xs text-amber-900 text-left mb-6 space-y-1.5 border border-amber-200">
            <div className="font-semibold flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Have an urgent care concern?</span>
            </div>
            <p>Please contact TheCarePal Quality Helpline directly at <strong className="text-teal-800">+91 800-CAREPAL</strong>.</p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Back to Operations Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // 4. Invalid Token / 404 State
  if (!tokenState?.valid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Feedback Link</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {tokenState?.message || 'This feedback link does not match any scheduled home care visit.'} Please check the link sent via SMS/WhatsApp or reach out to our team.
          </p>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Return to Care Quality Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  // 5. Successful Submission State
  if (submittedSuccess) {
    const { nurse, visit } = tokenState.data;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Feedback Recorded
          </span>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">Thank You, {visit.familyName}!</h2>
          <p className="text-sm text-slate-600 mb-8 leading-relaxed">
            Your honest feedback regarding <strong>{nurse.name}</strong>’s visit has been recorded. It helps our clinical supervisors ensure the highest standards of safety, dignity, and warmth for <strong>{visit.patientName}</strong>.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 text-left mb-6 space-y-2 border border-slate-200">
            <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>TheCarePal 24/7 Clinical Care Team</span>
            </div>
            <p>Need urgent nursing support, medicine dispatch, or care plan modification? We are always one call away at <strong>+91 800-CAREPAL</strong>.</p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>View Care Quality Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 6. Active Feedback Form
  const { nurse, visit } = tokenState.data;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-teal-100/70 text-teal-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
            <span>TheCarePal Home Nursing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Visit Care Feedback</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Your evaluation directly shapes our caregiver training and patient safety protocols.
          </p>
        </div>

        {/* Visit Card Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={nurse.avatarUrl || 'https://images.unsplash.com/photo-1594824813637-296316719b9d?w=150'}
              alt={nurse.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-500/20 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Caregiver Evaluated</span>
              <h2 className="text-lg font-bold text-slate-900 truncate">{nurse.name}</h2>
              <p className="text-xs text-slate-500">{nurse.specialty} • {nurse.city}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient / Family</span>
              <span className="font-semibold text-slate-800 flex items-center space-x-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{visit.patientName}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Visit Date & Care</span>
              <span className="font-semibold text-slate-800 flex items-center space-x-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{visit.visitDate} ({visit.careType})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          
          {/* Section: 4 Core Rating Dimensions */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100">
              Care Quality Dimensions
            </h3>

            <div className="space-y-5">
              {/* 1. Punctuality */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div>
                  <label className="text-sm font-bold text-slate-800 block">1. Punctuality & Attendance</label>
                  <p className="text-xs text-slate-500">Did the caregiver arrive on time and adhere to shift schedule?</p>
                </div>
                <StarRating value={punctuality} onChange={setPunctuality} />
              </div>

              {/* 2. Quality of Care */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div>
                  <label className="text-sm font-bold text-slate-800 block">2. Quality of Care</label>
                  <p className="text-xs text-slate-500">Clinical competence, gentle handling, and attentiveness to needs.</p>
                </div>
                <StarRating value={careQuality} onChange={setCareQuality} />
              </div>

              {/* 3. Hygiene & Safety */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div>
                  <label className="text-sm font-bold text-slate-800 block">3. Hygiene & Cleanliness</label>
                  <p className="text-xs text-slate-500">Clean uniform, hand sanitization, and sterile dressing/tools.</p>
                </div>
                <StarRating value={hygiene} onChange={setHygiene} />
              </div>

              {/* 4. Behaviour & Compassion */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div>
                  <label className="text-sm font-bold text-slate-800 block">4. Behaviour & Compassion</label>
                  <p className="text-xs text-slate-500">Politeness, respectful language, patience, and dignity shown.</p>
                </div>
                <StarRating value={behaviour} onChange={setBehaviour} />
              </div>
            </div>
          </div>

          {/* Section: NPS Question */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-800 block mb-1">
              Net Promoter Score (NPS)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              How likely are you to recommend TheCarePal to a friend or family member who needs home healthcare?
            </p>
            <NpsSelector value={npsScore} onChange={setNpsScore} />
          </div>

          {/* Section: Qualitative Comment */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-800 block mb-1">
              Personal Comments & Observations (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Share details on what went especially well or areas where we can do better.
            </p>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., The caregiver was extraordinarily gentle when assisting with exercises, and kept us updated..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Recording Secure Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Visit Feedback</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              🔒 Single-use link: Once submitted, your answers are sealed and transmitted directly to TheCarePal Quality Operations.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
