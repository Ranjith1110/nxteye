import OrderSummary from "../models/orderSummaryModel.js";

// --- Helper: Generate Invoice Number ---
const generateInvoiceNumber = async () => {
    const count = await OrderSummary.countDocuments();
    const nextNum = (count + 1).toString().padStart(4, "0");
    return `NE-${nextNum}`;
};

export const getInvoiceNumber = async (req, res) => {
    try {
        const invoiceNo = await generateInvoiceNumber();
        res.status(200).json({ invoiceNo });
    } catch (error) {
        res.status(500).json({ message: "Error generating invoice number" });
    }
};

// --- Controller: Submit Bill ---
export const submitBill = async (req, res) => {
    try {
        let {
            invoiceNo,
            date,
            customer,
            items,
            subTotal,
            totalCgstAmount,
            totalSgstAmount,
            discountPercent,
            discountAmount,
            advance,
            paymentMethod,
            remaining,
            grandTotal,
            deliveryDate,
            orderStatus
        } = req.body;

        if (!invoiceNo) {
            invoiceNo = await generateInvoiceNumber();
        }

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing items or customer data" });
        }

        const newOrder = new OrderSummary({
            invoiceNo,
            date,
            customer,
            items,
            subTotal,
            totalCgstAmount,
            totalSgstAmount,
            discountPercent,
            discountAmount,
            advance,
            paymentMethod,
            remaining,
            grandTotal,
            deliveryDate,
            orderStatus
        });

        await newOrder.save();
        res.status(201).json({ message: "Bill Saved Successfully", order: newOrder });

    } catch (error) {
        console.error("Billing Submit Error:", error);
        res.status(500).json({ message: "Failed to save bill", error: error.message });
    }
};

// --- Controller: Get All Bills ---
export const getAllBills = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};

        if (type === "delivered") {
            query = { "orderStatus.delivered": true };
        } else if (type === "ordered") {
            query = { 
                "orderStatus.ordered": true, 
                "orderStatus.delivered": false 
            };
        }

        const orders = await OrderSummary.find(query).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bills" });
    }
};

// --- Controller: Update Order Status (Mark as Delivered) ---
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting { delivered: true }

        const updatedOrder = await OrderSummary.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    "orderStatus.delivered": status === 'delivered',
                    // Optional: if delivered, we assume payment is collected, so remaining could be 0?
                    // For now, we just update status as requested.
                } 
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Status Updated", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Failed to update status" });
    }
};