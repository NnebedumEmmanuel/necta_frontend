import React, { useState } from "react";

const StarRating = ({ 
  rating = 0, 
  totalStars = 5, 
  size = "md",
  showNumber = true,
  showReviews = true,
  reviewCount = 0,
  interactive = false,
  onRate,
  
  className = ""
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const renderStar = (position) => {
    const currentRating = hoverRating || rating;
    const filled = position <= currentRating;
    const halfFilled = position - 0.5 <= currentRating && currentRating < position;
    
    return (
      <span 
        key={position}
        className={`inline-block ${sizeClasses[size]} ${interactive ? 'cursor-pointer' : ''}`}
        onMouseEnter={() => interactive && setHoverRating(position)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        onClick={() => interactive && onRate?.(position)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={filled ? "currentColor" : "none"}
          stroke={halfFilled || filled ? "currentColor" : "#D1D5DB"}
          strokeWidth="2"
          className={`w-full h-full ${filled || halfFilled ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          {halfFilled ? (
            <>
              <defs>
                <linearGradient id={`half-gradient-${position}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#half-gradient-${position})`}
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </>
          ) : (
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          )}
        </svg>
      </span>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stars */}
      <div className="flex items-center">
        {[...Array(totalStars)].map((_, i) => renderStar(i + 1))}
      </div>
      
      {/* Rating Number */}
      {showNumber && (
        <span className="text-sm font-semibold text-gray-900">
          {rating.toFixed(1)}
        </span>
      )}
      
      {/* Review Count */}
      {showReviews && reviewCount > 0 && (
        <span className="text-sm text-gray-500">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default StarRating;