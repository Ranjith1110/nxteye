import express from "express";
import Customer from "../models/customerModel.js";

const router = express.Router();

// --- GET Customers (Search Logic) ---
router.get("/", async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: "i" } },
                { mobileNumber: { $regex: search } }
            ];
        }

        const skip = (page - 1) * limit;

        // Fetch customers and sort by most recently created
        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip);

        const total = await Customer.countDocuments(query);

        res.status(200).json({
            customers,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- GET Single Customer by Mobile (For Auto-fill) ---
router.get("/mobile/:mobileNumber", async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        const customer = await Customer.findOne({ mobileNumber });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Get the latest clinical entry for autofill convenience
        const lastClinicalEntry = customer.clinicalHistory && customer.clinicalHistory.length > 0
            ? customer.clinicalHistory[customer.clinicalHistory.length - 1]
            : null;

        res.status(200).json({ customer, lastClinicalEntry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- POST: Save Customer Info & APPEND Clinical Entry ---
router.post("/", async (req, res) => {
    try {
        const {
            customerName, mobileNumber, gender, dob, address, purposeOfVisit,
            clinicalEntry // { visitDate, testType, readings, ... }
        } = req.body;

        if (!customerName || !mobileNumber) {
            return res.status(400).json({ message: "Customer Name and Mobile are required" });
        }

        // 1. Check if customer already exists
        let customer = await Customer.findOne({ mobileNumber });

        if (customer) {
            // 2. Update Basic Info (Always keep contact info current)
            customer.customerName = customerName;
            customer.gender = gender || customer.gender;
            customer.dob = dob || customer.dob;
            customer.address = address || customer.address;
            customer.purposeOfVisit = purposeOfVisit || customer.purposeOfVisit;

            // 3. APPEND New Clinical Entry to History
            // This preserves old data and adds the new visit
            if (clinicalEntry) {
                customer.clinicalHistory.push(clinicalEntry);
            }

            await customer.save();
            res.status(200).json({ message: "Clinical Entry Added to History", customer });
        } else {
            // 4. Create New Customer
            customer = new Customer({
                customerName,
                mobileNumber,
                gender,
                dob,
                address,
                purposeOfVisit,
                clinicalHistory: clinicalEntry ? [clinicalEntry] : []
            });
            await customer.save();
            res.status(201).json({ message: "New Customer Created", customer });
        }

    } catch (error) {
        console.error("Customer Save Error:", error);
        res.status(500).json({ message: "Error saving data", error: error.message });
    }
});

export default router;