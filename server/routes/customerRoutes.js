// customerRoutes.js
import express from "express";
import Customer from "../models/customerModel.js"; // Import the model

const router = express.Router();

// --- UPDATED: GET all customers with search, filter, and pagination ---
router.get("/", async (req, res) => {
    try {
        // --- Pagination ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; // Default to 15 per page
        const skip = (page - 1) * limit;

        // --- Filters ---
        const searchTerm = req.query.search || "";
        const purpose = req.query.purpose || "";
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let query = {};

        // 1. Search Filter
        if (searchTerm) {
            query.$or = [
                // Search by name (case-insensitive)
                { customerName: { $regex: searchTerm, $options: "i" } },
                // Search by mobile number (partial match)
                { mobileNumber: { $regex: searchTerm } }
            ];
        }

        // 2. Purpose Filter
        if (purpose) {
            query.purposeOfVisit = purpose;
        }

        // 3. Date Range Filter
        if (startDate && endDate) {
            try {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0); // Start of the day

                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // End of the day

                query.createdAt = {
                    $gte: start,
                    $lte: end
                };
            } catch (e) {
                console.error("Invalid date format provided");
                // Do not add date filter if format is invalid
            }
        }

        // Fetch customers with combined query
        const customers = await Customer.find(query)
            .sort({ createdAt: -1 }) // Show newest customers first
            .skip(skip)
            .limit(limit);

        // Get total count of documents matching the *same* query
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


// --- EXISTING: POST a new customer (No changes) ---
router.post("/", async (req, res) => {
    try {
        const { customerName, mobileNumber, gender, dob, purposeOfVisit } = req.body;

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