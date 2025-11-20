import express from "express";
import Customer from "../models/customerModel.js";

const router = express.Router();

// --- GET Customers (Search Logic) ---
router.get("/", async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: "i" } },
                { mobileNumber: { $regex: search } }
            ];
        }
        const customers = await Customer.find(query).sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ customers });
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

        // Get the latest clinical entry if it exists
        const lastClinicalEntry = customer.clinicalHistory && customer.clinicalHistory.length > 0 
            ? customer.clinicalHistory[customer.clinicalHistory.length - 1] 
            : null;

        res.status(200).json({ customer, lastClinicalEntry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- POST: Save Customer Info & Clinical Entry ---
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
            // 2. Update existing customer details (Shared Info)
            customer.customerName = customerName;
            customer.gender = gender || customer.gender;
            customer.dob = dob || customer.dob;
            customer.address = address || customer.address;
            customer.purposeOfVisit = purposeOfVisit || customer.purposeOfVisit;
            
            // 3. Add the new Clinical Entry to history if provided
            if (clinicalEntry) {
                customer.clinicalHistory.push(clinicalEntry);
            }
            await customer.save();
            res.status(200).json({ message: "Clinical Entry Added to Existing Customer", customer });
        } else {
            // 4. Create New Customer with Clinical Entry
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
            res.status(201).json({ message: "New Customer & Clinical Entry Saved", customer });
        }

    } catch (error) {
        console.error("Customer Save Error:", error);
        res.status(500).json({ message: "Error saving data", error: error.message });
    }
});

export default router;