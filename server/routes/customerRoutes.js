// customerRoutes.js
import express from "express";
import Customer from "../models/customerModel.js";

const router = express.Router();

// --- GET all customers with search, filter, and pagination ---
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const searchTerm = req.query.search || "";
        const purpose = req.query.purpose || "";
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let query = {};

        if (searchTerm) {
            query.$or = [
                { customerName: { $regex: searchTerm, $options: "i" } },
                { mobileNumber: { $regex: searchTerm } }
            ];
        }

        if (purpose) {
            query.purposeOfVisit = purpose;
        }

        if (startDate && endDate) {
            try {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt = { $gte: start, $lte: end };
            } catch (e) {
                console.error("Invalid date format provided");
            }
        }

        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCustomers = await Customer.countDocuments(query);
        const totalPages = Math.ceil(totalCustomers / limit);

        res.status(200).json({
            customers,
            currentPage: page,
            totalPages,
            totalCustomers
        });

    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});

// --- POST a new customer (Updated with Address) ---
router.post("/", async (req, res) => {
    try {
        // Destructure address from body
        const { customerName, mobileNumber, gender, dob, address, purposeOfVisit } = req.body;

        if (!customerName || !mobileNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingCustomer = await Customer.findOne({ mobileNumber });
        if (existingCustomer) {
            return res.status(409).json({ message: "Customer with this mobile number already exists." });
        }

        const customer = new Customer({
            customerName,
            mobileNumber,
            gender,
            dob,
            address, // <--- Save Address
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