import { Star } from 'lucide-react';

const StarRating = ({ 
    rating = 0, 
    onRatingChange = null, 
    size = 'md', 
    readonly = false,
    showText = true 
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const handleStarClick = (starRating) => {
        if (!readonly && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleStarClick(i)}
                    disabled={readonly}
                    className={`${!readonly ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'} focus:outline-none`}
                >
                    <Star
                        className={`${sizes[size]} ${
                            i <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                        } transition-colors`}
                    />
                </button>
            );
        }
        return stars;
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {renderStars()}
            </div>
            {showText && (
                <span className={`${textSizes[size]} text-gray-600 font-medium`}>
                    {rating > 0 ? `${rating.toFixed(1)}` : 'No rating'}
                </span>
            )}
        </div>
    );
};

export default StarRating;
