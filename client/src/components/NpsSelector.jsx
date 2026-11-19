import React, { useState } from 'react';

const NPS_PALETTE = [
  { num: 0, bg: '#ef4444', text: '#ffffff', label: 'Severe Detractor', tier: 'detractor' },
  { num: 1, bg: '#f43f5e', text: '#ffffff', label: 'Strong Detractor', tier: 'detractor' },
  { num: 2, bg: '#f95738', text: '#ffffff', label: 'Detractor', tier: 'detractor' },
  { num: 3, bg: '#f97316', text: '#ffffff', label: 'Detractor', tier: 'detractor' },
  { num: 4, bg: '#fb923c', text: '#0f172a', label: 'Mild Detractor', tier: 'detractor' },
  { num: 5, bg: '#f59e0b', text: '#0f172a', label: 'Neutral-Low', tier: 'detractor' },
  { num: 6, bg: '#fbb515', text: '#0f172a', label: 'Neutral', tier: 'detractor' },
  { num: 7, bg: '#eab308', text: '#0f172a', label: 'Passive (Satisfied)', tier: 'passive' },
  { num: 8, bg: '#84cc16', text: '#0f172a', label: 'Satisfied Passive', tier: 'passive' },
  { num: 9, bg: '#22c55e', text: '#ffffff', label: 'Promoter', tier: 'promoter' },
  { num: 10, bg: '#059669', text: '#ffffff', label: 'Loyal Advocate', tier: 'promoter' },
];

export default function NpsSelector({ value = null, onChange }) {
  const [hoveredNum, setHoveredNum] = useState(null);

  // Active comparison number: hover takes temporary precedence over selected
  const activeScore = hoveredNum !== null ? hoveredNum : value;

  const currentSelection = value !== null ? NPS_PALETTE[value] : null;

  return (
    <div className="w-full">
      
      {/* Dynamic Feedback Feedback Badge above buttons */}
      <div className="h-7 mb-2 flex items-center justify-between">
        {activeScore !== null ? (
          <div className="inline-flex items-center space-x-2 text-xs font-bold animate-fade-in">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs transition-colors"
              style={{
                backgroundColor: NPS_PALETTE[activeScore].bg,
                color: NPS_PALETTE[activeScore].text
              }}
            >
              Score: {activeScore} / 10
            </span>
            <span className="text-slate-600 font-medium">
              {NPS_PALETTE[activeScore].label}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium italic">
            Select a score from 0 (unlikely) to 10 (extremely likely)
          </span>
        )}

        {value !== null && (
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {value >= 9 ? '★ Promoter' : value >= 7 ? '• Passive' : '⚠ Detractor'}
          </span>
        )}
      </div>

      {/* 0 to 10 Progressive Meter Buttons */}
      <div 
        className="grid grid-cols-11 gap-1 sm:gap-1.5 mb-2.5"
        onMouseLeave={() => setHoveredNum(null)}
      >
        {NPS_PALETTE.map((item) => {
          const num = item.num;
          const isFilled = activeScore !== null && num <= activeScore;
          const isTarget = activeScore === num;
          const isConfirmed = value === num;

          return (
            <button
              type="button"
              key={num}
              onClick={() => onChange(num)}
              onMouseEnter={() => setHoveredNum(num)}
              style={
                isFilled
                  ? {
                      backgroundColor: item.bg,
                      color: item.text,
                      borderColor: item.bg,
                    }
                  : undefined
              }
              className={`h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-150 flex items-center justify-center relative ${
                isFilled
                  ? isTarget
                    ? 'scale-105 shadow-md z-10 ring-2 ring-slate-900/80 ring-offset-1'
                    : 'opacity-90 shadow-2xs hover:opacity-100'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:border-slate-400 hover:bg-slate-50'
              }`}
              aria-label={`Score ${num} - ${item.label}`}
            >
              {num}

              {/* Little dot under selected value */}
              {isConfirmed && (
                <span 
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: item.text }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanatory Bottom Legend */}
      <div className="flex justify-between items-center text-xs text-slate-500 px-1 font-medium pt-1">
        <span className="flex items-center text-rose-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 shrink-0"></span>
          0–6: Detractor
        </span>
        <span className="flex items-center text-amber-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 shrink-0"></span>
          7–8: Passive (Neutral)
        </span>
        <span className="flex items-center text-emerald-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 shrink-0"></span>
          9–10: Promoter
        </span>
      </div>

    </div>
  );
}
