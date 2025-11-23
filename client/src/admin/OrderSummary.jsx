import React, { useState, useEffect } from "react";
import Layout from "../components/dashboard/Layout";
import { Plus, Trash2, RefreshCw, Save, Glasses, Eye, Printer, MessageCircle, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

// --- HELPER: Value Generators ---
const generateValues = (start, end, step, prefix = "") => {
    const vals = [];
    for (let i = start; i <= end; i += step) vals.push(`${prefix}${i.toFixed(2)}`);
    return vals;
};
const SPH_CYL_Values = [...generateValues(0.25, 20, 0.25, "+"), "0.00", ...generateValues(0.25, 20, 0.25, "-")].sort();
const ADD_Values = generateValues(0.25, 4.0, 0.25, "+");
const AXIS_Values = Array.from({ length: 37 }, (_, i) => i * 5);
const PD_Values = Array.from({ length: 31 }, (_, i) => (25 + i * 0.5).toFixed(1));
const VA_Values = ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60", "N6", "N8", "N10", "N12"];

// --- HELPER: Number Formatting ---
const safeAmount = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
};

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

const OrderSummary = () => {
    // --- STATE MANAGEMENT ---
    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState("");
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("itemName");
    const [showPreview, setShowPreview] = useState(false);

    // Customer
    const [customer, setCustomer] = useState({
        customerName: "", mobileNumber: "", gender: "", dob: "", address: "", purposeOfVisit: ""
    });

    // Clinical
    const [prescriptionMode, setPrescriptionMode] = useState("Glasses");
    const [appointment, setAppointment] = useState({
        checkupDate: new Date().toISOString().split('T')[0],
        expiryDate: "",
        customerType: "New"
    });

    const [glassReadings, setGlassReadings] = useState({
        left: { SPH: "0.00", CYL: "0.00", AXIS: "0", ADD: "0.00", PD: "62", DistanceVA: "6/6", NearVA: "N6" },
        right: { SPH: "0.00", CYL: "0.00", AXIS: "0", ADD: "0.00", PD: "62", DistanceVA: "6/6", NearVA: "N6" },
    });
    const [clReadings, setClReadings] = useState({
        left: { SPH: "0.00", CYL: "0.00", AXIS: "0", BC: "8.6", DIA: "14.0" },
        right: { SPH: "0.00", CYL: "0.00", AXIS: "0", BC: "8.6", DIA: "14.0" },
    });

    // Billing
    const [advance, setAdvance] = useState("");
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [orderStatus, setOrderStatus] = useState({ ordered: true, delivered: false });
    const [totals, setTotals] = useState({ subTotal: 0, cgst: 0, sgst: 0, grandTotal: 0, remaining: 0, discountAmount: 0 });

    useEffect(() => {
        fetchItems();
        fetchInvoiceNumber();
        setDate(new Date().toLocaleString("en-IN"));
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_URL}/api/items`);
            const data = await res.json();
            setItems(data.map(i => ({ ...i, cgst: i.cgst || 0, sgst: i.sgst || 0, hsn: i.hsn || "-", stock: i.stock || 0 })));
        } catch { toast.error("Failed to fetch items"); }
    };

    const fetchInvoiceNumber = async () => {
        try {
            const res = await fetch(`${API_URL}/api/billing/invoice`);
            if (res.ok) {
                const data = await res.json();
                setInvoiceNo(data.invoiceNo);
            }
        } catch { }
    };

    // --- AUTO-FETCH CUSTOMER & HANDLE HISTORY ---
    const handleMobileBlur = async () => {
        if (customer.mobileNumber && customer.mobileNumber.length >= 10) {
            try {
                const res = await fetch(`${API_URL}/api/customers/mobile/${customer.mobileNumber}`);
                if (res.ok) {
                    const data = await res.json();
                    const { customer: foundCust, lastClinicalEntry } = data;

                    setCustomer(prev => ({
                        ...prev,
                        customerName: foundCust.customerName,
                        gender: foundCust.gender || "",
                        dob: foundCust.dob || "",
                        address: foundCust.address || "",
                        purposeOfVisit: foundCust.purposeOfVisit || ""
                    }));

                    toast.success("Existing Customer Found!");

                    if (lastClinicalEntry) {
                        // CRITICAL LOGIC: 
                        // We load the PREVIOUS readings to save typing time, 
                        // BUT we ensure the 'checkupDate' is TODAY so it saves as a NEW entry.
                        setAppointment(prev => ({
                            ...prev,
                            customerType: "Returning",
                            ...lastClinicalEntry.appointmentDetails,
                            checkupDate: new Date().toISOString().split('T')[0] // FORCE TODAY
                        }));

                        if (lastClinicalEntry.testType === "Glasses") {
                            setPrescriptionMode("Glasses");
                            setGlassReadings(lastClinicalEntry.readings);
                        } else if (lastClinicalEntry.testType === "ContactLens") {
                            setPrescriptionMode("ContactLens");
                            setClReadings(lastClinicalEntry.readings);
                        }
                        toast.info("Previous readings loaded for reference. Please update for today's visit.");
                    }
                }
            } catch (e) { }
        }
    };

    // --- CALCULATIONS ---
    useEffect(() => {
        let sub = 0, c = 0, s = 0;
        cart.forEach(i => {
            const price = Number(i.itemPrice);
            sub += price;
            c += price * (Number(i.cgst) / 100);
            s += price * (Number(i.sgst) / 100);
        });
        const totalTaxed = sub + c + s;
        const discVal = totalTaxed * (Number(discount) / 100);
        const netAmount = totalTaxed - discVal;
        const remaining = netAmount - Number(advance || 0);

        setTotals({
            subTotal: sub,
            cgst: c,
            sgst: s,
            discountAmount: discVal,
            grandTotal: netAmount,
            remaining: remaining < 0 ? 0 : remaining
        });
    }, [cart, discount, advance]);

    // --- DATA MAPPING FOR TEMPLATE ---
    const getBillData = () => ({
        invoiceNo,
        date: new Date().toLocaleString("en-IN"),
        customer,
        items: cart,
        paymentMethod,
        grandTotal: totals.grandTotal,
        subTotal: totals.subTotal,
        totalCgstAmount: totals.cgst,
        totalSgstAmount: totals.sgst,
        discountAmount: totals.discountAmount,
        advance: advance || 0,
        remaining: totals.remaining,
        orderStatus: orderStatus
    });

    // --- HANDLERS ---
    const handleAddToCart = (item) => {
        if (cart.find(c => c._id === item._id)) return toast.info("Item already in cart");
        setCart([...cart, { ...item }]);
    };
    const handleRemove = (id) => setCart(cart.filter(c => c._id !== id));
    const filteredItems = items.filter(i => (filterType === 'itemName' ? i.itemName : i.itemNumber).toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePrint = () => {
        if (cart.length === 0) return toast.warn("Cart is empty");
        window.print();
    };

    const handleSaveBill = async () => {
        if (!customer.customerName || !customer.mobileNumber) return toast.warn("Name & Mobile Required");
        if (cart.length === 0) return toast.warn("Cart is empty");

        try {
            const billingPayload = {
                invoiceNo,
                date: new Date().toLocaleString("en-IN"),
                customer,
                items: cart,
                subTotal: totals.subTotal,
                totalCgstAmount: totals.cgst,
                totalSgstAmount: totals.sgst,
                discountPercent: discount,
                discountAmount: totals.discountAmount,
                advance,
                paymentMethod,
                deliveryDate,
                orderStatus,
                remaining: totals.remaining,
                grandTotal: totals.grandTotal
            };

            const res = await fetch(`${API_URL}/api/billing/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(billingPayload)
            });

            if (res.ok) {
                toast.success("Bill Saved Successfully!");
                setCart([]); setAdvance(""); setDiscount(0);
                fetchInvoiceNumber();
            } else {
                toast.error("Failed to save bill");
            }
        } catch (e) {
            toast.error("Server Error");
        }
    };

    const handleShareWhatsApp = () => {
        if (!customer.customerName || !customer.mobileNumber) {
            return toast.warn("Name & Mobile Required for WhatsApp");
        }
        let msg = `*NxtEye Optical - Clinical Report*\n--------------------------------\n*Patient:* ${customer.customerName}\n*Date:* ${appointment.checkupDate}\n*Type:* ${prescriptionMode}\n--------------------------------\n\n`;
        if (prescriptionMode === "Glasses") {
            msg += `*RIGHT EYE (OD)*\nSPH: ${glassReadings.right.SPH} | CYL: ${glassReadings.right.CYL} | AXIS: ${glassReadings.right.AXIS}\nADD: ${glassReadings.right.ADD}\n\n*LEFT EYE (OS)*\nSPH: ${glassReadings.left.SPH} | CYL: ${glassReadings.left.CYL} | AXIS: ${glassReadings.left.AXIS}\nADD: ${glassReadings.left.ADD}\n`;
        } else {
            msg += `*RIGHT EYE (OD)*\nPWR: ${clReadings.right.SPH} | CYL: ${clReadings.right.CYL}\n\n*LEFT EYE (OS)*\nPWR: ${clReadings.left.SPH} | CYL: ${clReadings.left.CYL}\n`;
        }
        let phone = customer.mobileNumber.replace(/[^0-9]/g, "");
        if (phone.length === 10) phone = "91" + phone;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank");
    };

    const handleSaveClinical = async () => {
        if (!customer.customerName || !customer.mobileNumber) return toast.warn("Name & Mobile Required");
        const payload = {
            ...customer,
            clinicalEntry: {
                visitDate: appointment.checkupDate,
                testType: prescriptionMode,
                appointmentDetails: appointment,
                readings: prescriptionMode === "Glasses" ? glassReadings : clReadings
            }
        };
        try {
            const res = await fetch(`${API_URL}/api/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) toast.success("Clinical Entry Added to History!");
            else toast.error("Failed to save");
        } catch (e) { toast.error("Server Error"); }
    };

    const handleReset = () => {
        setCustomer({ customerName: "", mobileNumber: "", gender: "", dob: "", address: "", purposeOfVisit: "" });
        setCart([]);
        setAdvance(""); setDiscount(0); setDeliveryDate("");
        setAppointment({ checkupDate: new Date().toISOString().split('T')[0], expiryDate: "", customerType: "New" });
        setOrderStatus({ ordered: true, delivered: false });
    };

    const SelectBox = ({ val, opts, onChange }) => (
        <select value={val} onChange={e => onChange(e.target.value)} className="w-full border p-1 text-xs rounded text-center bg-white">
            {opts.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
    );

    return (
        <Layout>
            <style>
                {`
                    @media print {
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #printable-invoice, #printable-invoice * {
                            visibility: visible;
                        }
                        #printable-invoice {
                            display: flex !important;
                            flex-direction: column;
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 297mm; /* Exact A4 Height */
                            padding: 20px;
                            background: white;
                            z-index: 9999;
                            font-size: 12px;
                        }
                        .no-print { display: none !important; }
                    }
                `}
            </style>
            <div className="bg-white shadow-md rounded-lg p-6 relative">
                <div className="flex justify-between items-center bg-white">
                    <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
                    <div className="text-right">
                        <div className="text-md font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Invoice No: {invoiceNo || "..."}</div>
                        <div className="text-xs text-gray-400 mt-1">{date}</div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* 1. CUSTOMER INFO */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-blue-800 uppercase tracking-wider mb-4">Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-600">Mobile*</label>
                                <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={customer.mobileNumber} onChange={e => setCustomer({ ...customer, mobileNumber: e.target.value })} onBlur={handleMobileBlur} placeholder="Enter mobile to search..." />
                            </div>
                            <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-600">Name*</label><input className="w-full border rounded p-2 text-sm" value={customer.customerName} onChange={e => setCustomer({ ...customer, customerName: e.target.value })} /></div>
                            <div><label className="text-xs font-semibold text-gray-600">Purpose</label><select className="w-full border rounded p-2 text-sm" value={customer.purposeOfVisit} onChange={e => setCustomer({ ...customer, purposeOfVisit: e.target.value })}><option value="">Select</option><option>Purchase</option><option>Inquiry</option></select></div>
                            <div><label className="text-xs font-semibold text-gray-600">Gender</label><select className="w-full border rounded p-2 text-sm" value={customer.gender} onChange={e => setCustomer({ ...customer, gender: e.target.value })}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
                            <div className="md:col-span-6"><label className="text-xs font-semibold text-gray-600">Address</label><input className="w-full border rounded p-2 text-sm" placeholder="Full Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} /></div>
                        </div>
                    </div>

                    {/* 2. CLINICAL ENTRY */}
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-blue-800 uppercase tracking-wider">Clinical Entry</h3>
                            <div className="flex gap-4 items-center">
                                <input type="date" className="border rounded px-2 py-1 text-xs" value={appointment.checkupDate} onChange={e => setAppointment({ ...appointment, checkupDate: e.target.value })} />
                                <div className="flex bg-white rounded-lg shadow-sm p-1">
                                    <button onClick={() => setPrescriptionMode("Glasses")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition ${prescriptionMode === "Glasses" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}><Glasses size={14} /> Glasses</button>
                                    <button onClick={() => setPrescriptionMode("ContactLens")} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition ${prescriptionMode === "ContactLens" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}><Eye size={14} /> Contact Lens</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-center">
                                {prescriptionMode === "Glasses" ? (
                                    <>
                                        {['right', 'left'].map((eye) => (
                                            <div key={eye} className={`bg-white p-3 rounded shadow-sm border-t-4 ${eye === 'right' ? 'border-blue-500' : 'border-blue-400'}`}>
                                                <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">{eye} EYE</h4>
                                                <div className="grid grid-cols-7 gap-1">
                                                    <div><label className="text-[10px] text-gray-400 block">SPH</label><SelectBox val={glassReadings[eye].SPH} opts={SPH_CYL_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], SPH: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">CYL</label><SelectBox val={glassReadings[eye].CYL} opts={SPH_CYL_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], CYL: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">AXIS</label><SelectBox val={glassReadings[eye].AXIS} opts={AXIS_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], AXIS: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">ADD</label><SelectBox val={glassReadings[eye].ADD} opts={ADD_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], ADD: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">PD</label><SelectBox val={glassReadings[eye].PD} opts={PD_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], PD: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">D-VA</label><SelectBox val={glassReadings[eye].DistanceVA} opts={VA_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], DistanceVA: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">N-VA</label><SelectBox val={glassReadings[eye].NearVA} opts={VA_Values} onChange={v => setGlassReadings(p => ({ ...p, [eye]: { ...p[eye], NearVA: v } }))} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {['right', 'left'].map((eye) => (
                                            <div key={eye} className="bg-white p-3 rounded shadow-sm border-t-4 border-green-500">
                                                <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">{eye} EYE</h4>
                                                <div className="grid grid-cols-5 gap-2">
                                                    <div><label className="text-[10px] text-gray-400 block">PWR</label><SelectBox val={clReadings[eye].SPH} opts={SPH_CYL_Values} onChange={v => setClReadings(p => ({ ...p, [eye]: { ...p[eye], SPH: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">CYL</label><SelectBox val={clReadings[eye].CYL} opts={SPH_CYL_Values} onChange={v => setClReadings(p => ({ ...p, [eye]: { ...p[eye], CYL: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">AXIS</label><SelectBox val={clReadings[eye].AXIS} opts={AXIS_Values} onChange={v => setClReadings(p => ({ ...p, [eye]: { ...p[eye], AXIS: v } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">BC</label><input className="w-full border p-1 text-xs rounded text-center" value={clReadings[eye].BC} onChange={e => setClReadings(p => ({ ...p, [eye]: { ...p[eye], BC: e.target.value } }))} /></div>
                                                    <div><label className="text-[10px] text-gray-400 block">DIA</label><input className="w-full border p-1 text-xs rounded text-center" value={clReadings[eye].DIA} onChange={e => setClReadings(p => ({ ...p, [eye]: { ...p[eye], DIA: e.target.value } }))} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-blue-200 pt-3 gap-2">
                            <button onClick={handleShareWhatsApp} className="bg-green-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow hover:bg-green-600 transition flex items-center gap-2">
                                <MessageCircle size={16} /> Share via WhatsApp
                            </button>
                            <button onClick={handleSaveClinical} className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow hover:bg-blue-700 transition flex items-center gap-2">
                                <Save size={16} /> Save Clinical Entry
                            </button>
                        </div>
                    </div>

                    {/* 3. ITEM SELECTION */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <h3 className="text-xl font-bold text-blue-800 uppercase tracking-wider mb-2">Select Items</h3>
                        <div className="flex gap-3 mb-3">
                            <input className="flex-grow p-2 border rounded text-sm" placeholder="Search items to add..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            <select className="border rounded px-3 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}><option value="itemName">Name</option><option value="itemNumber">Number</option></select>
                        </div>

                        <div className="border rounded-lg max-h-48 overflow-y-auto bg-gray-50">
                            {filteredItems.length > 0 ? (
                                filteredItems.slice(0, 20).map(i => (
                                    <div key={i._id} className="flex justify-between items-center p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 bg-white transition-colors" onClick={() => handleAddToCart(i)}>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800">{i.itemName}</div>
                                            <div className="text-xs text-gray-500">#{i.itemNumber} | Stock: <span className={i.stock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{i.stock}</span></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-700">₹{i.itemPrice}</span>
                                            <button className="bg-blue-600 text-white p-1.5 rounded-full shadow-sm hover:bg-blue-700 transition"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                ))
                            ) : <div className="p-8 text-center text-gray-400 text-sm">No matching items found</div>}
                        </div>
                    </div>

                    {/* 4. CART & BILLING */}
                    {cart.length > 0 && (
                        <div className="border rounded-lg overflow-hidden bg-white shadow-lg mt-4 animate-fade-in">
                            <div className="bg-gray-100 p-3 font-bold text-gray-700 text-sm border-b flex justify-between items-center">
                                <span>Cart & Billing</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{cart.length} Items</span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 w-16">SL.NO</th>
                                        <th className="px-4 py-3">ITEM NAME</th>
                                        <th className="px-4 py-3">PRICE</th>
                                        <th className="px-4 py-3">HSN</th>
                                        <th className="px-4 py-3">CGST</th>
                                        <th className="px-4 py-3">SGST</th>
                                        <th className="px-4 py-3">TOTAL</th>
                                        <th className="px-4 py-3 text-center">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cart.map((item, index) => {
                                        const price = Number(item.itemPrice);
                                        const cgstVal = price * (Number(item.cgst) / 100);
                                        const sgstVal = price * (Number(item.sgst) / 100);
                                        const itemTotal = price + cgstVal + sgstVal;
                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{item.itemName}</td>
                                                <td className="px-4 py-3">₹{price.toFixed(2)}/-</td>
                                                <td className="px-4 py-3 text-gray-500">{item.hsn}</td>
                                                <td className="px-4 py-3 text-gray-600">₹{cgstVal.toFixed(2)}/-</td>
                                                <td className="px-4 py-3 text-gray-600">₹{sgstVal.toFixed(2)}/-</td>
                                                <td className="px-4 py-3 font-bold text-gray-800">₹{itemTotal.toFixed(2)}/-</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => handleRemove(item._id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition flex items-center gap-1 mx-auto">
                                                        <Trash2 size={12} /> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4 border-t">
                                <div><label className="text-xs font-semibold text-gray-500">Advance</label><input type="number" className="w-full border p-2 rounded text-sm bg-white" placeholder="Enter amount" value={advance} onChange={e => setAdvance(e.target.value)} /></div>
                                <div><label className="text-xs font-semibold text-gray-500">Discount (%)</label><input type="number" className="w-full border p-2 rounded text-sm bg-white" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} /></div>
                                <div><label className="text-xs font-semibold text-gray-500">Payment Method</label><select className="w-full border p-2 rounded text-sm bg-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option></select></div>
                                <div><label className="text-xs font-semibold text-gray-500">Delivery Date</label><input type="date" className="w-full border p-2 rounded text-sm bg-white" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} /></div>
                            </div>
                            <div className="p-4 bg-white flex flex-col md:flex-row justify-between items-end gap-6">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={orderStatus.ordered} onChange={e => setOrderStatus({ ...orderStatus, ordered: e.target.checked })} /> Ordered
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-green-600 rounded" checked={orderStatus.delivered} onChange={e => setOrderStatus({ ...orderStatus, delivered: e.target.checked })} /> Delivered
                                    </label>
                                </div>
                                <div className="text-right space-y-1 text-sm">
                                    <div className="flex justify-between w-64"><span className="text-gray-500">Subtotal :</span> <span>₹{totals.subTotal.toFixed(2)}/-</span></div>
                                    <div className="flex justify-between w-64"><span className="text-gray-500">Total CGST :</span> <span>₹{totals.cgst.toFixed(2)}/-</span></div>
                                    <div className="flex justify-between w-64"><span className="text-gray-500">Total SGST :</span> <span>₹{totals.sgst.toFixed(2)}/-</span></div>
                                    {Number(discount) > 0 && (
                                        <div className="flex justify-between w-64 text-red-500"><span className="">Discount ({discount}%) :</span> <span>-₹{totals.discountAmount.toFixed(2)}/-</span></div>
                                    )}
                                    <div className="flex justify-between w-64 text-green-600"><span className="">Advance Paid :</span> <span>-₹{Number(advance || 0).toFixed(2)}/-</span></div>
                                    <div className="flex justify-between w-64 text-xl font-bold text-gray-900 mt-2 border-t pt-2"><span className="">Grand Total :</span> <span>₹{totals.grandTotal.toFixed(2)}/-</span></div>
                                    <div className="flex justify-between w-64 text-blue-600 font-bold text-sm pt-1 border-t border-dashed"><span className="">Balance Due :</span> <span>₹{totals.remaining.toFixed(2)}/-</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={handleReset} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"><RefreshCw size={16} /> Full Reset</button>
                        <button onClick={() => setShowPreview(true)} disabled={cart.length === 0} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${cart.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Eye size={16} /> Preview</button>
                        <button onClick={handlePrint} disabled={cart.length === 0} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${cart.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}><Printer size={16} /> Print</button>
                        {cart.length > 0 && (<button onClick={handleSaveBill} className="px-6 py-2 bg-[#5ce1e6] text-[#03214a] rounded-full text-sm font-bold hover:bg-[#03214a] hover:text-white transition shadow-md flex items-center gap-2"><Save size={18} /> Save Sale Bill</button>)}
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={2000} />

                {/* --- HIDDEN INVOICE FOR PRINTING --- */}
                <div id="printable-invoice" style={{ display: 'none' }}>
                    <InvoiceTemplate bill={getBillData()} />
                </div>

                {/* --- PREVIEW MODAL --- */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg">Invoice Preview</h3>
                                <div className="flex gap-2">
                                    <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-blue-700"><Printer size={14} /> Print</button>
                                    <button onClick={() => setShowPreview(false)} className="bg-gray-200 text-gray-700 px-2 py-1.5 rounded hover:bg-gray-300"><X size={18} /></button>
                                </div>
                            </div>
                            <div className="overflow-y-auto p-8 bg-gray-200">
                                <div className="shadow-xl mx-auto max-w-[210mm]">
                                    <InvoiceTemplate bill={getBillData()} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

// --- INVOICE TEMPLATE ---
const InvoiceTemplate = ({ bill }) => {
    if (!bill) return null;
    const isDelivered = bill.orderStatus ? bill.orderStatus.delivered : true;
    return (
        <div className="invoice-box bg-white text-black font-sans text-sm">
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 uppercase tracking-wide">NxtEye Optical</h1>
                    <p className="text-gray-700 font-medium mt-1">1/118, South Street, Ramnad - 621708</p>
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
                        <p className="text-lg font-bold text-gray-900">{bill.customer?.customerName || "Walk-in Customer"}</p>
                        <p className="text-gray-700">{bill.customer?.address || "Address not provided"}</p>
                        <p className="text-gray-700">Mobile: <b>{bill.customer?.mobileNumber}</b></p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Details:</h3>
                        <p className="text-gray-700">Mode: {bill.paymentMethod}</p>
                        <p className={`mt-2 inline-block px-3 py-1 rounded font-bold border ${isDelivered ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>STATUS: {isDelivered ? "DELIVERED" : "ORDERED"}</p>
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
                        {bill.items.length < 5 && Array.from({ length: 5 - bill.items.length }).map((_, i) => (
                            <tr key={`empty-${i}`}><td className="border border-gray-300 p-3">&nbsp;</td><td className="border border-gray-300 p-3"></td><td className="border border-gray-300 p-3"></td><td className="border border-gray-300 p-3"></td><td className="border border-gray-300 p-3"></td><td className="border border-gray-300 p-3"></td><td className="border border-gray-300 p-3"></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-start mt-4">
                <div className="w-1/2 pr-8">
                    <div className="border-t border-b border-gray-300 py-2 my-2">
                        <p className="text-xs font-bold text-gray-500 uppercase">Amount in Words:</p>
                        <p className="text-sm font-semibold italic capitalize mt-1">{convertAmountToWords(bill.grandTotal)}</p>
                    </div>
                    <div className="mt-6 text-xs text-gray-600"><p className="font-bold">Terms & Conditions:</p><ul className="list-disc pl-4 mt-1 space-y-1"><li>Goods once sold cannot be returned or exchanged.</li><li>All disputes are subject to Ramnad jurisdiction.</li><li>This is a computer generated invoice.</li></ul></div>
                </div>
                <div className="w-1/2 pl-8">
                    <div className="space-y-2 text-right text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal:</span> <span>₹{safeAmount(bill.subTotal)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>CGST:</span> <span>₹{safeAmount(bill.totalCgstAmount)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>SGST:</span> <span>₹{safeAmount(bill.totalSgstAmount)}</span></div>
                        {Number(bill.discountAmount) > 0 && (<div className="flex justify-between text-red-600"><span>Discount:</span> <span>-₹{safeAmount(bill.discountAmount)}</span></div>)}
                        <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-2 mt-2 text-black"><span>Net Amount:</span> <span>₹{safeAmount(bill.grandTotal)}</span></div>
                        <div className="flex justify-between text-green-700 border-b border-gray-200 pb-2"><span>Advance Paid:</span> <span>-₹{safeAmount(bill.advance)}</span></div>
                        <div className="bg-gray-100 p-2 rounded mt-2 border border-gray-300"><div className="flex justify-between font-extrabold text-xl text-blue-900"><span>Balance To Pay:</span> <span>₹{safeAmount(bill.remaining)}</span></div></div>
                    </div>
                </div>
            </div>
            <div className="mt-auto pt-12">
                <div className="flex justify-between items-end"><div className="text-center"><p className="text-gray-400 text-xs">Customer Signature</p></div><div className="text-center"><p className="font-bold text-sm border-t border-gray-400 px-8 pt-1">Authorized Signatory</p><p className="text-xs text-gray-500">For NxtEye Optical</p></div></div>
                <div className="text-center text-xs text-gray-400 mt-6 border-t pt-2">Thank you for your patronage!</div>
            </div>
        </div>
    );
};

export default OrderSummary;