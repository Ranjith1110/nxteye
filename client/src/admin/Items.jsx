import React from "react";
import { Search, Filter, Edit2, DownloadCloud, UploadCloud, Upload } from "lucide-react";
import Layout from "../components/dashboard/Layout";

const items = [
    {
        itemNumber: "nxteye - 001",
        itemName: "raybon glass",
        itemType: "Frame",
        itemPrice: "2000/-",
        gst: "5%",
        cgst: "5%",
        sgst: "5%",
        stock: 10,
    },
    {
        itemNumber: "nxteye - 002",
        itemName: "Cooling lens",
        itemType: "lens",
        itemPrice: "1000/-",
        gst: "5%",
        cgst: "5%",
        sgst: "5%",
        stock: 10,
    },
];

const Items = () => {
    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                {/* Page Header */}
                <div className="mb-2">
                    <h2 className="text-2xl font-brand font-bold">Items Listing</h2>
                </div>

                {/* Item Listing */}
                <div className="mt-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
                                placeholder="Search by Name/Number"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <select className="w-full border rounded-md pl-10 pr-3 py-2 text-sm appearance-none">
                                <option>Item type Filter</option>
                                <option value="Frame">Frame</option>
                                <option value="Lens">Lens</option>
                                {/* Add other types as needed */}
                            </select>
                            <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
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
                                    <th className="p-2 border text-center">Stock Available</th>
                                    <th className="p-2 border text-center">Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={item.itemNumber}>
                                        <td className="border p-2">{item.itemNumber}</td>
                                        <td className="border p-2">{item.itemName}</td>
                                        <td className="border p-2">{item.itemType}</td>
                                        <td className="border p-2">{item.itemPrice}</td>
                                        <td className="border p-2 text-center">{item.gst}</td>
                                        <td className="border p-2 text-center">{item.cgst}</td>
                                        <td className="border p-2 text-center">{item.sgst}</td>
                                        <td className="border p-2 text-center">{item.stock}</td>
                                        <td className="border p-2 text-center">
                                            <button className="p-1 rounded hover:bg-gray-100">
                                                <Edit2 size={16} className="text-gray-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Single Upload */}
                <div className="mt-8">
                    <h4 className="font-semibold text-lg mb-3">Single Upload</h4>
                    <div className="flex flex-wrap gap-3 mb-3">
                        <input className="border rounded-md p-2 text-sm w-36" placeholder="Item Number" />
                        <input className="border rounded-md p-2 text-sm w-36" placeholder="Item Name" />
                        <input className="border rounded-md p-2 text-sm w-36" placeholder="Item Type" />
                        <input className="border rounded-md p-2 text-sm w-36" placeholder="Item Price" />
                        <select className="border rounded-md p-2 text-sm w-28">
                            <option>GST %</option>
                            <option>5</option>
                            <option>12</option>
                            <option>18</option>
                        </select>
                        <select className="border rounded-md p-2 text-sm w-28">
                            <option>Stock Available</option>
                            {[...Array(51)].map((_, i) => (
                                <option key={i}>{i}</option>
                            ))}
                        </select>
                    </div>
                    <button className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <Upload className="mr-2" size={16} />
                        Upload the Data
                    </button>
                </div>

                {/* Bulk Upload */}
                <div className="mt-8">
                    <h4 className="font-semibold text-lg mb-3">Bulk Upload</h4>
                    <div className="flex flex-wrap gap-5">
                        <button className="flex flex-col items-center justify-center p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                            <DownloadCloud size={28} />
                            <span className="text-sm mt-1">Download Sample File</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                            <UploadCloud size={28} />
                            <span className="text-sm mt-1">Upload the File</span>
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Items;
