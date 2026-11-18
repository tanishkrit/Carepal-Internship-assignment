import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional'
};

export default function StarRating({
  value = 0,
  onChange = null,
  readOnly = false,
  size = 'md',
  showLabel = true
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const activeValue = hoverValue || value;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1" onMouseLeave={() => !readOnly && setHoverValue(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;
          return (
            <button
              type="button"
              key={star}
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              className={`transition-all duration-150 focus:outline-none ${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
              aria-label={`${star} Star`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && !readOnly && activeValue > 0 && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 animate-fade-in border border-teal-200">
          {RATING_LABELS[activeValue]}
        </span>
      )}

      {showLabel && readOnly && value > 0 && (
        <span className="text-xs font-bold text-slate-700 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
