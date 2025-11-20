import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    FileText,
    ChevronUp,
    ChevronDown,
    CheckCircle
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const safeAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
};

const BillPreviewModal = ({ bill, onClose }) => {
    if (!bill) return null;
    const formatCurrency = (num) => `₹${safeAmount(num)}/-`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-green-900">Delivered Invoice</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl font-bold">×</button>
                </div>

                <div className="text-center border-b pb-4 mb-4">
                    <div className="flex justify-center mb-2"><CheckCircle className="text-green-500" size={32}/></div>
                    <p className="text-lg font-bold">Invoice: {bill.invoiceNo}</p>
                    <p className="text-sm text-gray-500">{bill.date}</p>
                </div>

                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Customer Information:</h3>
                    <p><strong>Name:</strong> {bill.customer?.customerName}</p>
                    <p><strong>Mobile:</strong> {bill.customer?.mobileNumber}</p>
                    <p><strong>Address:</strong> {bill.customer?.address || "N/A"}</p>
                </div>

                {/* UPDATED TABLE WITH GST % */}
                <table className="w-full border-collapse border mb-4 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">Item Name</th>
                            <th className="border p-2 text-right">Price</th>
                            <th className="border p-2 text-center">CGST %</th>
                            <th className="border p-2 text-center">SGST %</th>
                            <th className="border p-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, index) => {
                            const itemPrice = Number(item.itemPrice) || 0;
                            const cgstPercent = Number(item.cgst) || 0;
                            const sgstPercent = Number(item.sgst) || 0;

                            const cgstAmt = itemPrice * (cgstPercent / 100);
                            const sgstAmt = itemPrice * (sgstPercent / 100);
                            const total = itemPrice + cgstAmt + sgstAmt;

                            return (
                                <tr key={index}>
                                    <td className="border p-2">{item.itemName}</td>
                                    <td className="border p-2 text-right">{formatCurrency(itemPrice)}</td>
                                    <td className="border p-2 text-center text-gray-600">{cgstPercent}%</td>
                                    <td className="border p-2 text-center text-gray-600">{sgstPercent}%</td>
                                    <td className="border p-2 text-right font-medium">{formatCurrency(total)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="text-right space-y-1 text-sm font-medium">
                    <p className="text-gray-600">Subtotal: {formatCurrency(bill.subTotal)}</p>
                    <p className="text-gray-600">Total CGST: {formatCurrency(bill.totalCgstAmount)}</p>
                    <p className="text-gray-600">Total SGST: {formatCurrency(bill.totalSgstAmount)}</p>
                    <p className="text-gray-600">Discount: -{formatCurrency(bill.discountAmount)}</p>
                    <p className="text-lg font-bold text-green-700 border-t pt-2 mt-2">Grand Total: {formatCurrency(bill.grandTotal)}</p>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Close</button>
                </div>
            </div>
        </div>
    );
};

const History = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [selectedBill, setSelectedBill] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    const ROWS_TO_SHOW = 10;

    useEffect(() => {
        const fetchDeliveredBills = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/billing/all?type=delivered`);
                const data = await res.json();
                setBills(data);
            } catch (error) {
                toast.error("Failed to fetch history");
            } finally {
                setLoading(false);
            }
        };
        fetchDeliveredBills();
    }, []);

    const filteredBills = bills.filter((bill) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            bill.invoiceNo.toLowerCase().includes(searchLower) ||
            bill.customer.customerName.toLowerCase().includes(searchLower) ||
            bill.customer.mobileNumber.includes(searchTerm);
        const matchesDate = searchDate ? bill.date.includes(searchDate) : true;
        return matchesSearch && matchesDate;
    });

    const displayedBills = showAllItems ? filteredBills : filteredBills.slice(0, ROWS_TO_SHOW);

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6 min-h-screen">
                <div className="flex items-center gap-3 mb-6">
                     <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Delivered History</h2>
                        <p className="text-sm text-gray-500">Completed orders</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                            placeholder="Search Bill No, Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                            placeholder="Filter by Date..."
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                        />
                        <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold">
                            <tr>
                                <th className="px-4 py-3 border-b">Bill No</th>
                                <th className="px-4 py-3 border-b">Date</th>
                                <th className="px-4 py-3 border-b">Customer</th>
                                <th className="px-4 py-3 border-b">Mobile</th>
                                <th className="px-4 py-3 border-b">Total</th>
                                <th className="px-4 py-3 border-b text-center">Status</th>
                                <th className="px-4 py-3 border-b text-center">Preview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500 animate-pulse">Loading history...</td></tr>
                            ) : displayedBills.length === 0 ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500">No delivered bills found.</td></tr>
                            ) : (
                                displayedBills.map((bill) => (
                                    <tr key={bill._id} className="bg-white border-b hover:bg-green-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{bill.invoiceNo}</td>
                                        <td className="px-4 py-3">{bill.date.split(',')[0]}</td>
                                        <td className="px-4 py-3 font-medium">{bill.customer.customerName}</td>
                                        <td className="px-4 py-3 text-gray-600">{bill.customer.mobileNumber}</td>
                                        <td className="px-4 py-3 font-bold text-green-700">₹{safeAmount(bill.grandTotal)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Delivered</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => { setSelectedBill(bill); setShowPreview(true); }}
                                                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredBills.length > ROWS_TO_SHOW && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-full font-medium shadow-sm transition"
                        >
                            {showAllItems ? (
                                <>Show Less <ChevronUp size={18} /></>
                            ) : (
                                <>Show More ({filteredBills.length - ROWS_TO_SHOW} items) <ChevronDown size={18} /></>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {showPreview && <BillPreviewModal bill={selectedBill} onClose={() => setShowPreview(false)} />}
            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default History;