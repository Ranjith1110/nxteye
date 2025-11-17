import mongoose from "mongoose";

const purchaseBillSchema = new mongoose.Schema(
  {
    vendor: {
      vendorName: { type: String, required: true },
      address: { type: String },
      gstin: { type: String },
      purchaseDate: { type: String, required: true },
      invoiceNumber: { type: String, required: true },
    },
    items: [
      {
        itemName: { type: String, required: true },
        hsn: { type: String },
        rate: { type: Number, required: true },
        disPercent: { type: Number, default: 0 },
        disRate: { type: Number, default: 0 },
        qty: { type: Number, required: true },
        netAmount: { type: Number, required: true },
      },
    ],
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const PurchaseBill = mongoose.model("PurchaseBill", purchaseBillSchema);

export default PurchaseBill;