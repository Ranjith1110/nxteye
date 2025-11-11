import React from "react";
import { Search, Filter, Edit2, FileText } from "lucide-react";
import Layout from "../components/dashboard/Layout";

const historyData = [
    {
        billNumber: "nxteye - 001",
        date: "11.10.2025",
        customerName: "Sathish",
        mobile: "788879788",
        billAmount: 10000,
        advance: 500,
        remaining: 9500,
    },
    {
        billNumber: "nxteye - 002",
        date: "12.10.2025",
        customerName: "Subhu",
        mobile: "789545686",
        billAmount: 1000,
        advance: 500,
        remaining: 500,
    },
];

const History = () => (
    <Layout>
        <div className="bg-white shadow-md rounded-lg p-6">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-brand font-bold">History</h2>
            </div>

            {/* Bill History Section */}
            <div className="mt-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
                            placeholder="Search by Bill No"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
                            placeholder="Date"
                        />
                        <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full border bg-white rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border text-left">Bill Number</th>
                                <th className="p-2 border text-left">Date</th>
                                <th className="p-2 border text-left">Customer Name</th>
                                <th className="p-2 border text-left">Mobile Number</th>
                                <th className="p-2 border text-left">Bill Amount</th>
                                <th className="p-2 border text-left">Advance</th>
                                <th className="p-2 border text-left">Remaining</th>
                                <th className="p-2 border text-center">Bill Preview</th>
                                <th className="p-2 border text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.map((row, idx) => (
                                <tr key={row.billNumber}>
                                    <td className="border p-2">{row.billNumber}</td>
                                    <td className="border p-2">{row.date}</td>
                                    <td className="border p-2">{row.customerName}</td>
                                    <td className="border p-2">{row.mobile}</td>
                                    <td className="border p-2">{row.billAmount}</td>
                                    <td className="border p-2">{row.advance}</td>
                                    <td className="border p-2">{row.remaining}</td>
                                    <td className="border p-2 text-center">
                                        <button className="p-1 rounded hover:bg-gray-100">
                                            <FileText size={18} className="text-gray-600" />
                                        </button>
                                    </td>
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
        </div>
    </Layout>
);

export default History;
