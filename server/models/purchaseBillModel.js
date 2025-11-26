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
        itemType: { type: String }, // New Field
        hsn: { type: String },
        itemPrice: { type: Number, required: true }, // Renamed from rate
        stock: { type: Number, required: true }, // Renamed from qty (Quantity Purchased)
        gstPercent: { type: Number, default: 0 }, // New Field
        cgstPercent: { type: Number, default: 0 }, // New Field
        sgstPercent: { type: Number, default: 0 }, // New Field
        taxAmount: { type: Number, default: 0 }, // Calculated Tax
        netAmount: { type: Number, required: true }, // (Price * Stock) + Tax
      },
    ],
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

const PurchaseBill = mongoose.model("PurchaseBill", purchaseBillSchema);

export default PurchaseBill;