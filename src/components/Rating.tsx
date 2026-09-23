import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  showNumber?: boolean;
}

export const Rating: React.FC<RatingProps> = ({ value, count, size = 16, showNumber = true }) => {
  const rounded = Math.round(value * 10) / 10;

  return (
    <div className="flex items-center gap-1.5 text-xs text-[#525B67]">
      <div className="flex items-center text-[#D97706]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(value)
                ? 'fill-[#D97706] text-[#D97706]'
                : 'fill-transparent text-gray-300'
            }`}
          />
        ))}
      </div>
      {showNumber && <span className="font-semibold text-[#1E232A]">{rounded.toFixed(1)}</span>}
      {count !== undefined && <span className="text-gray-500">({count})</span>}
    </div>
  );
};
