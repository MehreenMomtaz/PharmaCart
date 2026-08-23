import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        isVerified: {
            type: Boolean,
            default: false // Only users who purchased the medicine can have verified reviews
        }
    },
    { 
        timestamps: true 
    }
);

// Ensure one review per user per medicine
reviewSchema.index({ userId: 1, medicineId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
