import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({
  rating = 0,
  onRatingChange = null,
  size = "md",
  readonly = false,
  showText = true,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const activeRating = !readonly && hoveredRating ? hoveredRating : rating;
    for (let i = 1; i <= 5; i++) {
      const icon = (
        <Star
          className={`${sizes[size]} ${i <= activeRating ? "fill-[#e2ad41] text-[#e2ad41]" : "fill-white text-[#b9cbc4]"} transition-colors`}
        />
      );
      stars.push(
        readonly ? (
          <span key={i} aria-hidden="true" className="grid place-items-center">
            {icon}
          </span>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => handleStarClick(i)}
            onMouseEnter={() => setHoveredRating(i)}
            onMouseLeave={() => setHoveredRating(0)}
            onFocus={() => setHoveredRating(i)}
            onBlur={() => setHoveredRating(0)}
            aria-label={`${i} star${i === 1 ? "" : "s"}`}
            aria-pressed={rating === i}
            className="grid size-10 place-items-center rounded-full bg-white transition hover:scale-105 hover:bg-[#fff8e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2ad41]"
          >
            {icon}
          </button>
        ),
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        role={readonly ? undefined : "group"}
        aria-label={readonly ? `${rating} out of 5 stars` : "Choose a rating"}
      >
        {renderStars()}
      </div>
      {showText && (
        <span className={`${textSizes[size]} text-gray-600 font-medium`}>
          {rating > 0 ? `${rating.toFixed(1)}` : "No rating"}
        </span>
      )}
    </div>
  );
};

export default StarRating;
