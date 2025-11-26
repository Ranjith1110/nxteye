import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Edit2,
    Trash2,
    DownloadCloud,
    UploadCloud,
    Upload,
    XCircle,
    ChevronDown,
    ChevronUp,
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
        hsn: "",
        gst: "",
        stock: "",
    });

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [showAllItems, setShowAllItems] = useState(false);

    const fetchItems = async () => {
        try {
            const res = await axios.get(API_URL);
            setItems(res.data);
        } catch (error) {
            console.error("Error fetching items:", error);
            toast.error("Error connecting to server");
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const filteredItems = items.filter((item) => {
        const matchSearch =
            item.itemName.toLowerCase().includes(search.toLowerCase()) ||
            item.itemNumber.toLowerCase().includes(search.toLowerCase());

        const matchFilter = filterType ? item.itemType === filterType : true;
        return matchSearch && matchFilter;
    });

    const displayedItems = showAllItems ? filteredItems : filteredItems.slice(0, 5);

    const handleAddItem = async () => {
        if (!singleUpload.itemNumber || !singleUpload.itemName || !singleUpload.gst)
            return toast.warn("Please fill item number, name & GST");

        try {
            const res = await axios.post(API_URL, singleUpload);
            setItems([res.data, ...items]);

            setSingleUpload({
                itemNumber: "",
                itemName: "",
                itemType: "",
                itemPrice: "",
                hsn: "",
                gst: "",
                stock: "",
            });

            toast.success("Item added successfully");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error adding item");
        }
    };

    const openEditModal = (item) => {
        setEditItem({ ...item });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const updatedData = {
                ...editItem,
                cgst: Number(editItem.gst) / 2,
                sgst: Number(editItem.gst) / 2,
            };

            const res = await axios.put(`${API_URL}/${editItem._id}`, updatedData);

            setItems(items.map((it) => (it._id === editItem._id ? res.data : it)));
            setEditModalOpen(false);
            toast.success("Item updated successfully");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating item");
        }
    };

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

    const handleDownloadSample = () => {
        const wb = XLSX.utils.book_new();
        const rand1 = Math.floor(Math.random() * 1000);
        const rand2 = Math.floor(Math.random() * 1000);

        const wsData = [
            ["Item Number", "Item Name", "Item Type", "Item Price", "HSN Code", "GST%", "Stock"],
            [`nxteye-${rand1}`, "Example Frame", "Frame", 1500, "9003", 12, 20],
            [`nxteye-${rand2}`, "Example Lens", "Lens", 800, "9001", 5, 10],
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "SampleItems");
        XLSX.writeFile(wb, "SampleItems.xlsx");
    };

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

                const uploadedItems = data
                    .slice(1)
                    .filter(row => row[0] && row[1])
                    .map((row) => ({
                        itemNumber: String(row[0]),
                        itemName: String(row[1]),
                        itemType: String(row[2] || "General"),
                        itemPrice: Number(row[3] || 0),
                        hsn: row[4] ? String(row[4]) : "",
                        gst: Number(row[5] || 0),
                        stock: Number(row[6] || 0),
                    }));

                if (uploadedItems.length === 0) {
                    return toast.warn("No valid data found in file");
                }

                const res = await axios.post(`${API_URL}/bulk`, { items: uploadedItems });

                await fetchItems();

                toast.success(res.data.message || "Bulk upload successful");

                e.target.value = null;

            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Bulk upload failed");
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Items Listing</h2>

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
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
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

                <div className="mt-4 overflow-x-auto rounded-t-lg border border-gray-200">
                    {filteredItems.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No items found.</div>
                    ) : (
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 border-b text-left">Item Number</th>
                                    <th className="px-4 py-3 border-b text-left">Item Name</th>
                                    <th className="px-4 py-3 border-b text-left">Item Type</th>
                                    <th className="px-4 py-3 border-b text-left">Item Price</th>
                                    <th className="px-4 py-3 border-b text-left">HSN</th>
                                    <th className="px-4 py-3 border-b text-center">GST%</th>
                                    <th className="px-4 py-3 border-b text-center">CGST%</th>
                                    <th className="px-4 py-3 border-b text-center">SGST%</th>
                                    <th className="px-4 py-3 border-b text-center">Stock</th>
                                    <th className="px-4 py-3 border-b text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedItems.map((item) => (
                                    <tr className="bg-white border-b hover:bg-gray-50" key={item._id}>
                                        <td className="px-4 py-3">{item.itemNumber}</td>
                                        <td className="px-4 py-3">{item.itemName}</td>
                                        <td className="px-4 py-3">{item.itemType}</td>
                                        <td className="px-4 py-3">{item.itemPrice}/-</td>
                                        <td className="px-4 py-3">{item.hsn || "-"}</td>
                                        <td className="px-4 py-3 text-center">{item.gst}%</td>
                                        <td className="px-4 py-3 text-center">{item.cgst || item.gst / 2}%</td>
                                        <td className="px-4 py-3 text-center">{item.sgst || item.gst / 2}%</td>
                                        <td className="px-4 py-3 text-center">{item.stock}</td>
                                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
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

                {filteredItems.length > 5 && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition"
                        >
                            {showAllItems ? (
                                <>
                                    Show Less <ChevronUp size={18} />
                                </>
                            ) : (
                                <>
                                    Show More ({filteredItems.length - 5} more items){" "}
                                    <ChevronDown size={18} />
                                </>
                            )}
                        </button>
                    </div>
                )}

                <div className="mt-8">
                    <h4 className="font-semibold text-lg mb-3">Single Upload</h4>
                    <div className="flex flex-wrap gap-3 mb-3">
                        {[
                            { key: "itemNumber", placeholder: "Item Number" },
                            { key: "itemName", placeholder: "Item Name" },
                            { key: "itemType", placeholder: "Item Type" },
                            { key: "itemPrice", placeholder: "Item Price", type: "number" },
                            { key: "hsn", placeholder: "HSN Code" },
                            { key: "gst", placeholder: "GST %", type: "number" },
                            { key: "stock", placeholder: "Stock", type: "number" },
                        ].map(({ key, placeholder, type }) => (
                            <input
                                key={key}
                                className="border rounded-md p-2 text-sm w-36"
                                placeholder={placeholder}
                                type={type || "text"}
                                value={singleUpload[key]}
                                onChange={(e) =>
                                    setSingleUpload({ ...singleUpload, [key]: e.target.value })
                                }
                            />
                        ))}
                    </div>
                    <button
                        className="inline-flex items-center bg-[#5ce1e6] text-[#03214a] px-4 py-2 rounded-md hover:bg-[#03214a] hover:text-white transition"
                        onClick={handleAddItem}
                    >
                        <Upload className="mr-2" size={16} /> Upload the Data
                    </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-5 items-center">
                    <button
                        onClick={handleDownloadSample}
                        className="flex flex-col items-center p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                        <DownloadCloud size={28} />
                        <span className="text-sm mt-1">Download Sample File</span>
                    </button>

                    <label className="flex flex-col items-center p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 cursor-pointer">
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

            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative shadow-lg">
                        <button
                            onClick={() => setEditModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                        >
                            <XCircle size={22} />
                        </button>

                        <h3 className="text-lg font-semibold mb-4">Edit Item</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-600 font-medium">Item Number</label>
                                <input
                                    className="border rounded-md p-2 text-sm w-full mt-1"
                                    type="text"
                                    value={editItem.itemNumber}
                                    onChange={(e) =>
                                        setEditItem({ ...editItem, itemNumber: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">Item Name</label>
                                <input
                                    className="border rounded-md p-2 text-sm w-full mt-1"
                                    type="text"
                                    value={editItem.itemName}
                                    onChange={(e) =>
                                        setEditItem({ ...editItem, itemName: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">Item Type</label>
                                <input
                                    className="border rounded-md p-2 text-sm w-full mt-1"
                                    type="text"
                                    value={editItem.itemType}
                                    onChange={(e) =>
                                        setEditItem({ ...editItem, itemType: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">Item Price</label>
                                <input
                                    className="border rounded-md p-2 text-sm w-full mt-1"
                                    type="number"
                                    value={editItem.itemPrice}
                                    onChange={(e) =>
                                        setEditItem({ ...editItem, itemPrice: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">HSN Code</label>
                                <input
                                    className="border rounded-md p-2 text-sm w-full mt-1"
                                    type="text"
                                    value={editItem.hsn || ""}
                                    onChange={(e) =>
                                        setEditItem({ ...editItem, hsn: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">GST %</label>
                                <input
                                    className="border rounded-md p-2 text-sm w-full mt-1"
                                    type="number"
                                    value={editItem.gst}
                                    onChange={(e) =>
                                        setEditItem({ ...editItem, gst: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium">Stock</label>
                                <input
                                    className="border rounded-md p-2 text-sm w-full mt-1"
                                    type="number"
                                    value={editItem.stock}
                                    onChange={(e) =>
                                        setEditItem({ ...editItem, stock: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <button
                            className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 w-full"
                            onClick={handleSaveEdit}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={2000} theme="colored" />
        </Layout>
    );
};

export default Items;