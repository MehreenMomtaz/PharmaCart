import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
    createReview,
    getMedicineReviews,
    updateReview,
    deleteReview,
    getUserReviews
} from "../controllers/review.controller.js";

const router = express.Router();

// Public routes
router.get("/medicine/:medicineId", getMedicineReviews);

// Protected routes (require authentication)
router.post("/", protectRoute, createReview);
router.get("/user", protectRoute, getUserReviews);
router.put("/:id", protectRoute, updateReview);
router.delete("/:id", protectRoute, deleteReview);

export default router;
