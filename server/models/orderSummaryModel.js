import mongoose from "mongoose";

const orderSummarySchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true },
    date: { type: String, required: true },
    
    // Basic Customer Snapshot for the Bill
    customer: {
        customerName: String,
        mobileNumber: String,
        address: String, 
    },

    // Billing Details
    items: { type: Array, default: [] },
    subTotal: Number, 
    totalCgstAmount: Number,
    totalSgstAmount: Number,
    discountPercent: Number, 
    discountAmount: Number,
    advance: Number,
    paymentMethod: { type: String, default: 'Cash' },
    remaining: Number,
    grandTotal: Number,

    // New Fields
    deliveryDate: { type: String },
    orderStatus: {
        ordered: { type: Boolean, default: true },
        delivered: { type: Boolean, default: false }
    },
    
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("OrderSummary", orderSummarySchema);