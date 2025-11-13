// customerRoutes.js
import express from "express";
import Customer from "../models/customerModel.js"; // Import the new model

const router = express.Router();

// POST a new customer (for visits without purchase)
router.post("/", async (req, res) => {
    try {
        const { customerName, mobileNumber, gender, dob, purposeOfVisit } = req.body;

        if (!customerName || !mobileNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const customer = new Customer({
            customerName,
            mobileNumber,
            gender,
            dob,
            purposeOfVisit,
        });

        await customer.save();
        res.status(201).json({ message: "Customer saved successfully", customer });
    } catch (error) {
        console.error("Customer Save Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});

export default router;