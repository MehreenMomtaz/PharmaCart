import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useReviewStore } from "../store/useReviewStore";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import {
  MessageSquare,
  ThumbsUp,
  Calendar,
  Edit,
  Trash2,
  Plus,
  User,
  Shield,
  Star,
} from "lucide-react";

const ReviewsSection = ({ medicineId, medicineName, onRatingUpdated }) => {
  const { authUser } = useAuthStore();
  const {
    reviews,
    reviewStats,
    isLoadingReviews,
    fetchMedicineReviews,
    eligibility,
    fetchEligibility,
    deleteReview,
  } = useReviewStore();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (medicineId) {
      fetchMedicineReviews(medicineId, currentPage);
      if (authUser) fetchEligibility(medicineId);
    }
  }, [
    medicineId,
    currentPage,
    authUser,
    fetchMedicineReviews,
    fetchEligibility,
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteReview(reviewId);
      // Refresh reviews after deletion
      fetchMedicineReviews(medicineId, currentPage);
      fetchEligibility(medicineId);
    }
  };

  const userCanReview = Boolean(authUser && eligibility?.canReview);

  const getRatingDistribution = () => {
    if (!reviewStats?.ratingDistribution) return [];

    const distribution = [1, 2, 3, 4, 5]
      .map((rating) => {
        const found = reviewStats.ratingDistribution.find(
          (r) => r._id === rating,
        );
        return {
          rating,
          count: found ? found.count : 0,
          percentage:
            reviewStats.totalReviews > 0
              ? (
                  ((found?.count || 0) / reviewStats.totalReviews) *
                  100
                ).toFixed(1)
              : 0,
        };
      })
      .reverse(); // Show 5 stars first

    return distribution;
  };

  if (isLoadingReviews && reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e2ebe7] bg-white shadow-[0_18px_55px_rgba(7,63,53,.07)]">
      {/* Header */}
      <div className="border-b border-[#e2ebe7] bg-[#effbf7] p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-white text-[#159a74]">
              <MessageSquare className="size-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Reviews & Ratings
            </h2>
          </div>

          {userCanReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex min-h-11 items-center gap-2 rounded-full bg-[#159a74] px-5 font-semibold text-white transition hover:bg-[#087558]"
            >
              <Plus className="w-4 h-4" />
              Write Review
            </button>
          )}
        </div>

        {/* Rating Summary */}
        {reviewStats && reviewStats.totalReviews > 0 && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {(
                  reviewStats.ratingDistribution.reduce(
                    (acc, r) => acc + r._id * r.count,
                    0,
                  ) / reviewStats.totalReviews
                ).toFixed(1)}
              </div>
              <StarRating
                rating={
                  reviewStats.ratingDistribution.reduce(
                    (acc, r) => acc + r._id * r.count,
                    0,
                  ) / reviewStats.totalReviews
                }
                size="lg"
                readonly={true}
                showText={false}
              />
              <p className="text-gray-600 mt-2">
                Based on {reviewStats.totalReviews} review
                {reviewStats.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {getRatingDistribution().map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-2">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {authUser && eligibility?.reason === "not_delivered" ? (
        <div className="border-b border-[#e2ebe7] px-6 py-4 text-sm text-[#66756f]">
          <Shield className="mr-2 inline size-4 text-[#159a74]" />
          Reviews unlock after you receive this medicine from a completed
          PharmaCart order.
        </div>
      ) : null}
      {!authUser ? (
        <div className="border-b border-[#e2ebe7] px-6 py-4 text-sm text-[#66756f]">
          Sign in to check verified-purchase review eligibility.
        </div>
      ) : null}

      {/* Review Form */}
      {showReviewForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <ReviewForm
            medicineId={medicineId}
            onReviewSubmitted={() => {
              setShowReviewForm(false);
              fetchMedicineReviews(medicineId, 1);
              fetchEligibility(medicineId);
              setCurrentPage(1);
              // Notify parent component to refresh medicine data
              if (onRatingUpdated) {
                onRatingUpdated();
              }
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      <div className="p-6">
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#dff8ef]">
                      <User className="size-5 text-[#159a74]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {review.userId.fullName}
                        </h4>
                        {review.isVerified && (
                          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            <Shield className="w-3 h-3" />
                            Verified Purchase
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating
                          rating={review.rating}
                          size="sm"
                          readonly={true}
                          showText={false}
                        />
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User's own review actions */}
                  {authUser && review.userId._id === authUser._id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed">{review.review}</p>
              </div>
            ))}

            {/* Pagination */}
            {reviewStats?.pagination &&
              reviewStats.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!reviewStats.pagination.hasPrev}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {reviewStats.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!reviewStats.pagination.hasNext}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="py-14 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your experience with {medicineName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
