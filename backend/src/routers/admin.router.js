import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { adminRequired } from "../middlewares/adminRequired.js";
import {
    getAllMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    getAllOrders,
    getOrderById,
    getDashboardStats,
    updateInventory,
    getCustomers
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protectRoute, adminRequired);

// Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/customers", getCustomers);

// Medicine Management
router.get("/medicines", getAllMedicines);
router.post("/medicines", createMedicine);
router.put("/medicines/:id", updateMedicine);
router.delete("/medicines/:id", deleteMedicine);
router.put("/medicines/:id/inventory", updateInventory);

// Order Management
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);

export default router;
