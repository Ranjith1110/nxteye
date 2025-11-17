import Item from "../models/itemModel.js";

// Get all items
export const getItems = async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 }); // Sort newest first
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add single item
export const addItem = async (req, res) => {
    try {
        const itemData = req.body;
        const gstValue = Number(itemData.gst);

        // Basic Validation
        if (!itemData.itemNumber || !itemData.itemName) {
            return res.status(400).json({ message: "Item Number and Name are required" });
        }

        const newItem = new Item({
            ...itemData,
            hsn: itemData.hsn || "",
            cgst: gstValue / 2,
            sgst: gstValue / 2,
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        // Handle Duplicate Key Error
        if (error.code === 11000) {
            return res.status(400).json({ message: "Item Number already exists. Please use a unique Item Number." });
        }
        res.status(400).json({ message: error.message });
    }
};

// Bulk upload
export const bulkUpload = async (req, res) => {
    try {
        const itemsData = req.body.items;

        if (!itemsData || itemsData.length === 0) {
            return res.status(400).json({ message: "No items provided" });
        }

        const formattedItems = itemsData.map((item) => {
            const gstValue = Number(item.gst || 0);
            return {
                ...item,
                hsn: item.hsn || "",
                cgst: gstValue / 2,
                sgst: gstValue / 2,
            };
        });

        // { ordered: false } ensures that if one item is a duplicate, 
        // MongoDB continues inserting the rest of the unique items instead of stopping.
        await Item.insertMany(formattedItems, { ordered: false });

        res.status(201).json({ message: "Bulk upload successful" });

    } catch (error) {
        // If duplicates were found, insertMany throws an error, but valid docs were inserted.
        if (error.code === 11000 || error.writeErrors) {
            const insertedCount = error.insertedDocs?.length || error.result?.nInserted || 0;
            return res.status(201).json({
                message: `Upload complete. ${insertedCount} new items added. Duplicates were skipped.`
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Edit item
export const editItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const gstValue = Number(data.gst);
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            {
                ...data,
                hsn: data.hsn,
                cgst: gstValue / 2,
                sgst: gstValue / 2,
            },
            { new: true }
        );

        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete item
export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Item.findByIdAndDelete(id);
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};