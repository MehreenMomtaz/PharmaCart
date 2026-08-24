import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useReviewStore = create((set, get) => ({
  reviews: [],
  userReviews: [],
  isLoadingReviews: false,
  isCreatingReview: false,
  isUpdatingReview: false,
  isDeletingReview: false,
  reviewStats: null,
  eligibility: null,

  // Get reviews for a specific medicine
  fetchMedicineReviews: async (medicineId, page = 1) => {
    set({ isLoadingReviews: true });
    try {
      const res = await axiosInstance.get(
        `/reviews/medicine/${medicineId}?page=${page}`,
      );
      set({
        reviews: res.data.reviews,
        reviewStats: {
          totalReviews: res.data.pagination.totalReviews,
          ratingDistribution: res.data.ratingDistribution,
          pagination: res.data.pagination,
        },
      });
    } catch (error) {
      console.log("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      set({ isLoadingReviews: false });
    }
  },

  fetchEligibility: async (medicineId) => {
    try {
      const res = await axiosInstance.get(`/reviews/eligibility/${medicineId}`);
      set({ eligibility: res.data });
      return res.data;
        } catch {
            set({ eligibility: null });
      return null;
    }
  },

  // Create a new review
  createReview: async (reviewData) => {
    set({ isCreatingReview: true });
    try {
      const res = await axiosInstance.post("/reviews", reviewData);
      set((state) => ({
        reviews: [res.data, ...state.reviews],
      }));
      toast.success("Review submitted successfully!");
      return res.data;
    } catch (error) {
      console.log("Error creating review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
      throw error;
    } finally {
      set({ isCreatingReview: false });
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    set({ isUpdatingReview: true });
    try {
      const res = await axiosInstance.put(`/reviews/${reviewId}`, reviewData);
      set((state) => ({
        reviews: state.reviews.map((review) =>
          review._id === reviewId ? res.data : review,
        ),
        userReviews: state.userReviews.map((review) =>
          review._id === reviewId ? res.data : review,
        ),
      }));
      toast.success("Review updated successfully!");
      return res.data;
    } catch (error) {
      console.log("Error updating review:", error);
      toast.error(error.response?.data?.message || "Failed to update review");
      throw error;
    } finally {
      set({ isUpdatingReview: false });
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    set({ isDeletingReview: true });
    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
      set((state) => ({
        reviews: state.reviews.filter((review) => review._id !== reviewId),
        userReviews: state.userReviews.filter(
          (review) => review._id !== reviewId,
        ),
      }));
      toast.success("Review deleted successfully!");
    } catch (error) {
      console.log("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    } finally {
      set({ isDeletingReview: false });
    }
  },

  // Get user's reviews
  fetchUserReviews: async (page = 1) => {
    set({ isLoadingReviews: true });
    try {
      const res = await axiosInstance.get(`/reviews/user?page=${page}`);
      set({ userReviews: res.data.reviews });
    } catch (error) {
      console.log("Error fetching user reviews:", error);
      toast.error("Failed to load your reviews");
    } finally {
      set({ isLoadingReviews: false });
    }
  },

  // Check if user can review a medicine (not already reviewed)
  canUserReview: (medicineId, userId) => {
    const reviews = get().reviews;
    return !reviews.some(
      (review) =>
        review.medicineId === medicineId && review.userId._id === userId,
    );
  },

  // Get user's review for a specific medicine
  getUserReviewForMedicine: (medicineId, userId) => {
    const reviews = get().reviews;
    return reviews.find(
      (review) =>
        review.medicineId === medicineId && review.userId._id === userId,
    );
  },

  // Clear reviews (for cleanup)
  clearReviews: () => {
    set({ reviews: [], userReviews: [], reviewStats: null });
  },
}));
