import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Filter,
    ChevronUp,
    ChevronDown,
    Eye,
    Printer,
    FileText,
    X,
    ArrowLeft,
    FileSpreadsheet,
    Download,
    List,
    Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/dashboard/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Libraries for Exporting ---
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- HELPER: Number to Words ---
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

// --- A4 INVOICE TEMPLATE ---
const PurchaseInvoiceTemplate = ({ bill }) => {
    if (!bill) return null;

    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    const processedItems = bill.items.map(item => {
        const qty = parseFloat(item.stock) || 0;
        const price = parseFloat(item.itemPrice) || 0;
        const cgstPer = parseFloat(item.cgstPercent) || 0;
        const sgstPer = parseFloat(item.sgstPercent) || 0;

        const taxableValue = price * qty;
        const cgstAmt = taxableValue * (cgstPer / 100);
        const sgstAmt = taxableValue * (sgstPer / 100);

        totalTaxable += taxableValue;
        totalCGST += cgstAmt;
        totalSGST += sgstAmt;

        return { ...item, taxableValue, cgstAmt, sgstAmt };
    });

    return (
        <div className="invoice-box bg-white text-black font-sans text-xs p-8 h-full flex flex-col justify-between">
            <div>
                {/* HEADER */}
                <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 uppercase tracking-wide">{bill.vendor?.vendorName}</h1>
                        <p className="text-gray-700 font-medium mt-1 w-64">{bill.vendor?.address || "Address Not Available"}</p>
                        <p className="text-gray-700 mt-1">GSTIN: <span className="font-bold">{bill.vendor?.gstin || "N/A"}</span></p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-800 uppercase">Purchase Invoice</h2>
                        <p className="mt-2 text-gray-700">Invoice No: <span className="font-bold text-black text-lg">{bill.vendor?.invoiceNumber}</span></p>
                        <p className="text-gray-700">Date: <span className="font-bold">{bill.vendor?.purchaseDate}</span></p>
                    </div>
                </div>

                {/* BILL TO */}
                <div className="mb-6 border border-gray-300 p-3 rounded bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Receiver (Billed To):</h3>
                        <p className="text-base font-bold text-blue-900">NxtEye Optical</p>
                        <p className="text-gray-700">1/118, South Street, Ramnad - 621708</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-700">Phone: <b>9988997689</b></p>
                        <p className="text-gray-700">GSTIN: <b>33ABCDE1234F1Z5</b></p>
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="mb-2">
                    <table className="w-full border-collapse border border-gray-300 text-[11px]">
                        <thead className="bg-gray-100 text-gray-800 font-bold">
                            <tr>
                                <th className="border border-gray-300 p-1 text-center w-8">Sn</th>
                                <th className="border border-gray-300 p-1 text-left">Item Description</th>
                                <th className="border border-gray-300 p-1 text-center w-16">HSN</th>
                                <th className="border border-gray-300 p-1 text-center w-10">Qty</th>
                                <th className="border border-gray-300 p-1 text-right w-16">Rate</th>
                                <th className="border border-gray-300 p-1 text-right w-20">Taxable Val</th>
                                <th className="border border-gray-300 p-1 text-center w-12">CGST %</th>
                                <th className="border border-gray-300 p-1 text-right w-16">CGST Amt</th>
                                <th className="border border-gray-300 p-1 text-center w-12">SGST %</th>
                                <th className="border border-gray-300 p-1 text-right w-16">SGST Amt</th>
                                <th className="border border-gray-300 p-1 text-right w-20">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-gray-300 p-1 text-center">{idx + 1}</td>
                                    <td className="border border-gray-300 p-1 font-medium">{item.itemName} <span className="text-[9px] text-gray-500">({item.itemType})</span></td>
                                    <td className="border border-gray-300 p-1 text-center">{item.hsn || "-"}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.stock}</td>
                                    <td className="border border-gray-300 p-1 text-right">₹{parseFloat(item.itemPrice).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-1 text-right font-medium">₹{item.taxableValue.toFixed(2)}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.cgstPercent}%</td>
                                    <td className="border border-gray-300 p-1 text-right text-gray-600">₹{item.cgstAmt.toFixed(2)}</td>
                                    <td className="border border-gray-300 p-1 text-center">{item.sgstPercent}%</td>
                                    <td className="border border-gray-300 p-1 text-right text-gray-600">₹{item.sgstAmt.toFixed(2)}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">₹{parseFloat(item.netAmount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER SECTION */}
            <div className="mt-2">
                <div className="flex justify-between items-start">
                    <div className="w-1/2 pr-4">
                        <div className="border border-gray-300 p-2 bg-gray-50 rounded mb-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Invoice Amount in Words:</p>
                            <p className="text-sm font-bold italic capitalize mt-1 text-gray-800">
                                {convertAmountToWords(bill.grandTotal)}
                            </p>
                        </div>
                    </div>
                    <div className="w-1/2 pl-4">
                        <table className="w-full border-collapse border border-gray-300 text-xs mb-3">
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium text-gray-600 text-right">Total Taxable Value:</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold text-gray-800">₹{totalTaxable.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium text-gray-600 text-right">Total CGST:</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold text-gray-800">₹{totalCGST.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-1 font-medium text-gray-600 text-right">Total SGST:</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold text-gray-800">₹{totalSGST.toFixed(2)}</td>
                                </tr>
                                <tr className="bg-blue-900 text-white">
                                    <td className="border border-blue-900 p-2 font-bold text-right uppercase text-sm">Grand Total:</td>
                                    <td className="border border-blue-900 p-2 text-right font-extrabold text-lg">₹{bill.grandTotal?.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-between items-end mt-8 border-t border-gray-300 pt-4">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400">Receiver's Signature</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-xs">For {bill.vendor?.vendorName}</p>
                        <div className="h-8"></div>
                        <p className="text-[10px] text-gray-500 border-t border-gray-400 px-4 pt-1 inline-block">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PREVIEW MODAL ---
const BillPreviewModal = ({ bill, onClose }) => {
    if (!bill) return null;
    const handlePrint = () => window.print();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-xl z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Purchase Bill Preview</h2>
                        <p className="text-xs text-gray-500">GST Input Tax Credit Format</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-md transition"
                        >
                            <Printer size={18} /> Print Bill
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="grow overflow-y-auto bg-gray-100 p-8">
                    <div className="mx-auto bg-white shadow-2xl max-w-[210mm] min-h-[297mm] overflow-hidden">
                        <PurchaseInvoiceTemplate bill={bill} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const PurchaseHistory = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Date Range State
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [selectedBill, setSelectedBill] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    const ROWS_TO_SHOW = 10;

    const fetchBills = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/purchase-bills/all`);
            const data = await res.json();
            if (res.ok) setBills(data);
            else toast.error("Failed to fetch purchase history");
        } catch (error) {
            console.error(error);
            toast.error("Server Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleDeleteBill = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this purchase bill?")) return;
        try {
            const res = await fetch(`${API_URL}/api/purchase-bills/delete/${id}`, { method: "DELETE" });
            if (res.ok) {
                setBills((prevBills) => prevBills.filter((bill) => bill._id !== id));
                toast.success("Purchase Bill Deleted Successfully");
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete bill");
            }
        } catch (error) {
            toast.error("Error deleting bill");
        }
    };

    // --- HELPER: CALCULATE BILL TOTALS + GST % LOGIC ---
    const getBillTotals = (items) => {
        let taxable = 0;
        let cgst = 0;
        let sgst = 0;
        let totalTax = 0;
        let rates = new Set();

        items.forEach(item => {
            const price = parseFloat(item.itemPrice) || 0;
            const stock = parseFloat(item.stock) || 0;
            const itemTaxable = price * stock;

            const cgstP = parseFloat(item.cgstPercent) || 0;
            const sgstP = parseFloat(item.sgstPercent) || 0;
            const gstRate = cgstP + sgstP;

            if (gstRate > 0) rates.add(gstRate);

            const itemCGST = itemTaxable * (cgstP / 100);
            const itemSGST = itemTaxable * (sgstP / 100);

            taxable += itemTaxable;
            cgst += itemCGST;
            sgst += itemSGST;
            totalTax += (itemCGST + itemSGST);
        });

        // Determine GST Display Label
        let gstLabel = "0%";
        if (rates.size === 1) {
            gstLabel = `${Array.from(rates)[0]}%`;
        } else if (rates.size > 1) {
            gstLabel = "Mixed";
        }

        return { taxable, cgst, sgst, totalTax, gstLabel };
    };

    // --- FILTER LOGIC ---
    const filteredBills = bills.filter((bill) => {
        const term = searchTerm.toLowerCase();
        const matchesTerm = (bill.vendor?.vendorName?.toLowerCase() || "").includes(term) || (bill.vendor?.invoiceNumber?.toLowerCase() || "").includes(term);
        let matchesDate = true;
        const billDate = new Date(bill.vendor?.purchaseDate);
        if (fromDate) matchesDate = matchesDate && (billDate >= new Date(fromDate));
        if (toDate) matchesDate = matchesDate && (billDate <= new Date(toDate));
        return matchesTerm && matchesDate;
    });

    const displayedBills = showAllItems ? filteredBills : filteredBills.slice(0, ROWS_TO_SHOW);

    // --- SUMMARY TOTALS (MAIN FOOTER) ---
    const summaryTotals = useMemo(() => {
        return filteredBills.reduce((acc, bill) => {
            const { taxable, cgst, sgst, totalTax } = getBillTotals(bill.items);
            acc.taxable += taxable;
            acc.cgst += cgst;
            acc.sgst += sgst;
            acc.totalTax += totalTax;
            acc.grandTotal += (bill.grandTotal || 0);
            return acc;
        }, { taxable: 0, cgst: 0, sgst: 0, totalTax: 0, grandTotal: 0 });
    }, [filteredBills]);

    const handlePrintTable = () => window.print();

    // --- EXCEL EXPORT ---
    const handleExportExcel = () => {
        if (filteredBills.length === 0) return toast.warn("No data to export");
        const dataToExport = filteredBills.map(bill => {
            const { taxable, cgst, sgst, totalTax, gstLabel } = getBillTotals(bill.items);
            return {
                "Purchase Date": bill.vendor?.purchaseDate,
                "Invoice Number": bill.vendor?.invoiceNumber,
                "Vendor Name": bill.vendor?.vendorName,
                "Vendor GSTIN": bill.vendor?.gstin || "N/A",
                "GST %": gstLabel,
                "Taxable Value": taxable.toFixed(2),
                "Total GST Amount": totalTax.toFixed(2),
                "CGST Amount": cgst.toFixed(2),
                "SGST Amount": sgst.toFixed(2),
                "Grand Total": bill.grandTotal?.toFixed(2)
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase_Register");
        XLSX.writeFile(workbook, `Purchase_Report.xlsx`);
    };

    return (
        <Layout>
            <style>
                {`
                    @media print {
                        @page { size: landscape; margin: 10mm; }
                        body * { visibility: hidden; }
                        #main-purchase-table, #main-purchase-table * { visibility: visible; }
                        #main-purchase-table { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 10px; }
                        .no-print-col { display: none !important; }
                        #printable-invoice, #printable-invoice * { visibility: visible; }
                        #printable-invoice { position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; background: white; z-index: 9999; }
                    }
                `}
            </style>

            <div className="bg-white shadow-md rounded-lg p-6 min-h-screen flex flex-col">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/purchase-bill')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Purchase Register</h2>
                            <p className="text-sm text-gray-500">Monthly/Yearly GSTR-2 Filing Data</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 items-end">
                    <div className="relative w-full sm:max-w-xs">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Search</label>
                        <input type="text" className="w-full border rounded-md px-3 py-2 text-sm outline-none" placeholder="Vendor/Invoice..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">From Date</label>
                        <input type="date" className="w-full border rounded-md px-3 py-2 text-sm outline-none text-gray-600" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="relative w-full sm:max-w-[150px]">
                        <label className="text-xs font-semibold text-gray-500 ml-1">To Date</label>
                        <input type="date" className="w-full border rounded-md px-3 py-2 text-sm outline-none text-gray-600" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div className="ml-auto">
                        <button onClick={() => { setSearchTerm(""); setFromDate(""); setToDate(""); }} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm font-bold hover:bg-gray-300 transition">Clear Filters</button>
                    </div>
                </div>

                {/* TABLE */}
                <div id="main-purchase-table" className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm grow">
                    <div className="hidden print:block mb-4 text-center">
                        <h1 className="text-xl font-bold">Purchase Register</h1>
                        <p className="text-sm">Generated on: {new Date().toLocaleDateString()}</p>
                    </div>

                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold">
                            <tr>
                                <th className="px-4 py-3 border-b text-left">Date</th>
                                <th className="px-4 py-3 border-b text-left">Invoice No</th>
                                <th className="px-4 py-3 border-b text-left">Vendor Name</th>
                                <th className="px-4 py-3 border-b text-center text-blue-700">GST %</th>
                                <th className="px-4 py-3 border-b text-left">Taxable</th>
                                <th className="px-4 py-3 border-b text-left font-bold text-gray-800">Total Tax</th>
                                <th className="px-4 py-3 border-b text-left">CGST</th>
                                <th className="px-4 py-3 border-b text-left">SGST</th>
                                <th className="px-4 py-3 border-b text-left">Grand Total</th>
                                <th className="px-4 py-3 border-b text-center no-print-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" className="p-6 text-left text-gray-500 animate-pulse">Loading...</td></tr>
                            ) : displayedBills.length === 0 ? (
                                <tr><td colSpan="10" className="p-6 text-left text-gray-500">No records found.</td></tr>
                            ) : (
                                displayedBills.map((bill) => {
                                    const { taxable, cgst, sgst, totalTax, gstLabel } = getBillTotals(bill.items);
                                    return (
                                        <tr key={bill._id} className="bg-white border-b hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 text-left">{bill.vendor?.purchaseDate}</td>
                                            <td className="px-4 py-3 text-left font-medium text-gray-900">{bill.vendor?.invoiceNumber}</td>
                                            <td className="px-4 py-3 text-left">{bill.vendor?.vendorName}</td>
                                            <td className="px-4 py-3 text-center text-blue-600 font-bold bg-blue-50 rounded">{gstLabel}</td>
                                            <td className="px-4 py-3 text-left font-medium">₹{taxable.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-left font-bold text-gray-800">₹{totalTax.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-left text-gray-600">₹{cgst.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-left text-gray-600">₹{sgst.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-left font-bold text-blue-600">₹{bill.grandTotal?.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-center no-print-col">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => { setSelectedBill(bill); setShowPreview(true); }} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition text-xs font-bold">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteBill(bill._id)} className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-200 transition text-xs font-bold">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>

                        {!loading && displayedBills.length > 0 && (
                            <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                <tr>
                                    <td colSpan="4" className="px-4 py-3 text-left text-gray-800 uppercase">Total (Filtered):</td>
                                    <td className="px-4 py-3 text-right text-black">₹{summaryTotals.taxable.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-black">₹{summaryTotals.totalTax.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-black">₹{summaryTotals.cgst.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-black">₹{summaryTotals.sgst.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-blue-700 text-lg">₹{summaryTotals.grandTotal.toFixed(2)}</td>
                                    <td className="no-print-col"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* PAGINATION */}
                {filteredBills.length > ROWS_TO_SHOW && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-full font-medium shadow-sm transition"
                        >
                            {showAllItems ? (<>Show Less <ChevronUp size={18} /></>) : (<>Show More ({filteredBills.length - ROWS_TO_SHOW} items) <ChevronDown size={18} /></>)}
                        </button>
                    </div>
                )}

                {/* --- DOWNLOAD BUTTONS --- */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-end gap-4">
                    <button onClick={handlePrintTable} className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50">
                        <List size={20} /> Print Register
                    </button>
                    <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50">
                        <FileSpreadsheet size={20} /> Download GST Excel
                    </button>
                </div>
            </div>

            <div id="printable-invoice" style={{ display: 'none' }}>
                <PurchaseInvoiceTemplate bill={selectedBill} />
            </div>

            {showPreview && <BillPreviewModal bill={selectedBill} onClose={() => setShowPreview(false)} />}

            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default PurchaseHistory;