import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
    createOrder,
    getUserOrders,
    getOrderById,
    initiateSslCommerzPayment,
    sslCommerzSuccess,
    sslCommerzFailure,
    sslCommerzIpn
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/payment/sslcommerz/success", sslCommerzSuccess);
router.post("/payment/sslcommerz/fail", sslCommerzFailure);
router.post("/payment/sslcommerz/cancel", sslCommerzFailure);
router.post("/payment/sslcommerz/ipn", sslCommerzIpn);

// Customer order routes require authentication
router.use(protectRoute);

router.post("/", createOrder);
router.post("/:orderId/payment/sslcommerz", initiateSslCommerzPayment);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);

export default router;
