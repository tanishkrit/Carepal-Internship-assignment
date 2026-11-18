import React from 'react';

export default function NpsSelector({ value = null, onChange }) {
  const getButtonStyles = (num) => {
    const isSelected = value === num;
    let category = 'detractor';
    if (num >= 7 && num <= 8) category = 'passive';
    if (num >= 9) category = 'promoter';

    if (isSelected) {
      if (category === 'promoter') {
        return 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-md font-bold';
      }
      if (category === 'passive') {
        return 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300 shadow-md font-bold';
      }
      return 'bg-rose-500 text-white border-rose-500 ring-2 ring-rose-300 shadow-md font-bold';
    }

    // Default unselected state
    return 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50';
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-11 gap-1 sm:gap-1.5 mb-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            type="button"
            key={num}
            onClick={() => onChange(num)}
            className={`h-11 sm:h-12 rounded-lg border text-sm font-semibold transition-all duration-150 flex items-center justify-center ${getButtonStyles(
              num
            )}`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-xs text-slate-500 px-1 font-medium">
        <span className="flex items-center text-rose-600">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1"></span>
          0 - Not at all likely
        </span>
        <span className="hidden sm:inline-block text-slate-400">7-8: Neutral</span>
        <span className="flex items-center text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
          10 - Extremely likely
        </span>
      </div>
    </div>
  );
}
