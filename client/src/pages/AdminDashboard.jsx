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
  ArrowUpRight
} from 'lucide-react';
import StarRating from '../components/StarRating';
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
  const [sentimentFilter, setSentimentFilter] = useState('all'); // all | positive | neutral | negative
  const [selectedNurseId, setSelectedNurseId] = useState('');

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

  const filteredNurses = nurses.filter(n =>
    n.name.toLowerCase().includes(nurseSearch.toLowerCase()) ||
    n.specialty.toLowerCase().includes(nurseSearch.toLowerCase()) ||
    n.city.toLowerCase().includes(nurseSearch.toLowerCase())
  );

  const dimensionLabels = {
    avgRating: 'Overall Rating',
    avgPunctuality: 'Punctuality',
    avgQuality: 'Quality of Care',
    avgHygiene: 'Hygiene & Cleanliness',
    avgBehaviour: 'Behaviour & Compassion'
  };

  if (loading && !metrics) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-700">Loading Care Quality Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Care Quality & Visit Feedback</h1>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Quality Stream</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time sentiment, caregiver scorecards, longitudinal trends, and early problem detection across India.
          </p>
        </div>

        {/* Global Controls & Profanity Toggle */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Must-Have: Hide Abusive Language Filter Toggle */}
          <button
            onClick={() => setHideProfanity(!hideProfanity)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              hideProfanity
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
            title="Toggle profanity masking on comments"
          >
            {hideProfanity ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5 text-amber-600" />}
            <span>{hideProfanity ? 'Abusive Filter: ON (Masked)' : 'Abusive Filter: OFF (Raw)'}</span>
          </button>

          <a
            href={api.getExportCsvUrl()}
            download
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* 1. KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Overall Care Rating */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Overall Care Score</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {metrics?.overallRating || '0.0'} <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
              <StarRating value={metrics?.overallRating || 0} readOnly size="sm" showLabel={false} />
              <span>Across {metrics?.totalFeedbacks || 0} visits</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Promoter Score (NPS) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Net Promoter Score</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-teal-800">
              {metrics?.nps > 0 ? `+${metrics.nps}` : metrics?.nps || '0'}
            </div>
            {/* NPS Mini Stack Bar */}
            <div className="mt-2 space-y-1">
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
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span className="text-emerald-700">Promoters: {metrics?.promoterCount}</span>
                <span className="text-amber-700">Passives: {metrics?.passiveCount}</span>
                <span className="text-rose-700">Detractors: {metrics?.detractorCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Dimension Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Category Averages</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Punctuality</span>
              <strong className="text-slate-800 font-bold">{metrics?.punctualityAvg || '0.0'} ★</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Care Quality</span>
              <strong className="text-slate-800 font-bold">{metrics?.qualityAvg || '0.0'} ★</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Hygiene</span>
              <strong className="text-slate-800 font-bold">{metrics?.hygieneAvg || '0.0'} ★</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Behaviour</span>
              <strong className="text-slate-800 font-bold">{metrics?.behaviourAvg || '0.0'} ★</strong>
            </div>
          </div>
        </div>

        {/* KPI 4: Priority Action Items */}
        <div 
          onClick={onNavigateTriage}
          className="bg-gradient-to-br from-rose-50 to-rose-100/60 rounded-2xl p-5 border border-rose-200 shadow-xs flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-rose-800 tracking-wider">Priority Incident Alerts</span>
            <div className="p-2 rounded-xl bg-rose-200 text-rose-700 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-rose-900">{metrics?.lowScoreAlertsCount || 0}</span>
              <span className="text-xs font-bold text-rose-700">Open Incidents</span>
            </div>
            <div className="flex items-center justify-between text-xs text-rose-800 font-semibold mt-2 pt-2 border-t border-rose-200">
              <span>Go to Triage Queue</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* 2. Longitudinal Trend Over Time (Recharts) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Care Quality Trend Over Time</h2>
            <p className="text-xs text-slate-500">Tracking longitudinal feedback shifts across care visits (Recharts Area visualization)</p>
          </div>

          {/* Dimension Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {Object.entries(dimensionLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTrendDimension(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTrendDimension === key
                    ? 'bg-white text-teal-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 sm:h-72 w-full">
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="careGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
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
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl">
                          <p className="font-semibold text-slate-300">{label}</p>
                          <p className="text-teal-400 font-bold mt-0.5">
                            {dimensionLabels[activeTrendDimension]}: {payload[0].value} ★
                          </p>
                          <p className="text-[10px] text-slate-400">Visits logged: {payload[0].payload.count}</p>
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
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#careGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No trend data available yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. Nurse Performance Scorecard & Leaderboard */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Caregiver Performance Scorecard</h2>
            <p className="text-xs text-slate-500">Aggregated rating, category breakdown, and sentiment ratio per nurse</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by nurse, specialty, city..."
              value={nurseSearch}
              onChange={(e) => setNurseSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3">Caregiver</th>
                <th className="pb-3">Specialty & City</th>
                <th className="pb-3 text-center">Reviews</th>
                <th className="pb-3">Overall Rating</th>
                <th className="pb-3">Punctuality</th>
                <th className="pb-3">Quality</th>
                <th className="pb-3">Hygiene</th>
                <th className="pb-3">Behaviour</th>
                <th className="pb-3 text-right">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNurses.map((nurse) => (
                <tr 
                  key={nurse.id} 
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedNurseId === nurse.id ? 'bg-teal-50/60' : ''
                  }`}
                  onClick={() => setSelectedNurseId(selectedNurseId === nurse.id ? '' : nurse.id)}
                >
                  <td className="py-3 flex items-center space-x-2.5">
                    <img
                      src={nurse.avatar_url || 'https://images.unsplash.com/photo-1594824813637-296316719b9d?w=150'}
                      alt={nurse.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{nurse.name}</span>
                      <span className="text-[10px] text-slate-400">{nurse.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600">
                    <div>{nurse.specialty}</div>
                    <span className="text-[10px] text-slate-400 font-medium">{nurse.city}</span>
                  </td>
                  <td className="py-3 text-center font-semibold text-slate-700">
                    {nurse.reviewCount || 0}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-1.5 font-extrabold text-teal-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                      <span>{nurse.avgRating || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600">{nurse.avgPunctuality ? `${nurse.avgPunctuality}★` : '—'}</td>
                  <td className="py-3 text-slate-600">{nurse.avgQuality ? `${nurse.avgQuality}★` : '—'}</td>
                  <td className="py-3 text-slate-600">{nurse.avgHygiene ? `${nurse.avgHygiene}★` : '—'}</td>
                  <td className="py-3 text-slate-600">{nurse.avgBehaviour ? `${nurse.avgBehaviour}★` : '—'}</td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold">
                      <span className="text-emerald-700 flex items-center">
                        <Smile className="w-3.5 h-3.5 mr-0.5" />
                        {nurse.positiveCount || 0}
                      </span>
                      <span className="text-slate-300">/</span>
                      <span className="text-rose-700 flex items-center">
                        <Frown className="w-3.5 h-3.5 mr-0.5" />
                        {nurse.negativeCount || 0}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Live Feedback Stream & Qualitative Insights */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Recent Visit Feedback Stream</h2>
            <p className="text-xs text-slate-500">
              Displaying {feedbacks.length} feedback submissions {selectedNurseId ? 'for selected caregiver' : 'across all visits'}
            </p>
          </div>

          {/* Sentiment Filter Badges (Good-to-Have Requirement) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Sentiment:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'positive', label: 'Positive', icon: Smile, color: 'text-emerald-700' },
              { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-600' },
              { id: 'negative', label: 'Negative', icon: Frown, color: 'text-rose-700' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSentimentFilter(tab.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  sentimentFilter === tab.id
                    ? 'bg-teal-100 text-teal-900 font-bold border border-teal-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.icon && <tab.icon className={`w-3.5 h-3.5 ${tab.color}`} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.slice(0, 10).map((fb) => {
            const commentToShow = hideProfanity ? fb.sanitized_comment : fb.raw_comment;
            
            return (
              <div 
                key={fb.id}
                className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3 hover:bg-slate-50 transition-colors"
              >
                {/* Top Row: Nurse, Patient & Score */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{fb.nurse_name}</div>
                      <div className="text-[11px] text-slate-500">
                        Patient: <strong>{fb.patient_name}</strong> ({fb.care_type})
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1 font-bold text-slate-800 text-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{fb.average_rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Ratings Breakdown Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-slate-600 font-medium">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Punctuality: {fb.punctuality}★</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Quality: {fb.care_quality}★</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Hygiene: {fb.hygiene}★</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Behaviour: {fb.behaviour}★</span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">NPS: {fb.nps_score}/10</span>
                  </div>

                  {/* Family Comment Text */}
                  <div className="mt-3 text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-100">
                    "{commentToShow || 'No comment provided'}"
                  </div>
                </div>

                {/* Bottom Row: Sentiment Badge & Profanity Flag */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px]">
                  <div className="flex items-center space-x-2">
                    {/* Sentiment Tag */}
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
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
                      <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        {hideProfanity ? 'Abusive Filtered' : 'Contains Flagged Words'}
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400">ID: {fb.id.slice(0, 8)}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
