// customerRoutes.js
import express from "express";
import Customer from "../models/customerModel.js"; // Import the model

const router = express.Router();

// --- NEW: GET all customers with search and pagination ---
router.get("/", async (req, res) => {
    try {
        // --- Pagination ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; // Default to 15 per page
        const skip = (page - 1) * limit;

        // --- Search ---
        const searchTerm = req.query.search || "";
        let query = {};

        if (searchTerm) {
            query = {
                $or: [
                    // Search by name (case-insensitive)
                    { customerName: { $regex: searchTerm, $options: "i" } },
                    // Search by mobile number (partial match)
                    { mobileNumber: { $regex: searchTerm } }
                ]
            };
        }

        // Fetch customers with pagination and search
        const customers = await Customer.find(query)
            .sort({ createdAt: -1 }) // Show newest customers first
            .skip(skip)
            .limit(limit);

        // Get total count of documents matching the query for pagination
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


// --- EXISTING: POST a new customer ---
router.post("/", async (req, res) => {
    try {
        const { customerName, mobileNumber, gender, dob, purposeOfVisit } = req.body;

        if (!customerName || !mobileNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Optional: Check if customer with this mobile number already exists
        const existingCustomer = await Customer.findOne({ mobileNumber });
        if (existingCustomer) {
            // You could either update the existing customer or return a message
            // For this use case, we'll just return the existing one or a message
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