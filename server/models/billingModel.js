// billingModel.js
import mongoose from "mongoose";

const billingSchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true }, // <-- Reverted to required
    date: { type: String, required: true },
    customer: {
        customerName: String,
        mobileNumber: String,
        gender: String,
        dob: String,
        purposeOfVisit: String, // <-- Kept for full bill submissions
    },
    items: { type: Array, default: [] },
    total: Number,
    gst: Number,
    discount: Number,
    advance: Number,
    remaining: Number,
    grandTotal: Number,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Billing", billingSchema);