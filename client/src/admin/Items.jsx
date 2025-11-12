import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Edit2,
    Trash2,
    DownloadCloud,
    UploadCloud,
    Upload,
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import * as XLSX from "xlsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `${import.meta.env.VITE_APP_BASE_URL}/api/items`;

const Items = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [singleUpload, setSingleUpload] = useState({
        itemNumber: "",
        itemName: "",
        itemType: "",
        itemPrice: "",
        gst: "",
        stock: "",
    });

    // 🔹 Fetch all items from backend
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(API_URL);
                setItems(res.data);
            } catch (error) {
                console.error("Error fetching items:", error);
                toast.error("Error connecting to server");
            }
        };
        fetchItems();
    }, []);

    // 🔹 Filter & Search
    const filteredItems = items.filter((item) => {
        const matchSearch =
            item.itemName.toLowerCase().includes(search.toLowerCase()) ||
            item.itemNumber.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filterType ? item.itemType === filterType : true;
        return matchSearch && matchFilter;
    });

    // 🔹 Single Upload (POST)
    const handleAddItem = async () => {
        if (!singleUpload.itemNumber || !singleUpload.itemName || !singleUpload.gst)
            return toast.warn("Please fill item number, name & GST");

        try {
            const res = await axios.post(API_URL, singleUpload);
            setItems([...items, res.data]);
            setSingleUpload({
                itemNumber: "",
                itemName: "",
                itemType: "",
                itemPrice: "",
                gst: "",
                stock: "",
            });
            toast.success("Item added successfully");
        } catch (error) {
            console.error(error);
            toast.error("Error adding item");
        }
    };

    // 🔹 Edit Item (PUT)
    const handleEdit = async (itemId, oldName) => {
        const newName = prompt("Edit Item Name:", oldName);
        if (!newName || newName.trim() === "") return;

        try {
            const res = await axios.put(`${API_URL}/${itemId}`, { itemName: newName });
            setItems(items.map((item) => (item._id === itemId ? res.data : item)));
            toast.success("Item updated");
        } catch (error) {
            console.error(error);
            toast.error("Error editing item");
        }
    };

    // 🔹 Delete Item (DELETE)
    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await axios.delete(`${API_URL}/${itemId}`);
            setItems(items.filter((item) => item._id !== itemId));
            toast.info("Item deleted");
        } catch (error) {
            console.error(error);
            toast.error("Error deleting item");
        }
    };

    // 🔹 Download Sample File
    const handleDownloadSample = () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ["Item Number", "Item Name", "Item Type", "Item Price", "GST%", "Stock"],
            ["nxteye-003", "Example Frame", "Frame", 1500, 12, 20],
            ["nxteye-004", "Example Lens", "Lens", 800, 5, 10],
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "SampleItems");
        XLSX.writeFile(wb, "SampleItems.xlsx");
    };

    // 🔹 Bulk Upload (Excel → MongoDB)
    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                const uploadedItems = data.slice(1).map((row) => ({
                    itemNumber: row[0],
                    itemName: row[1],
                    itemType: row[2],
                    itemPrice: Number(row[3] || 0),
                    gst: Number(row[4] || 0),
                    stock: Number(row[5] || 0),
                }));

                // Send to backend
                await axios.post(`${API_URL}/bulk`, { items: uploadedItems });
                const res = await axios.get(API_URL);
                setItems(res.data);
                toast.success("Bulk items uploaded successfully");
            } catch (error) {
                console.error("Error bulk uploading:", error);
                toast.error("Error in bulk upload");
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Items Listing</h2>

                {/* 🔍 Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
                            placeholder="Search by Name/Number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <select
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm appearance-none"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Frame">Frame</option>
                            <option value="Lens">Lens</option>
                        </select>
                        <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                </div>

                {/* 📋 Table */}
                <div className="overflow-x-auto">
                    {filteredItems.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No items found.</div>
                    ) : (
                        <table className="min-w-full border bg-white rounded-lg text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border text-left">Item Number</th>
                                    <th className="p-2 border text-left">Item Name</th>
                                    <th className="p-2 border text-left">Item Type</th>
                                    <th className="p-2 border text-left">Item Price</th>
                                    <th className="p-2 border text-center">GST%</th>
                                    <th className="p-2 border text-center">CGST%</th>
                                    <th className="p-2 border text-center">SGST%</th>
                                    <th className="p-2 border text-center">Stock</th>
                                    <th className="p-2 border text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => (
                                    <tr key={item._id}>
                                        <td className="border p-2">{item.itemNumber}</td>
                                        <td className="border p-2">{item.itemName}</td>
                                        <td className="border p-2">{item.itemType}</td>
                                        <td className="border p-2">{item.itemPrice}/-</td>
                                        <td className="border p-2 text-center">{item.gst}%</td>
                                        <td className="border p-2 text-center">{item.cgst}%</td>
                                        <td className="border p-2 text-center">{item.sgst}%</td>
                                        <td className="border p-2 text-center">{item.stock}</td>
                                        <td className="border p-2 text-center flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item._id, item.itemName)}
                                                className="p-1 rounded hover:bg-gray-100"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-1 rounded hover:bg-gray-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ➕ Single Upload */}
                <div className="mt-8">
                    <h4 className="font-semibold text-lg mb-3">Single Upload</h4>
                    <div className="flex flex-wrap gap-3 mb-3">
                        <input
                            className="border rounded-md p-2 text-sm w-36"
                            placeholder="Item Number"
                            value={singleUpload.itemNumber}
                            onChange={(e) =>
                                setSingleUpload({ ...singleUpload, itemNumber: e.target.value })
                            }
                        />
                        <input
                            className="border rounded-md p-2 text-sm w-36"
                            placeholder="Item Name"
                            value={singleUpload.itemName}
                            onChange={(e) =>
                                setSingleUpload({ ...singleUpload, itemName: e.target.value })
                            }
                        />
                        <input
                            className="border rounded-md p-2 text-sm w-36"
                            placeholder="Item Type"
                            value={singleUpload.itemType}
                            onChange={(e) =>
                                setSingleUpload({ ...singleUpload, itemType: e.target.value })
                            }
                        />
                        <input
                            className="border rounded-md p-2 text-sm w-36"
                            placeholder="Item Price"
                            type="number"
                            value={singleUpload.itemPrice}
                            onChange={(e) =>
                                setSingleUpload({ ...singleUpload, itemPrice: e.target.value })
                            }
                        />
                        <select
                            className="border rounded-md p-2 text-sm w-28"
                            value={singleUpload.gst}
                            onChange={(e) =>
                                setSingleUpload({ ...singleUpload, gst: e.target.value })
                            }
                        >
                            <option value="">GST %</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                        </select>
                        <input
                            className="border rounded-md p-2 text-sm w-28"
                            placeholder="Stock"
                            type="number"
                            value={singleUpload.stock}
                            onChange={(e) =>
                                setSingleUpload({ ...singleUpload, stock: e.target.value })
                            }
                        />
                    </div>
                    <button
                        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={handleAddItem}
                    >
                        <Upload className="mr-2" size={16} /> Upload the Data
                    </button>
                </div>

                {/* 📂 Bulk Upload */}
                <div className="mt-8 flex flex-wrap gap-5 items-center">
                    <button
                        onClick={handleDownloadSample}
                        className="flex flex-col items-center justify-center p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                        <DownloadCloud size={28} />
                        <span className="text-sm mt-1">Download Sample File</span>
                    </button>

                    <label className="flex flex-col items-center justify-center p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 cursor-pointer">
                        <UploadCloud size={28} />
                        <span className="text-sm mt-1">Upload File</span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".xlsx, .xls"
                            onChange={handleBulkUpload}
                        />
                    </label>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
        </Layout>
    );
};

export default Items;
