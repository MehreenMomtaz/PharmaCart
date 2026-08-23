import express from "express";
import { getAllMedicines, getMedicineById, getMedicineCategories } from "../controllers/medicine.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllMedicines);
router.get("/categories", getMedicineCategories);
router.get("/:id", getMedicineById);

export default router;
