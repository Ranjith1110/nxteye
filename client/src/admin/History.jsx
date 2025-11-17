import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    FileText,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
    import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// ---------- SAFE NUMBER FORMATTER ----------
const safeAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
};

// ---------- PREVIEW MODAL ----------
const BillPreviewModal = ({ bill, onClose }) => {
    if (!bill) return null;

    const formatCurrency = (num) => `₹${safeAmount(num)}/-`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Invoice Preview</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Header */}
                <div className="border-b pb-4 mb-4 text-center">
                    <p className="text-lg font-semibold">SALE INVOICE</p>
                    <p className="text-sm">Invoice No: {bill.invoiceNo}</p>
                    <p className="text-sm">Date: {bill.date}</p>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Customer Information:</h3>
                    <p><strong>Name:</strong> {bill.customer?.customerName}</p>
                    <p><strong>Mobile:</strong> {bill.customer?.mobileNumber}</p>
                    <p><strong>Gender:</strong> {bill.customer?.gender || "N/A"}</p>
                    <p><strong>Purpose:</strong> {bill.customer?.purposeOfVisit || "N/A"}</p>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse border mb-4 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Sl.No</th>
                            <th className="border p-2">Item Name</th>
                            <th className="border p-2">Price</th>
                            <th className="border p-2">CGST</th>
                            <th className="border p-2">SGST</th>
                            <th className="border p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, index) => {
                            const itemPrice = Number(item.itemPrice) || 0;
                            const cgst = itemPrice * ((Number(item.cgst) || 0) / 100);
                            const sgst = itemPrice * ((Number(item.sgst) || 0) / 100);
                            const total = itemPrice + cgst + sgst;

                            return (
                                <tr key={item._id || index}>
                                    <td className="border p-2 text-center">{index + 1}</td>
                                    <td className="border p-2">{item.itemName}</td>
                                    <td className="border p-2 text-right">{formatCurrency(itemPrice)}</td>
                                    <td className="border p-2 text-right">{formatCurrency(cgst)}</td>
                                    <td className="border p-2 text-right">{formatCurrency(sgst)}</td>
                                    <td className="border p-2 text-right">{formatCurrency(total)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="text-right space-y-1 text-sm">
                    <p>Subtotal: {formatCurrency(bill.subTotal)}</p>
                    <p>CGST: {formatCurrency(bill.totalCgstAmount)}</p>
                    <p>SGST: {formatCurrency(bill.totalSgstAmount)}</p>
                    <p>Discount ({bill.discountPercent || 0}%): -{formatCurrency(bill.discountAmount)}</p>
                    <p>Advance: -{formatCurrency(bill.advance)}</p>
                    <p className="text-lg font-bold">Grand Total: {formatCurrency(bill.grandTotal)}</p>
                    <p className="text-base font-semibold">Remaining: {formatCurrency(bill.remaining)}</p>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---------- MAIN HISTORY PAGE ----------
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
        const fetchBillHistory = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/billing/all`);
                const data = await res.json();
                setBills(data);
            } catch (error) {
                toast.error("Failed to fetch history");
            } finally {
                setLoading(false);
            }
        };
        fetchBillHistory();
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

    const displayedBills = showAllItems
        ? filteredBills
        : filteredBills.slice(0, ROWS_TO_SHOW);

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-brand font-bold">History</h2>

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4 mt-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
                            placeholder="Search Bill No, Name, or Mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>

                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            className="w-full border rounded-md pl-10 pr-3 py-2 text-sm"
                            placeholder="Search by Date (e.g., 15/11/2025)"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                        />
                        <Filter className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                </div>

                {/* Table */}
                <div className="mt-4 overflow-x-auto rounded-t-lg border border-gray-200">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 border-b">Bill No</th>
                                <th className="px-4 py-3 border-b">Date</th>
                                <th className="px-4 py-3 border-b">Customer</th>
                                <th className="px-4 py-3 border-b">Mobile</th>
                                <th className="px-4 py-3 border-b">Bill Amount</th>
                                <th className="px-4 py-3 border-b">Advance</th>
                                <th className="px-4 py-3 border-b">Remaining</th>
                                <th className="px-4 py-3 border-b text-center">Preview</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : displayedBills.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-4 text-center text-gray-500">
                                        No bills found.
                                    </td>
                                </tr>
                            ) : (
                                displayedBills.map((bill) => (
                                    <tr key={bill._id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{bill.invoiceNo}</td>
                                        <td className="px-4 py-3">{bill.date}</td>
                                        <td className="px-4 py-3">{bill.customer.customerName}</td>
                                        <td className="px-4 py-3">{bill.customer.mobileNumber}</td>

                                        {/* SAFE AMOUNT DISPLAY */}
                                        <td className="px-4 py-3">₹{safeAmount(bill.grandTotal)}</td>
                                        <td className="px-4 py-3">₹{safeAmount(bill.advance)}</td>
                                        <td className="px-4 py-3">₹{safeAmount(bill.remaining)}</td>

                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedBill(bill) || setShowPreview(true)}
                                                className="p-1 rounded hover:bg-gray-100"
                                            >
                                                <FileText size={18} className="text-blue-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* SHOW MORE / LESS */}
                {filteredBills.length > ROWS_TO_SHOW && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
                        >
                            {showAllItems ? (
                                <>
                                    Show Less <ChevronUp size={18} />
                                </>
                            ) : (
                                <>
                                    Show More ({filteredBills.length - ROWS_TO_SHOW}) <ChevronDown size={18} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {showPreview && (
                <BillPreviewModal bill={selectedBill} onClose={() => setShowPreview(false)} />
            )}

            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default History;
