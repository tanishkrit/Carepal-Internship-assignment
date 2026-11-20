import React, { useState } from 'react';
import { X, UserPlus, HeartHandshake, MapPin, Phone, Mail, Award, AlertCircle } from 'lucide-react';
import api from '../services/api';

const PRESET_SPECIALTIES = [
  "Dementia & Alzheimer's Care",
  "Elderly Care & Companion Support",
  "Newborn & Infant Care",
  "Post-Surgical Recovery & Wound Care",
  "Elderly Stroke Rehabilitation",
  "Palliative & Oncology Support",
  "Orthopedic & Mobility Rehabilitation",
  "Physiotherapy & Daily Living Support"
];

const PRESET_CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi NCR",
  "Pune",
  "Hyderabad",
  "Kolkata"
];

const PRESET_AVATARS = [
  { label: 'Nurse 1', url: 'https://images.unsplash.com/photo-1594824813637-296316719b9d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Nurse 2', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80' },
  { label: 'Caregiver 1', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Caregiver 2', url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80' },
  { label: 'Nurse 3', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80' }
];

export default function AddCaregiverModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState(PRESET_SPECIALTIES[0]);
  const [city, setCity] = useState(PRESET_CITIES[0]);
  const [phone, setPhone] = useState('+91 98');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState(5);
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter caregiver full name.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.addNurse({
        name: name.trim(),
        specialty,
        city,
        phone: phone.trim(),
        email: email.trim(),
        experience_years: Number(experience),
        avatar_url: selectedAvatar
      });

      if (res.success) {
        onSuccess(res.data, res.message);
        onClose();
        // Reset form
        setName('');
        setPhone('+91 98');
        setEmail('');
      }
    } catch (err) {
      setError(err.message || 'Failed to add caregiver to roster.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Add New Caregiver Member</h2>
              <p className="text-[11px] text-teal-200">Onboard trained nurses & caregivers to TheCarePal active roster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Caregiver Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sneha Kulkarni"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
            />
          </div>

          {/* Specialty & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Clinical Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
              >
                {PRESET_SPECIALTIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Hub City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
              >
                {PRESET_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 98201 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Experience (Years)</label>
              <input
                type="number"
                min={1}
                max={35}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Work Email <span className="text-slate-400 font-normal">(optional - defaults to @thecarepal.com)</span>
            </label>
            <input
              type="email"
              placeholder="e.g. sneha.k@thecarepal.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Profile Photo</label>
            <div className="flex items-center space-x-2.5">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`relative rounded-full p-0.5 transition-all ${
                    selectedAvatar === av.url ? 'ring-2 ring-teal-600 ring-offset-2 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-9 h-9 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Adding Member...' : 'Add to Active Roster'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
