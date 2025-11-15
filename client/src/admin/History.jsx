import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Edit2,
    FileText,
    ChevronUp, // <-- Added
    ChevronDown, // <-- Added
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- Preview Modal Component (No Changes) ---
const BillPreviewModal = ({ bill, onClose }) => {
    if (!bill) return null;

    // Helper function to format numbers as currency
    const formatCurrency = (num) => `₹${Number(num || 0).toFixed(2)}/-`;

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
                            const itemPrice = Number(item.itemPrice);
                            const cgst = (itemPrice * (Number(item.cgst || 0) / 100));
                            const sgst = (itemPrice * (Number(item.sgst || 0) / 100));
                            const itemTotal = itemPrice + cgst + sgst;
                            return (
                                <tr key={item._id || index}>
                                    <td className="border p-2 text-center">{index + 1}</td>
                                    <td className="border p-2">{item.itemName}</td>
                                    <td className="border p-2 text-right">{formatCurrency(itemPrice)}</td>
                                    <td className="border p-2 text-right">{formatCurrency(cgst)}</td>
                                    <td className="border p-2 text-right">{formatCurrency(sgst)}</td>
                                    <td className="border p-2 text-right">{formatCurrency(itemTotal)}</td>
                                </tr>
                            )
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

                <div className="flex justify-end gap-3 mt-6">
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

// --- UPDATED: History Component ---
const History = () => {
    // --- State for fetching, searching, and preview ---
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [selectedBill, setSelectedBill] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // --- NEW State for pagination ---
    const [showAllItems, setShowAllItems] = useState(false);
    const ROWS_TO_SHOW = 10; // <-- Set to 10 as requested

    // --- Fetch all bills from the new route (No Changes) ---
    useEffect(() => {
        const fetchBillHistory = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/billing/all`);
                if (!res.ok) {
                    throw new Error("Failed to fetch history");
                }
                const data = await res.json();
                setBills(data);
            } catch (error) {
                console.error(error);
                toast.error("Could not fetch bill history.");
            } finally {
                setLoading(false);
            }
        };

        fetchBillHistory();
    }, []);

    // --- Search and Filter Logic (No Changes) ---
    const filteredBills = bills.filter((bill) => {
        const searchTermLower = searchTerm.toLowerCase();

        // Check against multiple fields
        const matchesSearch =
            bill.invoiceNo.toLowerCase().includes(searchTermLower) ||
            bill.customer.customerName.toLowerCase().includes(searchTermLower) ||
            bill.customer.mobileNumber.includes(searchTerm);

        // Check against date (string contains)
        const matchesDate = searchDate ? bill.date.includes(searchDate) : true;

        return matchesSearch && matchesDate;
    });

    // --- Handlers for Preview Modal (No Changes) ---
    const handlePreview = (bill) => {
        setSelectedBill(bill);
        setShowPreview(true);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setSelectedBill(null);
    };

    // --- NEW: Create a list of bills to display (10 or all) ---
    const displayedBills = showAllItems
        ? filteredBills
        : filteredBills.slice(0, ROWS_TO_SHOW);

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-brand font-bold">History</h2>
                </div>

                {/* Bill History Section */}
                <div className="mt-6">
                    {/* --- Search Bars (No Changes) --- */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
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

                    {/* --- Data Table (UPDATED to use displayedBills) --- */}
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
                                    {/* Removed Edit column as it wasn't in your screenshot
                                    <th className="p-2 border text-center">Edit</th>
                                    */}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="p-4 text-center text-gray-500">
                                            Loading bill history...
                                        </td>
                                    </tr>
                                ) : displayedBills.length === 0 ? ( // <-- Use displayedBills
                                    <tr>
                                        <td colSpan="8" className="p-4 text-center text-gray-500">
                                            No bills found.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedBills.map((bill) => ( // <-- Use displayedBills
                                        <tr key={bill._id}>
                                            <td className="border p-2">{bill.invoiceNo}</td>
                                            <td className="border p-2">{bill.date}</td>
                                            <td className="border p-2">{bill.customer.customerName}</td>
                                            <td className="border p-2">{bill.customer.mobileNumber}</td>
                                            <td className="border p-2">₹{bill.grandTotal?.toFixed(2)}</td>
                                            <td className="border p-2">₹{bill.advance?.toFixed(2)}</td>
                                            <td className="border p-2">₹{bill.remaining?.toFixed(2)}</td>
                                            <td className="border p-2 text-center">
                                                <button
                                                    onClick={() => handlePreview(bill)} // <-- Triggers preview
                                                    className="p-1 rounded hover:bg-gray-100"
                                                >
                                                    <FileText size={18} className="text-blue-600" />
                                                </button>
                                            </td>
                                            {/*
                                            <td className="border p-2 text-center">
                                                <button className="p-1 rounded hover:bg-gray-100">
                                                    <Edit2 size={16} className="text-gray-600" />
                                                </button>
                                            </td>
                                            */}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- NEW: Show More / Less Button --- */}
                    {/* This is the exact logic you provided, adapted for this component */}
                    {filteredBills.length > ROWS_TO_SHOW && (
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
                                        Show More ({filteredBills.length - ROWS_TO_SHOW} more items){" "}
                                        <ChevronDown size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Render the Modal (No Changes) --- */}
            {showPreview && (
                <BillPreviewModal bill={selectedBill} onClose={handleClosePreview} />
            )}

            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default History;