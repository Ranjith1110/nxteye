// billingModel.js
import mongoose from "mongoose";

const billingSchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true },
    date: { type: String, required: true },
    customer: {
        customerName: String,
        mobileNumber: String,
        gender: String,
        dob: String,
        purposeOfVisit: String,
    },
    items: { type: Array, default: [] },
    
    subTotal: Number, 
    totalCgstAmount: Number,
    totalSgstAmount: Number,
    discountPercent: Number, 
    discountAmount: Number,
    advance: Number,

    // --- NEW FIELD ---
    paymentMethod: { type: String, default: 'Cash' }, // Added this line
    // --- END NEW FIELD ---

    remaining: Number,
    grandTotal: Number,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Billing", billingSchema);