import PurchaseBill from "../models/purchaseBillModel.js";

// --- Create New Purchase Bill ---
export const createPurchaseBill = async (req, res) => {
  try {
    const { vendor, items, grandTotal } = req.body;

    // Basic Validation
    if (!vendor.vendorName || !vendor.invoiceNumber || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields (Vendor Name, Invoice No, or Items)" });
    }

    const newBill = new PurchaseBill({
      vendor,
      items,
      grandTotal,
    });

    await newBill.save();
    res.status(201).json({ message: "Purchase Bill saved successfully", bill: newBill });
  } catch (error) {
    console.error("Error saving purchase bill:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- Get All Purchase Bills (For History/Dashboard) ---
export const getAllPurchaseBills = async (req, res) => {
  try {
    const bills = await PurchaseBill.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching purchase bills:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- Delete Purchase Bill ---
export const deletePurchaseBill = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBill = await PurchaseBill.findByIdAndDelete(id);

    if (!deletedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json({ message: "Purchase Bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};