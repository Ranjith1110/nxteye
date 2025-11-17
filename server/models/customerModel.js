// customerModel.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    gender: { type: String },
    dob: { type: String },
    address: { type: String }, // <--- Added Address Field
    purposeOfVisit: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", customerSchema);