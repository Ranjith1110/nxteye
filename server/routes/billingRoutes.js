// billingRoutes.js
import express from "express";
import Billing from "../models/billingModel.js";

const router = express.Router();

// ✅ Generate invoice number (No changes)
const generateInvoiceNumber = async () => {
    const count = await Billing.countDocuments();
    const nextNum = (count + 1).toString().padStart(4, "0");
    return `NE-${nextNum}`;
};

// ✅ GET invoice number (No changes)
router.get("/invoice", async (req, res) => {
    try {
        const invoiceNo = await generateInvoiceNumber();
        res.json({ invoiceNo });
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ message: "Error generating invoice number" });
    }
});

// ✅ POST full bill on Submit (FIXED)
router.post("/submit", async (req, res) => {
    try {
        // --- UPDATED: Destructure the correct fields ---
        const {
            invoiceNo,
            date,
            customer,
            items,
            subTotal, // Was 'total'
            totalCgstAmount, // Was missing
            totalSgstAmount, // Was missing
            discountPercent, // Was 'discount'
            discountAmount, // Was missing
            advance,
            remaining,
            grandTotal,
        } = req.body;

        const billing = new Billing({
            invoiceNo,
            date,
            customer,
            items,
            subTotal, // Was 'total'
            totalCgstAmount, // Was 'gst'
            totalSgstAmount, // Was missing
            discountPercent, // Was 'discount'
            discountAmount, // Was missing
            advance,
            remaining,
            grandTotal,
        });
        // --- END UPDATED ---

        await billing.save();
        res.status(201).json({ message: "Bill saved successfully", billing });
    } catch (error) {
        console.error("Bill Submit Error:", error);
        res.status(500).json({ message: "Error saving bill" });
    }
});

// --- NEW: Route to get all bills for History page ---
router.get("/all", async (req, res) => {
    try {
        // Fetch all bills, sort by newest first
        const bills = await Billing.find({}).sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ message: "Error fetching bill history" });
    }
});
// --- END NEW ---

export default router;