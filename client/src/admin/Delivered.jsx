import React, { useState, useEffect } from "react";
import {
    ChevronUp,
    ChevronDown,
    CheckCircle,
    FileSpreadsheet,
    Printer,
    Eye,
    X
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- Helper Functions ---
const safeAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
};

// --- Preview Modal (For viewing details only) ---
const BillPreviewModal = ({ bill, onClose }) => {
    if (!bill) return null;
    const formatCurrency = (num) => `₹${safeAmount(num)}/-`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-green-900">Invoice Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>
                <div className="text-center border-b pb-4 mb-4">
                    <p className="text-lg font-bold">Invoice: {bill.invoiceNo}</p>
                    <p className="text-sm text-gray-500">{bill.date}</p>
                </div>
                <div className="mb-4 bg-gray-50 p-4 rounded border">
                    <p className="text-sm"><strong>Name:</strong> {bill.customer?.customerName}</p>
                    <p className="text-sm"><strong>Mobile:</strong> {bill.customer?.mobileNumber}</p>
                </div>
                <table className="w-full border-collapse border mb-4 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">Item</th>
                            <th className="border p-2 text-right">Price</th>
                            <th className="border p-2 text-center">GST %</th>
                            <th className="border p-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, index) => {
                            const itemPrice = Number(item.itemPrice) || 0;
                            const tax = itemPrice * ((Number(item.cgst) + Number(item.sgst)) / 100);
                            return (
                                <tr key={index}>
                                    <td className="border p-2">{item.itemName}</td>
                                    <td className="border p-2 text-right">{formatCurrency(itemPrice)}</td>
                                    <td className="border p-2 text-center">{Number(item.cgst) + Number(item.sgst)}%</td>
                                    <td className="border p-2 text-right font-medium">{formatCurrency(itemPrice + tax)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium">Close</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const Delivered = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

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

        let matchesDate = true;
        if (fromDate || toDate) {
            const billDate = new Date(bill.createdAt || bill.date);
            const bDate = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());

            if (fromDate) {
                const fDate = new Date(fromDate);
                fDate.setHours(0, 0, 0, 0);
                matchesDate = matchesDate && (bDate >= fDate);
            }
            if (toDate) {
                const tDate = new Date(toDate);
                tDate.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && (bDate <= tDate);
            }
        }
        return matchesSearch && matchesDate;
    });

    const displayedBills = showAllItems ? filteredBills : filteredBills.slice(0, ROWS_TO_SHOW);

    const calculateTotals = (data) => {
        return data.reduce((acc, bill) => {
            acc.subTotal += Number(bill.subTotal || 0);
            acc.cgst += Number(bill.totalCgstAmount || 0);
            acc.sgst += Number(bill.totalSgstAmount || 0);
            acc.grandTotal += Number(bill.grandTotal || 0);
            return acc;
        }, { subTotal: 0, cgst: 0, sgst: 0, grandTotal: 0 });
    };

    const totals = calculateTotals(filteredBills);

    const handleExportExcel = () => {
        if (filteredBills.length === 0) return toast.warn("No data to export");
        const dataToExport = filteredBills.map(bill => ({
            "Invoice No": bill.invoiceNo,
            "Date": bill.date.split(',')[0],
            "Customer Name": bill.customer.customerName,
            "Mobile": bill.customer.mobileNumber,
            "Taxable Amount": safeAmount(bill.subTotal),
            "CGST Amount": safeAmount(bill.totalCgstAmount),
            "SGST Amount": safeAmount(bill.totalSgstAmount),
            "Total GST": safeAmount(Number(bill.totalCgstAmount) + Number(bill.totalSgstAmount)),
            "Grand Total": safeAmount(bill.grandTotal)
        }));

        dataToExport.push({
            "Invoice No": "TOTALS",
            "Date": "", "Customer Name": "", "Mobile": "",
            "Taxable Amount": safeAmount(totals.subTotal),
            "CGST Amount": safeAmount(totals.cgst),
            "SGST Amount": safeAmount(totals.sgst),
            "Total GST": safeAmount(totals.cgst + totals.sgst),
            "Grand Total": safeAmount(totals.grandTotal)
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GST_Report");
        XLSX.writeFile(workbook, `GST_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFromDate("");
        setToDate("");
    };

    const handlePrintReport = () => {
        window.print();
    };

    return (
        <Layout>
            <style>
                {`
                    @media print {
                        @page { size: auto; margin: 0; }
                        body * { visibility: hidden; }
                        
                        /* Only show the Report Template */
                        #printable-report, #printable-report * { 
                            visibility: visible; 
                        }

                        #printable-report {
                            display: block !important;
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 10mm;
                            z-index: 9999;
                        }

                        /* Hide everything else */
                        nav, aside, .layout-content, .Toastify, .modal-backdrop { display: none !important; }
                    }
                `}
            </style>

            <div className="bg-white shadow-md rounded-lg p-6 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Delivered History</h2>
                            <p className="text-sm text-gray-500">Archives of completed orders</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50">
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button
                            onClick={handlePrintReport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 font-bold rounded-full hover:bg-blue-200 transition shadow-sm"
                        >
                            <Printer size={16} /> Print Report
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 items-end">
                    <div className="relative w-full sm:max-w-xs">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Search</label>
                        <input
                            type="text"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none"
                            placeholder="Bill No, Name, Mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">From Date</label>
                        <input
                            type="date"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none text-gray-600"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">To Date</label>
                        <input
                            type="date"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none text-gray-600"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm font-bold hover:bg-gray-300 transition">
                            Clear
                        </button>
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white p-2">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold">
                            <tr>
                                <th className="px-4 py-3 border-b">Bill No</th>
                                <th className="px-4 py-3 border-b">Date</th>
                                <th className="px-4 py-3 border-b">Customer</th>
                                <th className="px-4 py-3 border-b">Mobile</th>
                                <th className="px-4 py-3 border-b text-center">Taxable</th>
                                <th className="px-4 py-3 border-b text-center">CGST</th>
                                <th className="px-4 py-3 border-b text-center">SGST</th>
                                <th className="px-4 py-3 border-b text-center">Total Tax</th>
                                <th className="px-4 py-3 border-b text-right">Grand Total</th>
                                <th className="px-4 py-3 border-b text-center">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" className="p-6 text-center text-gray-500 animate-pulse">Loading history...</td></tr>
                            ) : displayedBills.length === 0 ? (
                                <tr><td colSpan="10" className="p-6 text-center text-gray-500">No delivered bills found.</td></tr>
                            ) : (
                                displayedBills.map((bill) => {
                                    const cgst = Number(bill.totalCgstAmount) || 0;
                                    const sgst = Number(bill.totalSgstAmount) || 0;
                                    return (
                                        <tr key={bill._id} className="bg-white border-b hover:bg-green-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{bill.invoiceNo}</td>
                                            <td className="px-4 py-3">{bill.date.split(',')[0]}</td>
                                            <td className="px-4 py-3 font-medium">{bill.customer.customerName}</td>
                                            <td className="px-4 py-3 text-gray-600">{bill.customer.mobileNumber}</td>
                                            <td className="px-4 py-3 text-center">₹{safeAmount(bill.subTotal)}</td>
                                            <td className="px-4 py-3 text-center text-gray-600">₹{safeAmount(cgst)}</td>
                                            <td className="px-4 py-3 text-center text-gray-600">₹{safeAmount(sgst)}</td>
                                            <td className="px-4 py-3 text-center font-medium text-gray-800">₹{safeAmount(cgst + sgst)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-700">₹{safeAmount(bill.grandTotal)}</td>
                                            <td className="px-4 py-3 text-center flex justify-center gap-2">
                                                <button
                                                    onClick={() => { setSelectedBill(bill); setShowPreview(true); }}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold text-gray-800">
                            <tr>
                                <td colSpan="7" className="px-4 py-3 text-right text-gray-600 uppercase text-xs tracking-wider">Overall Totals:</td>
                                <td className="px-4 py-3 text-center">₹{safeAmount(totals.cgst + totals.sgst)}</td>
                                <td className="px-4 py-3 text-right text-green-800 text-base">₹{safeAmount(totals.grandTotal)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
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

            {/* --- PRINTABLE REPORT (Hidden by default on screen) --- */}
            <div id="printable-report" style={{ display: 'none' }}>
                <SalesHistoryReport 
                    bills={filteredBills} 
                    totals={totals} 
                    dateRange={{ from: fromDate, to: toDate }} 
                />
            </div>
        </Layout>
    );
};

// --- Printable List Report Template ---
const SalesHistoryReport = ({ bills, totals, dateRange }) => {
    return (
        <div className="w-full text-black font-sans text-xs">
            <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-6">
                <div>
                    <img
                        src="/assets/dashboard/nxteye-logo.png"
                        alt="Company Logo"
                        className="h-12 w-auto object-contain mb-2"
                    />
                    <h1 className="text-xl font-bold uppercase text-gray-800">Sales Tax Report</h1>
                    <p className="text-gray-600">75/1, MRM Complex, Faizal Nagar Road, Kenikarai, Ramanathapuram - 623504</p>
                    <p className="text-gray-600">GSTIN: <span className="font-bold">33ABCDE1234F1Z5</span></p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 uppercase text-[10px] tracking-wider">Report Period</p>
                    <div className="font-bold text-sm">
                        {dateRange.from ? dateRange.from : "Start"} <span className="mx-1">to</span> {dateRange.to ? dateRange.to : "Present"}
                    </div>
                    <p className="mt-2 text-gray-500 uppercase text-[10px] tracking-wider">Generated On</p>
                    <p className="font-bold">{new Date().toLocaleString('en-IN')}</p>
                </div>
            </div>

            <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                        <th className="border border-gray-300 p-2 w-10 text-center">Sn</th>
                        <th className="border border-gray-300 p-2 text-left">Date</th>
                        <th className="border border-gray-300 p-2 text-left">Invoice No</th>
                        <th className="border border-gray-300 p-2 text-left">Customer</th>
                        <th className="border border-gray-300 p-2 text-right">Taxable Val</th>
                        <th className="border border-gray-300 p-2 text-right">CGST</th>
                        <th className="border border-gray-300 p-2 text-right">SGST</th>
                        <th className="border border-gray-300 p-2 text-right">Total Tax</th>
                        <th className="border border-gray-300 p-2 text-right">Net Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.length === 0 ? (
                        <tr><td colSpan="9" className="border p-4 text-center">No records found for this period.</td></tr>
                    ) : (
                        bills.map((bill, idx) => {
                             const cgst = Number(bill.totalCgstAmount) || 0;
                             const sgst = Number(bill.totalSgstAmount) || 0;
                             return (
                                <tr key={idx} className="break-inside-avoid">
                                    <td className="border border-gray-300 p-2 text-center">{idx + 1}</td>
                                    <td className="border border-gray-300 p-2">{bill.date.split(',')[0]}</td>
                                    <td className="border border-gray-300 p-2 font-medium">{bill.invoiceNo}</td>
                                    <td className="border border-gray-300 p-2">{bill.customer?.customerName}</td>
                                    <td className="border border-gray-300 p-2 text-right">₹{safeAmount(bill.subTotal)}</td>
                                    <td className="border border-gray-300 p-2 text-right">₹{safeAmount(cgst)}</td>
                                    <td className="border border-gray-300 p-2 text-right">₹{safeAmount(sgst)}</td>
                                    <td className="border border-gray-300 p-2 text-right">₹{safeAmount(cgst + sgst)}</td>
                                    <td className="border border-gray-300 p-2 text-right font-bold">₹{safeAmount(bill.grandTotal)}</td>
                                </tr>
                             )
                        })
                    )}
                </tbody>
                <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-400">
                    <tr>
                        <td colSpan="7" className="border border-gray-300 p-2 text-right uppercase">Total:</td>
                        <td className="border border-gray-300 p-2 text-right">₹{safeAmount(totals.cgst + totals.sgst)}</td>
                        <td className="border border-gray-300 p-2 text-right text-black">₹{safeAmount(totals.grandTotal)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="mt-8 text-center text-[10px] text-gray-500">
                <p>This is a computer generated sales report.</p>
            </div>
        </div>
    );
};

export default Delivered;