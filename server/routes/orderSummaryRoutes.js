import express from "express";
import { 
    getInvoiceNumber, 
    submitBill, 
    getAllBills,
    updateOrderStatus // Import new controller
} from "../controllers/billingController.js"; 

const router = express.Router();

router.get("/invoice", getInvoiceNumber);
router.post("/submit", submitBill);
router.get("/all", getAllBills);
router.put("/status/:id", updateOrderStatus); // New Route

export default router;