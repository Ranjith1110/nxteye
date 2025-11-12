import express from "express";
import Billing from "../models/billingModel.js";

const router = express.Router();

// ✅ Generate invoice number for UI display only (not saved to DB)
const generateInvoiceNumber = async () => {
    const count = await Billing.countDocuments();
    const nextNum = (count + 1).toString().padStart(4, "0");
    return `NE-${nextNum}`;
};

// ✅ GET invoice number (for UI only)
router.get("/invoice", async (req, res) => {
    try {
        const invoiceNo = await generateInvoiceNumber();
        res.json({ invoiceNo });
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ message: "Error generating invoice number" });
    }
});

// ✅ POST customer info only (no invoice number stored)
router.post("/", async (req, res) => {
    try {
        const date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const { customerName, mobileNumber, gender, dob } = req.body;

        if (!customerName || !mobileNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const billing = new Billing({
            date,
            customerName,
            mobileNumber,
            gender,
            dob,
        });

        await billing.save();
        res.status(201).json({ message: "Customer saved successfully", billing });
    } catch (error) {
        console.error("Billing Save Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});

// ✅ POST full bill on Submit
router.post("/submit", async (req, res) => {
    try {
        const {
            invoiceNo,
            date,
            customer,
            items,
            total,
            gst,
            discount,
            advance,
            remaining,
            grandTotal,
        } = req.body;

        const billing = new Billing({
            invoiceNo,
            date,
            customer,
            items,
            total,
            gst,
            discount,
            advance,
            remaining,
            grandTotal,
        });

        await billing.save();
        res.status(201).json({ message: "Bill saved successfully", billing });
    } catch (error) {
        console.error("Bill Submit Error:", error);
        res.status(500).json({ message: "Error saving bill" });
    }
});

export default router;  // ✅ THIS LINE IS REQUIRED
