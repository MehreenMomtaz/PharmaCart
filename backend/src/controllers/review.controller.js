import Review from "../models/review.model.js";
import Medicine from "../models/medicine.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { medicineId, rating, review } = req.body;
        const userId = req.user._id;

        // Check if medicine exists
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        // Check if user already reviewed this medicine
        const existingReview = await Review.findOne({ userId, medicineId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this medicine" });
        }

        // Check if user has purchased this medicine (for verified review)
        const hasPurchased = await Order.findOne({
            userId,
            'items.medicineId': medicineId,
            status: { $in: ['delivered', 'confirmed'] }
        });

        const newReview = new Review({
            userId,
            medicineId,
            rating,
            review,
            isVerified: !!hasPurchased
        });

        await newReview.save();

        // Populate user data for response
        const populatedReview = await Review.findById(newReview._id)
            .populate('userId', 'fullName')
            .populate('medicineId', 'name');

        // Update medicine average rating
        await updateMedicineRating(medicineId);

        res.status(201).json(populatedReview);
    } catch (error) {
        console.log("Error in createReview controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Get reviews for a medicine
export const getMedicineReviews = async (req, res) => {
    try {
        const { medicineId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ medicineId })
            .populate('userId', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments({ medicineId });
        const totalPages = Math.ceil(totalReviews / limit);

        // Get rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { medicineId: new mongoose.Types.ObjectId(medicineId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.status(200).json({
            reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalReviews,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            ratingDistribution
        });
    } catch (error) {
        console.log("Error in getMedicineReviews controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        const userId = req.user._id;

        const existingReview = await Review.findOne({ _id: id, userId });
        if (!existingReview) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }

        existingReview.rating = rating;
        existingReview.review = review;
        await existingReview.save();

        const updatedReview = await Review.findById(id)
            .populate('userId', 'fullName')
            .populate('medicineId', 'name');

        // Update medicine average rating
        await updateMedicineRating(existingReview.medicineId);

        res.status(200).json(updatedReview);
    } catch (error) {
        console.log("Error in updateReview controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({ _id: id, userId });
        if (!review) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }

        const medicineId = review.medicineId;
        await Review.findByIdAndDelete(id);

        // Update medicine average rating
        await updateMedicineRating(medicineId);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.log("Error in deleteReview controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ userId })
            .populate('medicineId', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments({ userId });
        const totalPages = Math.ceil(totalReviews / limit);

        res.status(200).json({
            reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalReviews,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.log("Error in getUserReviews controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Helper function to update medicine average rating
const updateMedicineRating = async (medicineId) => {
    try {
        const stats = await Review.aggregate([
            { $match: { medicineId: new mongoose.Types.ObjectId(medicineId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
        const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

        await Medicine.findByIdAndUpdate(medicineId, {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            totalReviews
        });
    } catch (error) {
        console.log("Error updating medicine rating:", error.message);
    }
};
