import mongoose from "mongoose";

// Sub-schema for Clinical Entries
const clinicalEntrySchema = new mongoose.Schema({
    visitDate: String,
    testType: String, // Glasses / Contact Lens
    appointmentDetails: Object,
    readings: Object, // Stores either glassReadings or clReadings
}, { _id: true });

const customerSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    gender: { type: String },
    dob: { type: String },
    address: { type: String },
    purposeOfVisit: { type: String },
    
    // Array to store history of eye tests
    clinicalHistory: [clinicalEntrySchema], 
    
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", customerSchema);