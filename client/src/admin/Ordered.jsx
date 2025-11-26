import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    ChevronUp,
    ChevronDown,
    Package,
    Eye,
    Printer,
    CheckCircle,
    X,
    FileSpreadsheet,
    FileText,
    Download
} from "lucide-react";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : '';
    return str || 'Zero Only';
};

const convertAmountToWords = (amount) => {
    if (!amount) return "Zero Only";
    const [rupees, paisa] = amount.toString().split('.');
    let words = numberToWords(rupees);
    if (paisa && Number(paisa) > 0) {
        words = words.replace('Only ', '');
        words += ` and ${numberToWords(paisa.substring(0, 2))} Paisa Only`;
    }
    return words;
};

const safeAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
};

const InvoiceTemplate = ({ bill }) => {
    if (!bill) return null;

    return (
        <div className="invoice-box bg-white text-black font-sans text-sm p-8 h-full">
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                <div>
                    <img
                        src="/assets/dashboard/nxteye-logo.png"
                        alt="Company Logo"
                        className="h-10 w-auto object-contain mb-2"
                    />
                    <p className="text-gray-700 font-medium mt-1">75/1, MRM Complex, Faizal Nagar Road, Kenikarai, Ramanathapuram - 623504</p>
                    <p className="text-gray-700">Phone: <span className="font-bold">9988997689</span></p>
                    <p className="text-gray-700">GSTIN: <span className="font-bold">33ABCDE1234F1Z5</span></p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase">Tax Invoice</h2>
                    <p className="mt-2 text-gray-700">Invoice #: <span className="font-bold text-black text-lg">{bill.invoiceNo}</span></p>
                    <p className="text-gray-700">Date: <span className="font-bold">{bill.date.split(',')[0]}</span></p>
                </div>
            </div>

            <div className="mb-6 border border-gray-300 p-4 rounded">
                <div className="flex justify-between">
                    <div className="w-1/2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bill To:</h3>
                        <p className="text-lg font-bold text-gray-900">{bill.customer?.customerName}</p>
                        <p className="text-gray-700">{bill.customer?.address || "Address not provided"}</p>
                        <p className="text-gray-700">Mobile: <b>{bill.customer?.mobileNumber}</b></p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Details:</h3>
                        <p className="text-gray-700">Mode: {bill.paymentMethod}</p>
                        <p className="mt-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded font-bold border border-green-300">
                            STATUS: DELIVERED
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-2">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="border border-gray-300 p-2 text-center w-12">Sn.</th>
                            <th className="border border-gray-300 p-2 text-left">Description</th>
                            <th className="border border-gray-300 p-2 text-center w-20">HSN</th>
                            <th className="border border-gray-300 p-2 text-right w-24">Price</th>
                            <th className="border border-gray-300 p-2 text-center w-16">CGST</th>
                            <th className="border border-gray-300 p-2 text-center w-16">SGST</th>
                            <th className="border border-gray-300 p-2 text-right w-28">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, idx) => {
                            const price = Number(item.itemPrice);
                            const cgstVal = price * (Number(item.cgst) / 100);
                            const sgstVal = price * (Number(item.sgst) / 100);
                            const total = price + cgstVal + sgstVal;
                            return (
                                <tr key={idx}>
                                    <td className="border border-gray-300 p-2 text-center">{idx + 1}</td>
                                    <td className="border border-gray-300 p-2 font-medium">{item.itemName}</td>
                                    <td className="border border-gray-300 p-2 text-center">{item.hsn || "-"}</td>
                                    <td className="border border-gray-300 p-2 text-right">₹{price.toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2 text-center text-xs">{item.cgst}%</td>
                                    <td className="border border-gray-300 p-2 text-center text-xs">{item.sgst}%</td>
                                    <td className="border border-gray-300 p-2 text-right font-bold">₹{total.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-start mt-4">
                <div className="w-1/2 pr-8">
                    <div className="border-t border-b border-gray-300 py-2 my-2">
                        <p className="text-xs font-bold text-gray-500 uppercase">Amount in Words:</p>
                        <p className="text-sm font-semibold italic capitalize mt-1">
                            {convertAmountToWords(bill.grandTotal)}
                        </p>
                    </div>
                    <div className="mt-6 text-xs text-gray-600">
                        <p className="font-bold">Terms & Conditions:</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Goods once sold cannot be returned or exchanged.</li>
                            <li>All disputes are subject to Ramnad jurisdiction.</li>
                            <li>This is a computer generated invoice.</li>
                        </ul>
                    </div>
                </div>

                <div className="w-1/2 pl-8">
                    <div className="space-y-2 text-right text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal:</span> <span>₹{safeAmount(bill.subTotal)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>CGST:</span> <span>₹{safeAmount(bill.totalCgstAmount)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>SGST:</span> <span>₹{safeAmount(bill.totalSgstAmount)}</span></div>

                        {Number(bill.discountAmount) > 0 && (
                            <div className="flex justify-between text-red-600"><span>Discount:</span> <span>-₹{safeAmount(bill.discountAmount)}</span></div>
                        )}

                        <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-2 mt-2 text-black">
                            <span>Net Amount:</span> <span>₹{safeAmount(bill.grandTotal)}</span>
                        </div>

                        <div className="flex justify-between text-green-700 border-b border-gray-200 pb-2">
                            <span>Advance Paid:</span> <span>-₹{safeAmount(bill.advance)}</span>
                        </div>

                        <div className="bg-gray-100 p-2 rounded mt-2 border border-gray-300">
                            <div className="flex justify-between font-extrabold text-xl text-blue-900">
                                <span>Balance To Pay:</span> <span>₹{safeAmount(bill.remaining)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-12">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <p className="text-gray-400 text-xs">Customer Signature</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-sm border-t border-gray-400 px-8 pt-1">Authorized Signatory</p>
                        <p className="text-xs text-gray-500">For NxtEye Optical</p>
                    </div>
                </div>
                <div className="text-center text-xs text-gray-400 mt-6 border-t pt-2">
                    Thank you for your patronage!
                </div>
            </div>
        </div>
    );
};

const BillPreviewModal = ({ bill, onClose, onPrint, processing }) => {
    if (!bill) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-xl z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Invoice Preview</h2>
                        <p className="text-xs text-gray-500">Review the final bill before delivery</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onPrint(bill)}
                            disabled={processing}
                            className={`flex items-center gap-2 text-white px-6 py-2 rounded-full font-bold shadow-md transition ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
                        >
                            {processing ? <span className="animate-spin">⌛</span> : <Printer size={18} />}
                            {processing ? "Processing..." : "Print & Deliver"}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="grow overflow-y-auto bg-gray-100 p-8">
                    <div className="mx-auto bg-white shadow-2xl max-w-[210mm] min-h-[297mm] overflow-hidden transform transition-transform">
                        <InvoiceTemplate bill={bill} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Ordered = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [selectedBill, setSelectedBill] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [printBillData, setPrintBillData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const ROWS_TO_SHOW = 10;

    const fetchOrderedBills = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/billing/all?type=ordered`);
            const data = await res.json();
            setBills(data);
        } catch (error) {
            toast.error("Failed to fetch ordered list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderedBills();
    }, []);

    const handlePrintAndDeliver = async (bill) => {
        setIsProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/billing/status/${bill._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'delivered' })
            });

            if (!res.ok) throw new Error("Failed to update status");

            setPrintBillData(bill);
            toast.success("Order Marked as Delivered! Printing Bill...");

            setTimeout(() => {
                window.print();
                setIsProcessing(false);
                setShowPreview(false);
                fetchOrderedBills();
            }, 500);

        } catch (error) {
            console.error(error);
            toast.error("Error updating status. Please try again.");
            setIsProcessing(false);
        }
    };

    const filteredBills = bills.filter((bill) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            bill.invoiceNo.toLowerCase().includes(searchLower) ||
            bill.customer.customerName.toLowerCase().includes(searchLower) ||
            bill.customer.mobileNumber.includes(searchTerm);

        let matchesDate = true;
        if (fromDate || toDate) {
            const billDate = new Date(bill.createdAt || bill.date);

            if (fromDate) {
                matchesDate = matchesDate && (billDate >= new Date(fromDate));
            }
            if (toDate) {
                const t = new Date(toDate);
                t.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && (billDate <= t);
            }
        }

        return matchesSearch && matchesDate;
    });

    const displayedBills = showAllItems ? filteredBills : filteredBills.slice(0, ROWS_TO_SHOW);

    const handleExportExcel = () => {
        if (filteredBills.length === 0) return toast.warn("No data to export");

        const dataToExport = filteredBills.map(bill => ({
            "Invoice No": bill.invoiceNo,
            "Date": bill.date.split(',')[0],
            "Customer Name": bill.customer.customerName,
            "Mobile": bill.customer.mobileNumber,
            "Total Amount": safeAmount(bill.grandTotal),
            "Balance Due": safeAmount(bill.remaining),
            "Status": "Ordered"
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Active_Orders");
        XLSX.writeFile(workbook, `Active_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    const handleExportPDF = async () => {
        const element = document.getElementById("orders-table-container");
        if (!element || filteredBills.length === 0) return toast.warn("No data or table to export");

        setIsExporting(true);
        try {
            const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff' });
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, "PNG", 0, 10, pdfWidth, pdfHeight);
            pdf.save(`Active_Orders_Report.pdf`);
            toast.success("PDF exported successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFromDate("");
        setToDate("");
    };

    return (
        <Layout>
            <style>
                {`
                    @media print {
                        @page { size: A4; margin: 0; }
                        body * { visibility: hidden; }
                        #printable-invoice, #printable-invoice * { visibility: visible; }
                        #printable-invoice { display: flex !important; flexDirection: column; position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; padding: 15mm; background: white; z-index: 9999; font-size: 12px; }
                        .no-print { display: none !important; }
                    }
                `}
            </style>

            <div className="bg-white shadow-md rounded-lg p-6 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Active Orders</h2>
                            <p className="text-sm text-gray-500">Orders pending delivery & payment</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50"
                        >
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50"
                        >
                            <Download size={16} /> {isExporting ? "Generating..." : "PDF"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 items-end">
                    <div className="relative w-full sm:max-w-xs">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Search</label>
                        <input
                            type="text"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            placeholder="Bill No, Name, Mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">From Date</label>
                        <input
                            type="date"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">To Date</label>
                        <input
                            type="date"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm font-bold hover:bg-gray-300 transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                <div id="orders-table-container" className="mt-4 overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white p-2">
                    <div className="mb-4 hidden" id="pdf-header">
                        <h1 className="text-xl font-bold">Active Orders Report</h1>
                        <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                    </div>
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold">
                            <tr>
                                <th className="px-4 py-3 border-b">Bill No</th>
                                <th className="px-4 py-3 border-b">Date</th>
                                <th className="px-4 py-3 border-b">Customer</th>
                                <th className="px-4 py-3 border-b">Mobile</th>
                                <th className="px-4 py-3 border-b">Status</th>
                                <th className="px-4 py-3 border-b">Balance Due</th>
                                <th className="px-4 py-3 border-b text-center no-print-col" data-html2canvas-ignore="true">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500 animate-pulse">Loading orders...</td></tr>
                            ) : displayedBills.length === 0 ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500">No active orders found.</td></tr>
                            ) : (
                                displayedBills.map((bill) => (
                                    <tr key={bill._id} className="bg-white border-b hover:bg-yellow-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{bill.invoiceNo}</td>
                                        <td className="px-4 py-3">{bill.date.split(',')[0]}</td>
                                        <td className="px-4 py-3 font-medium">{bill.customer.customerName}</td>
                                        <td className="px-4 py-3 text-gray-600">{bill.customer.mobileNumber}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                                Ordered
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-red-600">₹{safeAmount(bill.remaining)}</td>
                                        <td className="px-4 py-3 text-center flex justify-center gap-2 no-print-col" data-html2canvas-ignore="true">
                                            <button
                                                onClick={() => { setSelectedBill(bill); setShowPreview(true); }}
                                                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition text-xs font-bold"
                                                title="View & Deliver"
                                            >
                                                <CheckCircle size={14} /> Deliver
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

            <div id="printable-invoice" style={{ display: 'none' }}>
                <InvoiceTemplate bill={printBillData} />
            </div>

            {showPreview && (
                <BillPreviewModal
                    bill={selectedBill}
                    onClose={() => setShowPreview(false)}
                    onPrint={handlePrintAndDeliver}
                    processing={isProcessing}
                />
            )}

            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default Ordered;