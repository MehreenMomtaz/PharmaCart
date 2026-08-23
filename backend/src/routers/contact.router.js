import express from "express";
import { requestContactVerification, verifyAndSendContactMessage } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", requestContactVerification);
router.post("/verify", verifyAndSendContactMessage);

export default router;
