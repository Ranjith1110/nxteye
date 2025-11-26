import express from "express";
import { createPurchaseBill, getAllPurchaseBills, deletePurchaseBill } from "../controllers/purchaseBillController.js";

const router = express.Router();

router.post("/add", createPurchaseBill);
router.get("/all", getAllPurchaseBills);
router.delete("/delete/:id", deletePurchaseBill);

export default router;