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
    
    // --- UPDATED FIELDS ---
    // 'total' is now 'subTotal' to match what you send
    subTotal: Number, 
    
    // 'gst' is removed and replaced with specific amounts
    totalCgstAmount: Number,
    totalSgstAmount: Number,

    // 'discount' is now 'discountPercent' and 'discountAmount'
    discountPercent: Number, 
    discountAmount: Number,
    // --- END UPDATED FIELDS ---

    advance: Number,
    remaining: Number,
    grandTotal: Number,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Billing", billingSchema);