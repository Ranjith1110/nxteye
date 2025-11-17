import Billing from "../models/billingModel.js";

// --- Helper: Generate Invoice Number ---
const generateInvoiceNumber = async () => {
    const count = await Billing.countDocuments();
    // Generates NE-0001, NE-0002, etc.
    const nextNum = (count + 1).toString().padStart(4, "0");
    return `NE-${nextNum}`;
};

// --- Controller: Get Next Invoice Number ---
export const getInvoiceNumber = async (req, res) => {
    try {
        const invoiceNo = await generateInvoiceNumber();
        res.status(200).json({ invoiceNo });
    } catch (error) {
        console.error("Invoice Generation Error:", error);
        res.status(500).json({ message: "Error generating invoice number" });
    }
};

// --- Controller: Submit a New Bill ---
export const submitBill = async (req, res) => {
    try {
        // Destructure all necessary fields from the request body
        const {
            invoiceNo,
            date,
            customer,
            items,
            subTotal,
            totalCgstAmount,
            totalSgstAmount,
            discountPercent,
            discountAmount,
            advance,
            paymentMethod,
            remaining,
            grandTotal,
        } = req.body;

        // Basic validation (optional but recommended)
        if (!invoiceNo || !customer || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing required billing information" });
        }

        // Create new Billing document
        const newBill = new Billing({
            invoiceNo,
            date,
            customer,
            items,
            subTotal,
            totalCgstAmount,
            totalSgstAmount,
            discountPercent,
            discountAmount,
            advance,
            paymentMethod,
            remaining,
            grandTotal,
        });

        // Save to Database
        await newBill.save();

        res.status(201).json({ message: "Bill saved successfully", billing: newBill });
    } catch (error) {
        console.error("Bill Submit Error:", error);
        res.status(500).json({ message: "Error saving bill", error: error.message });
    }
};

// --- Controller: Get All Bills (History) ---
export const getAllBills = async (req, res) => {
    try {
        // Fetch all bills, sorted by creation date (newest first)
        const bills = await Billing.find({}).sort({ createdAt: -1 });
        res.status(200).json(bills);
    } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ message: "Error fetching bill history" });
    }
};