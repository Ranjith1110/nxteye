import express from "express";
import { createPurchaseBill, getAllPurchaseBills } from "../controllers/purchaseBillController.js";

const router = express.Router();

// POST /api/purchase-bills/add
router.post("/add", createPurchaseBill);

// GET /api/purchase-bills/all
router.get("/all", getAllPurchaseBills);

export default router;