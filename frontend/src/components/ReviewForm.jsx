import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useReviewStore } from '../store/useReviewStore';
import StarRating from './StarRating';
import { MessageSquare, Send, X } from 'lucide-react';

const ReviewForm = ({ medicineId, onReviewSubmitted, onCancel }) => {
    const { authUser } = useAuthStore();
    const { createReview, isCreatingReview } = useReviewStore();
    
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!authUser) {
            return;
        }

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        if (review.trim().length < 10) {
            alert('Please write at least 10 characters in your review');
            return;
        }

        try {
            await createReview({
                medicineId,
                rating,
                review: review.trim()
            });
            
            // Reset form
            setRating(0);
            setReview('');
            
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
        }
    };

    if (!authUser) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Share Your Experience</h3>
                <p className="text-gray-600 mb-4">
                    Please log in to write a review for this medicine.
                </p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    Log In to Review
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Write a Review
                </h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating *
                    </label>
                    <div className="flex items-center gap-3">
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            size="lg"
                            readonly={false}
                            showText={false}
                        />
                        <span className="text-sm text-gray-600">
                            {rating === 0 && 'Click to rate'}
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </span>
                    </div>
                </div>

                {/* Review Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review *
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience with this medicine. How effective was it? Any side effects? Would you recommend it?"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        required
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">
                            Minimum 10 characters required
                        </span>
                        <span className="text-sm text-gray-500">
                            {review.length}/500
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isCreatingReview || rating === 0 || review.trim().length < 10}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                        {isCreatingReview ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {isCreatingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Review Guidelines:</strong> Please be honest and helpful. 
                    Focus on the medicine's effectiveness, side effects, and overall experience. 
                    Avoid personal information and inappropriate content.
                </p>
            </div>
        </div>
    );
};

export default ReviewForm;
