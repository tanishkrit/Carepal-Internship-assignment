import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Star, 
  TrendingUp, 
  Smile, 
  Meh, 
  Frown, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Download, 
  UserCheck, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  Award,
  ChevronRight,
  Activity,
  HeartHandshake
} from 'lucide-react';
import StarRating from '../components/StarRating';
import CaregiverModal from '../components/CaregiverModal';
import api from '../services/api';

export default function AdminDashboard({ onNavigateTriage, onOpenDigest }) {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Toggles
  const [activeTrendDimension, setActiveTrendDimension] = useState('avgRating');
  const [hideProfanity, setHideProfanity] = useState(true); // Content filter must-have
  const [nurseSearch, setNurseSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all'); // all | positive | neutral | negative
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [dossierNurseId, setDossierNurseId] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedNurseId, sentimentFilter]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [metRes, trRes, nurRes, fbRes] = await Promise.all([
        api.getMetrics(),
        api.getTrends(),
        api.getNurses(),
        api.getFeedbacks({
          nurseId: selectedNurseId || undefined,
          sentiment: sentimentFilter === 'all' ? undefined : sentimentFilter
        })
      ]);

      if (metRes.success) setMetrics(metRes.data);
      if (trRes.success) setTrends(trRes.data);
      if (nurRes.success) setNurses(nurRes.data);
      if (fbRes.success) setFeedbacks(fbRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredNurses = nurses.filter(n => {
    const matchesSearch =
      n.name.toLowerCase().includes(nurseSearch.toLowerCase()) ||
      n.specialty.toLowerCase().includes(nurseSearch.toLowerCase()) ||
      n.city.toLowerCase().includes(nurseSearch.toLowerCase());
    const matchesCity = selectedCity === 'all' || n.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const dimensionLabels = {
    avgRating: 'Overall Rating',
    avgPunctuality: 'Punctuality',
    avgQuality: 'Quality of Care',
    avgHygiene: 'Hygiene & Cleanliness',
    avgBehaviour: 'Behaviour & Compassion'
  };

  if (loading && !metrics) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 animate-pulse">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-xs font-semibold text-slate-600">Compiling care analytics and caregiver trends...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      
      {/* 1. Header Overview & Control Strip */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              National Care Quality Audit
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">8 Caregivers Deployed • 4 Hubs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Clinical Quality & Family Feedback Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time patient safety metrics, caregiver performance leaderboards, and early issue detection.
          </p>
        </div>

        {/* Global Filter & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Must-Have: Hide Abusive Language Filter Toggle */}
          <button
            onClick={() => setHideProfanity(!hideProfanity)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
              hideProfanity
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/70'
            }`}
            title="Toggle profanity masking on family comments"
          >
            {hideProfanity ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
            <span>{hideProfanity ? 'Content Filter: Masked' : 'Content Filter: Raw'}</span>
          </button>

          <button
            onClick={onOpenDigest}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Weekly Summary</span>
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Overall Care Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Care Quality Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics?.overallRating || '0.0'}</span>
              <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500">
              <StarRating value={metrics?.overallRating || 0} readOnly size="sm" showLabel={false} />
              <span className="font-medium text-slate-400">({metrics?.totalFeedbacks || 0} visits verified)</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Promoter Score (NPS) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Promoter Score</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-teal-800">
                {metrics?.nps > 0 ? `+${metrics.nps}` : metrics?.nps || '0'}
              </span>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {metrics?.nps >= 50 ? 'World Class' : metrics?.nps >= 30 ? 'Strong' : 'Moderate'}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${metrics?.totalFeedbacks ? (metrics.promoterCount / metrics.totalFeedbacks) * 100 : 0}%` }}
                  className="bg-emerald-500"
                  title={`Promoters: ${metrics?.promoterCount}`}
                />
                <div
                  style={{ width: `${metrics?.totalFeedbacks ? (metrics.passiveCount / metrics.totalFeedbacks) * 100 : 0}%` }}
                  className="bg-amber-400"
                  title={`Passives: ${metrics?.passiveCount}`}
                />
                <div
                  style={{ width: `${metrics?.totalFeedbacks ? (metrics.detractorCount / metrics.totalFeedbacks) * 100 : 0}%` }}
                  className="bg-rose-500"
                  title={`Detractors: ${metrics?.detractorCount}`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                <span className="text-emerald-700">Promoters: {metrics?.promoterCount}</span>
                <span className="text-amber-700">Passives: {metrics?.passiveCount}</span>
                <span className="text-rose-700">Detractors: {metrics?.detractorCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Dimension Averages Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category Breakdown</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Punctuality</span>
              <strong className="text-slate-800 font-bold text-xs">{metrics?.punctualityAvg || '0.0'} ★</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Care Quality</span>
              <strong className="text-slate-800 font-bold text-xs">{metrics?.qualityAvg || '0.0'} ★</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Hygiene</span>
              <strong className="text-slate-800 font-bold text-xs">{metrics?.hygieneAvg || '0.0'} ★</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-medium">Behaviour</span>
              <strong className="text-slate-800 font-bold text-xs">{metrics?.behaviourAvg || '0.0'} ★</strong>
            </div>
          </div>
        </div>

        {/* KPI 4: Low-Score Escalations Action Card */}
        <div 
          onClick={onNavigateTriage}
          className="bg-gradient-to-br from-rose-50 via-white to-rose-50/50 rounded-2xl p-5 border border-rose-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Priority Triage Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-rose-900">{metrics?.lowScoreAlertsCount || 0}</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                Action Required
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ratings &le; 3.0 flagged for immediate family outreach</p>
            <div className="flex items-center justify-between text-xs text-rose-800 font-bold mt-2 pt-2 border-t border-rose-100 group-hover:text-rose-900">
              <span>Open Triage Queue</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Longitudinal Care Trend (Recharts) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900">Longitudinal Quality Trend Over Time</h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Daily Granularity
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracking day-by-day care trajectories to identify systematic quality shifts
            </p>
          </div>

          {/* Dimension Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {Object.entries(dimensionLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTrendDimension(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTrendDimension === key
                    ? 'bg-white text-teal-800 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-64 sm:h-72 w-full">
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="careGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                  }}
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0c1427] text-white px-3.5 py-2.5 rounded-xl text-xs shadow-2xl border border-slate-700">
                          <p className="font-semibold text-slate-400">{label}</p>
                          <p className="text-teal-400 font-extrabold text-sm mt-0.5">
                            {dimensionLabels[activeTrendDimension]}: {payload[0].value} ★
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">Evaluated Visits: {payload[0].payload.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeTrendDimension}
                  stroke="#0d9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#careGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No trend records available yet.
            </div>
          )}
        </div>
      </div>

      {/* 4. Caregiver Leaderboard & Scorecards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900">Caregiver Performance Scorecard</h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                {nurses.length} Nurses
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any caregiver row to filter customer reviews below
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="all">All Hub Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Kolkata">Kolkata</option>
            </select>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search nurse, specialty..."
                value={nurseSearch}
                onChange={(e) => setNurseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3 pl-3">Caregiver</th>
                <th className="pb-3">Clinical Specialty</th>
                <th className="pb-3">Hub City</th>
                <th className="pb-3 text-center">Visits</th>
                <th className="pb-3">Average Score</th>
                <th className="pb-3">Punctuality</th>
                <th className="pb-3">Quality</th>
                <th className="pb-3">Hygiene</th>
                <th className="pb-3">Behaviour</th>
                <th className="pb-3 text-center">Sentiment</th>
                <th className="pb-3 text-right pr-3">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNurses.map((nurse, i) => {
                const isSelected = selectedNurseId === nurse.id;
                return (
                  <tr 
                    key={nurse.id} 
                    className={`hover:bg-teal-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50/80 font-medium' : ''
                    }`}
                    onClick={() => setSelectedNurseId(isSelected ? '' : nurse.id)}
                  >
                    <td className="py-3.5 pl-3 flex items-center space-x-3">
                      <img
                        src={nurse.avatar_url || 'https://images.unsplash.com/photo-1594824813637-296316719b9d?w=150'}
                        alt={nurse.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{nurse.name}</span>
                          {i === 0 && (
                            <span className="p-0.5 rounded bg-amber-100 text-amber-800" title="Top Rated Caregiver">
                              <Award className="w-3 h-3 text-amber-600" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{nurse.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-700 font-medium">{nurse.specialty}</td>
                    <td className="py-3.5 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {nurse.city}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{nurse.reviewCount || 0}</td>

                    <td className="py-3.5">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-extrabold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                        <span>{nurse.avgRating || '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-600 font-semibold">{nurse.avgPunctuality ? `${nurse.avgPunctuality}★` : '—'}</td>
                    <td className="py-3.5 text-slate-600 font-semibold">{nurse.avgQuality ? `${nurse.avgQuality}★` : '—'}</td>
                    <td className="py-3.5 text-slate-600 font-semibold">{nurse.avgHygiene ? `${nurse.avgHygiene}★` : '—'}</td>
                    <td className="py-3.5 text-slate-600 font-semibold">{nurse.avgBehaviour ? `${nurse.avgBehaviour}★` : '—'}</td>

                    <td className="py-3.5 text-center">
                      <div className="inline-flex items-center space-x-2 text-[11px] font-semibold bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                        <span className="text-emerald-700 flex items-center" title="Positive ratings">
                          <Smile className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                          {nurse.positiveCount || 0}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-rose-700 flex items-center" title="Negative ratings">
                          <Frown className="w-3.5 h-3.5 mr-0.5 text-rose-600" />
                          {nurse.negativeCount || 0}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 text-right pr-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDossierNurseId(nurse.id);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 hover:text-teal-900 border border-teal-200 rounded-lg font-bold text-[11px] shadow-2xs transition-all hover:scale-102"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Customer Feedback Stream */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900">Live Customer Feedback Stream</h3>
              {selectedNurseId && (
                <button
                  onClick={() => setSelectedNurseId('')}
                  className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 hover:bg-teal-100"
                >
                  Clear Filter ✕
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Displaying {feedbacks.length} feedback submissions {selectedNurseId ? 'for selected caregiver' : 'across all home visits'}
            </p>
          </div>

          {/* Sentiment Filter Badges (Good-to-Have Requirement) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'positive', label: 'Positive', icon: Smile, color: 'text-emerald-700' },
              { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-600' },
              { id: 'negative', label: 'Negative', icon: Frown, color: 'text-rose-700' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSentimentFilter(tab.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sentimentFilter === tab.id
                    ? 'bg-white text-teal-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon && <tab.icon className={`w-3.5 h-3.5 ${tab.color}`} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.slice(0, 10).map((fb) => {
            const commentToShow = hideProfanity ? fb.sanitized_comment : fb.raw_comment;
            
            return (
              <div 
                key={fb.id}
                className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between space-y-3 hover:bg-white hover:shadow-sm hover:border-slate-300 transition-all"
              >
                {/* Header: Nurse, Patient & Score */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{fb.nurse_name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Patient: <strong>{fb.patient_name}</strong> ({fb.care_type})
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1 font-extrabold text-slate-900 text-sm bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-amber-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{fb.average_rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Ratings Breakdown Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px] text-slate-600 font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">Punctuality: {fb.punctuality}★</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">Quality: {fb.care_quality}★</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">Hygiene: {fb.hygiene}★</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">Behaviour: {fb.behaviour}★</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">NPS: {fb.nps_score}/10</span>
                  </div>

                  {/* Family Comment Text */}
                  <div className="mt-3 text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs leading-relaxed">
                    "{commentToShow || 'No comment provided'}"
                  </div>
                </div>

                {/* Footer: Sentiment Tag & Profanity Flag */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 text-[10px]">
                  <div className="flex items-center space-x-2">
                    {/* Sentiment Tag */}
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      fb.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' :
                      fb.sentiment === 'negative' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {fb.sentiment === 'positive' && <Smile className="w-3 h-3 text-emerald-600" />}
                      {fb.sentiment === 'negative' && <Frown className="w-3 h-3 text-rose-600" />}
                      {fb.sentiment === 'neutral' && <Meh className="w-3 h-3 text-slate-500" />}
                      <span>{fb.sentiment}</span>
                    </span>

                    {fb.has_profanity === 1 && (
                      <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {hideProfanity ? 'Abusive Filtered' : 'Contains Flagged Words'}
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400 font-mono">#{fb.id.slice(0, 8)}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Caregiver Dossier Drill-down Modal */}
      <CaregiverModal
        nurseId={dossierNurseId}
        onClose={() => setDossierNurseId(null)}
      />

    </div>
  );
}
