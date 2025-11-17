import express from "express";
import { 
    getInvoiceNumber, 
    submitBill, 
    getAllBills 
} from "../controllers/billingController.js";

const router = express.Router();

// Route to get the next invoice number
router.get("/invoice", getInvoiceNumber);

// Route to submit a new bill
router.post("/submit", submitBill);

// Route to get all bills (for history)
router.get("/all", getAllBills);

export default router;