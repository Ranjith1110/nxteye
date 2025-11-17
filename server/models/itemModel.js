import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemNumber: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    itemType: { type: String, required: true },
    itemPrice: { type: Number, required: true },
    hsn: { type: String, required: false }, // Added HSN
    gst: { type: Number, required: true },
    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },
    stock: { type: Number, required: true },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;