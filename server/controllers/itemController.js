import Item from "../models/itemModel.js";

// Get all items
export const getItems = async (req, res) => {
    try {
        const items = await Item.find();
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
        const cgstValue = gstValue / 2;
        const sgstValue = gstValue / 2;

        const newItem = new Item({
            ...itemData,
            cgst: cgstValue,
            sgst: sgstValue,
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Bulk upload
export const bulkUpload = async (req, res) => {
    try {
        const itemsData = req.body.items;

        const formattedItems = itemsData.map((item) => {
            const gstValue = Number(item.gst);
            return {
                ...item,
                cgst: gstValue / 2,
                sgst: gstValue / 2,
            };
        });

        const newItems = await Item.insertMany(formattedItems);
        res.status(201).json(newItems);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Edit item (update all fields)
export const editItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const gstValue = Number(data.gst);
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            {
                ...data,
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
