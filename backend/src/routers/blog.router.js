import express from "express";
import { 
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getBlogCategories,
    getBlogTags,
    getFeaturedBlogs,
    getAllAdminBlogs
} from "../controllers/blog.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";
import { adminOnly } from "../middlewares/adminOnly.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/categories", getBlogCategories);
router.get("/tags", getBlogTags);
router.get("/featured", getFeaturedBlogs);
router.get("/admin/all", protectRoute, adminOnly, getAllAdminBlogs);
router.get("/:id", getBlogById);

// Admin only routes
router.post("/", protectRoute, adminOnly, createBlog);
router.put("/:id", protectRoute, adminOnly, updateBlog);
router.delete("/:id", protectRoute, adminOnly, deleteBlog);

export default router;
