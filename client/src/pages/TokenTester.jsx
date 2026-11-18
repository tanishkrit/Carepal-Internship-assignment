import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Copy, Check, ExternalLink, ShieldCheck, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function TokenTester({ onSelectToken }) {
  const [tokens, setTokens] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(null);

  // Generator form state
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [patientName, setPatientName] = useState('Mrs. Maya Sengupta');
  const [familyName, setFamilyName] = useState('Sengupta Family');
  const [careType, setCareType] = useState('Dementia & Alzheimer\'s Care');
  const [expiryDays, setExpiryDays] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [newlyGenerated, setNewlyGenerated] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [tokRes, nurseRes] = await Promise.all([
        api.getTokens(),
        api.getNurses()
      ]);
      if (tokRes.success) setTokens(tokRes.data);
      if (nurseRes.success && nurseRes.data.length > 0) {
        setNurses(nurseRes.data);
        setSelectedNurseId(nurseRes.data[0].id);
      }
    } catch (err) {
      console.error('Error loading token data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(tokenStr) {
    const fullUrl = `${window.location.origin}/feedback/${tokenStr}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(tokenStr);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setGenerating(true);
    setNewlyGenerated(null);

    try {
      const res = await api.generateToken({
        nurseId: selectedNurseId,
        patientName,
        familyName,
        careType,
        expiryDays: Number(expiryDays)
      });

      if (res.success) {
        setNewlyGenerated(res.data);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to generate token');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
          <KeyRound className="w-4 h-4 text-blue-300" />
          <span>Evaluation Demo Center</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Single-Use Link Generator & Token Sandbox</h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1">
          TheCarePal requires links to work exactly once (no login needed for families) and expire after a set duration. Use these test links or generate new ones to test every boundary condition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Test Scenarios */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              Standard Evaluation Scenarios
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Click any scenario to immediately load the feedback form with that token's security state.
            </p>

            <div className="space-y-3">
              {/* Scenario 1: Active Token */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>1. Active Valid Link</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Works Once
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2.5">
                  Pre-seeded active token for Rajesh Nair (Verma Family). Submit to see live dashboard update and single-use lock.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectToken('demo-active-token')}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <span>Test Form</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleCopy('demo-active-token')}
                    className="p-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-800 hover:bg-emerald-100"
                    title="Copy Link URL"
                  >
                    {copiedToken === 'demo-active-token' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Scenario 2: Expired Token */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>2. Expired Link</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Expired
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2.5">
                  Link expired on Nov 13, 2026. Tests the expiration lock and empathetic support redirection.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectToken('demo-expired-token')}
                    className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <span>Test Form</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleCopy('demo-expired-token')}
                    className="p-1.5 bg-white border border-amber-300 rounded-lg text-amber-800 hover:bg-amber-100"
                    title="Copy Link URL"
                  >
                    {copiedToken === 'demo-expired-token' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Scenario 3: Already Used Token */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-rose-900 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>3. Already-Used Link</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Submitted
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2.5">
                  Link submitted on Nov 17, 2026. Tests single-use rejection preventing duplicate surveys.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectToken('demo-used-token')}
                    className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <span>Test Form</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleCopy('demo-used-token')}
                    className="p-1.5 bg-white border border-rose-300 rounded-lg text-rose-800 hover:bg-rose-100"
                    title="Copy Link URL"
                  >
                    {copiedToken === 'demo-used-token' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Generate Custom Token & Live Token List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Link Generator Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Generate New Visit Link</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Simulates dispatching a post-visit feedback link from TheCarePal's internal CRM.
            </p>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Caregiver</label>
                <select
                  value={selectedNurseId}
                  onChange={(e) => setSelectedNurseId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {nurses.map(nurse => (
                    <option key={nurse.id} value={nurse.id}>
                      {nurse.name} ({nurse.specialty} • {nurse.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Link Expiration Window</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={1}>Expires in 24 Hours</option>
                  <option value={3}>Expires in 3 Days (Standard)</option>
                  <option value={7}>Expires in 7 Days</option>
                  <option value={14}>Expires in 14 Days</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Family / Contact Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{generating ? 'Generating Unique Token...' : 'Generate Single-Use Link'}</span>
                </button>
              </div>
            </form>

            {/* Newly Generated Banner */}
            {newlyGenerated && (
              <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs animate-fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-teal-900">✓ New Link Created!</span>
                  <span className="text-[10px] text-teal-700">Expires: {new Date(newlyGenerated.expiresAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${newlyGenerated.feedbackUrl}`}
                    className="flex-1 p-1.5 text-xs bg-white rounded border border-teal-300 font-mono"
                  />
                  <button
                    onClick={() => handleCopy(newlyGenerated.token)}
                    className="p-1.5 bg-teal-600 text-white rounded hover:bg-teal-700"
                  >
                    {copiedToken === newlyGenerated.token ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onSelectToken(newlyGenerated.token)}
                    className="px-2.5 py-1.5 bg-teal-800 text-white rounded font-bold hover:bg-teal-900"
                  >
                    Open Form
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Tokens Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Feedback Tokens in Database ({tokens.length})
              </h3>
              <button
                onClick={loadData}
                className="text-slate-500 hover:text-slate-800 p-1"
                title="Refresh token list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2">Token</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Caregiver</th>
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Expires</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tokens.slice(0, 10).map((tok) => (
                    <tr key={tok.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-[11px] text-slate-800">{tok.token}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tok.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          tok.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {tok.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-700 font-medium">{tok.nurse_name}</td>
                      <td className="py-2.5 text-slate-500">{tok.patient_name}</td>
                      <td className="py-2.5 text-slate-400">{new Date(tok.expires_at).toLocaleDateString()}</td>
                      <td className="py-2.5 text-right space-x-1">
                        <button
                          onClick={() => onSelectToken(tok.token)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[10px]"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
