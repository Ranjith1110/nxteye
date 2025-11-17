import React, { useState, useEffect } from "react";
import Layout from "../components/dashboard/Layout";
import { Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const COMPANY_INFO = {
    name: "NxtEye Optical",
    address: "1/118, South Street, Ramnad - 621708",
    phone: "9988997689",
    gstin: "33ABCDE1234F1Z5",
    logoUrl: "/assets/dashboard/nxteye-logo.png"
};

const Billing = () => {
    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState("");
    const [customer, setCustomer] = useState({
        customerName: "",
        mobileNumber: "",
        gender: "",
        dob: "",
        address: "", // <--- Added State
        purposeOfVisit: "",
    });
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("itemName");

    // Payment & Calculation Fields
    const [advance, setAdvance] = useState("");
    const [remaining, setRemaining] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [total, setTotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    const [paymentMethod, setPaymentMethod] = useState("Cash");

    const [discountAmount, setDiscountAmount] = useState(0);
    const [totalCgstAmount, setTotalCgstAmount] = useState(0);
    const [totalSgstAmount, setTotalSgstAmount] = useState(0);

    // Fetch Items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`${API_URL}/api/items`);
                const data = await res.json();

                const itemsWithDetails = data.map(item => ({
                    ...item,
                    cgst: item.cgst || 9,
                    sgst: item.sgst || 9,
                    hsn: item.hsn || "9003"
                }));
                setItems(itemsWithDetails);
            } catch {
                toast.error("Failed to fetch items");
            }
        };
        fetchItems();
        setDate(new Date().toLocaleString());
    }, []);

    const fetchInvoiceNumber = async () => {
        if (invoiceNo) return invoiceNo;
        try {
            const res = await fetch(`${API_URL}/api/billing/invoice`);
            const data = await res.json();
            setInvoiceNo(data.invoiceNo);
            return data.invoiceNo;
        } catch (error) {
            console.error("Failed to fetch invoice number:", error);
            toast.error("Error generating invoice number");
            return null;
        }
    };

    const handleAddToCart = async (item) => {
        if (cart.some((c) => c._id === item._id)) {
            return toast.info("Item already in cart");
        }

        await fetchInvoiceNumber();

        const itemToAdd = {
            ...item,
            cgst: item.cgst || 0,
            sgst: item.sgst || 0,
            hsn: item.hsn || "9003"
        };
        setCart([...cart, itemToAdd]);
        toast.success(`${item.itemName} added to cart`);
    };

    const handleRemoveFromCart = (id) => {
        setCart(cart.filter((i) => i._id !== id));
    };

    // Calculate Totals
    useEffect(() => {
        if (cart.length === 0) {
            setTotal(0);
            setGrandTotal(0);
            setRemaining(0);
            setDiscountAmount(0);
            setTotalCgstAmount(0);
            setTotalSgstAmount(0);
            return;
        }

        let subTotal = 0;
        let cgstAmt = 0;
        let sgstAmt = 0;

        cart.forEach(item => {
            const itemPrice = Number(item.itemPrice);
            subTotal += itemPrice;
            cgstAmt += (itemPrice * (Number(item.cgst || 0) / 100));
            sgstAmt += (itemPrice * (Number(item.sgst || 0) / 100));
        });

        const totalWithTax = subTotal + cgstAmt + sgstAmt;
        const calculatedDiscount = (totalWithTax * (Number(discount || 0) / 100));
        const grand = totalWithTax - calculatedDiscount - Number(advance || 0);
        const remain = totalWithTax - Number(advance || 0);

        setTotal(subTotal);
        setTotalCgstAmount(cgstAmt);
        setTotalSgstAmount(sgstAmt);
        setDiscountAmount(calculatedDiscount);
        setGrandTotal(grand);
        setRemaining(remain < 0 ? 0 : remain);

    }, [cart, discount, advance]);

    const handleSaveCustomer = async () => {
        if (!customer.customerName || !customer.mobileNumber) {
            return toast.warn("Enter customer name & mobile number");
        }
        try {
            await fetch(`${API_URL}/api/customers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customer),
            });
            toast.success("Customer saved successfully!");
        } catch (error) {
            console.error("Save Customer Error:", error);
            toast.error("Error saving customer info");
        }
    };

    const handleReset = () => {
        setCustomer({
            customerName: "",
            mobileNumber: "",
            gender: "",
            dob: "",
            address: "", // <--- Reset Address
            purposeOfVisit: "",
        });
    };

    const handleFullReset = () => {
        handleReset();
        setCart([]);
        setInvoiceNo("");
        setAdvance("");
        setRemaining(0);
        setDiscount(0);
        setPaymentMethod("Cash");
        setTotal(0);
        setGrandTotal(0);
        setSearchTerm("");
        setDiscountAmount(0);
        setTotalCgstAmount(0);
        setTotalSgstAmount(0);
        toast.info("Form fully reset");
    };

    const handlePreview = () => {
        if (cart.length === 0) return toast.warn("Add at least one item to cart!");
        if (!customer.customerName || !customer.mobileNumber)
            return toast.warn("Please fill customer info first");
        setShowPreview(true);
    };

    // --- UPDATED PRINT FUNCTION WITH ADDRESS ---
    const handlePrint = () => {
        if (cart.length === 0) return toast.warn("Add at least one item to cart!");
        if (!customer.customerName || !customer.mobileNumber)
            return toast.warn("Please fill customer info first");

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNo || "Preview"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
            .header-container { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .company-details { text-align: left; }
            .company-details h1 { margin: 0; color: #03214a; font-size: 24px; }
            .company-details p { margin: 2px 0; color: #555; }
            .logo-img { height: 60px; width: auto; }
            .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f9f9f9; padding: 10px; border-radius: 5px; }
            .invoice-details table { width: 100%; margin-bottom: 20px; }
            .invoice-details td { padding: 4px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #5ce1e6; color: #03214a; }
            .totals { text-align: right; margin-top: 20px; }
            .totals p { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; color: #03214a; border-top: 1px solid #ccc; padding-top: 5px; }
            @media print { body { padding: 0; } .items-table th { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company-details">
                <h1>${COMPANY_INFO.name}</h1>
                <p>${COMPANY_INFO.address}</p>
                <p>Phone: ${COMPANY_INFO.phone}</p>
                <p><strong>GSTIN: ${COMPANY_INFO.gstin}</strong></p>
            </div>
            <img src="${COMPANY_INFO.logoUrl}" alt="Logo" class="logo-img" />
          </div>

          <div class="invoice-meta">
            <div>
                <strong>Invoice No:</strong> ${invoiceNo || "N/A"}<br>
                <strong>Date:</strong> ${date}
            </div>
            <div style="text-align:right;">
                <strong>Payment Method:</strong> ${paymentMethod}
            </div>
          </div>

          <div class="invoice-details">
            <h3>Customer Details</h3>
            <table>
              <tr>
                <td><strong>Name:</strong> ${customer.customerName}</td>
                <td><strong>Mobile:</strong> ${customer.mobileNumber}</td>
              </tr>
              <tr>
                <td><strong>Gender:</strong> ${customer.gender || "-"}</td>
                <td><strong>DOB:</strong> ${customer.dob || "-"}</td>
              </tr>
              <tr>
                <td><strong>Address:</strong> ${customer.address || "-"}</td> 
                <td><strong>Purpose:</strong> ${customer.purposeOfVisit || "-"}</td>
              </tr>
            </table>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>HSN</th> <th>CGST</th>
                <th>SGST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map((item, index) => {
            const itemPrice = Number(item.itemPrice);
            const cgst = (itemPrice * (Number(item.cgst || 0) / 100));
            const sgst = (itemPrice * (Number(item.sgst || 0) / 100));
            const itemTotal = itemPrice + cgst + sgst;
            return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.itemName}</td>
                  <td>₹${itemPrice.toFixed(2)}</td>
                  <td>${item.hsn}</td> <td>₹${cgst.toFixed(2)} (${item.cgst}%)</td>
                  <td>₹${sgst.toFixed(2)} (${item.sgst}%)</td>
                  <td>₹${itemTotal.toFixed(2)}</td>
                </tr>
              `
        }).join("")}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: ₹${total.toFixed(2)}</p>
            <p>CGST: ₹${totalCgstAmount.toFixed(2)}</p>
            <p>SGST: ₹${totalSgstAmount.toFixed(2)}</p>
            <p>Discount (${discount}%): -₹${discountAmount.toFixed(2)}</p>
            <p>Advance: -₹${Number(advance || 0).toFixed(2)}</p>
            <p class="grand-total">Grand Total: ₹${grandTotal.toFixed(2)}</p>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #777;">
            <p>Thank you for your business!</p>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    // --- UPDATED PDF DOWNLOAD WITH ADDRESS ---
    const handleDownloadPDF = () => {
        if (cart.length === 0) return toast.warn("Add at least one item to cart!");
        if (!customer.customerName || !customer.mobileNumber)
            return toast.warn("Please fill customer info first");

        const doc = new jsPDF();

        doc.setTextColor(3, 33, 74);
        doc.setFontSize(18);
        doc.text(COMPANY_INFO.name, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(COMPANY_INFO.address, 14, 26);
        doc.text(`Phone: ${COMPANY_INFO.phone}`, 14, 31);
        doc.text(`GSTIN: ${COMPANY_INFO.gstin}`, 14, 36);

        doc.setDrawColor(200);
        doc.line(14, 42, 196, 42);

        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text("TAX INVOICE", 196, 25, { align: "right" });
        doc.setFontSize(10);
        doc.text(`Invoice No: ${invoiceNo || "N/A"}`, 196, 32, { align: "right" });
        doc.text(`Date: ${date}`, 196, 37, { align: "right" });

        // --- UPDATED CUSTOMER DETAILS IN PDF ---
        doc.text("Bill To:", 14, 52);
        doc.setFont(undefined, "bold");
        doc.text(customer.customerName, 14, 58);
        doc.setFont(undefined, "normal");
        doc.text(`Mobile: ${customer.mobileNumber}`, 14, 64);
        doc.text(`Address: ${customer.address || ""}`, 14, 70); // Added Address Line
        doc.text(`Payment Mode: ${paymentMethod}`, 14, 76);

        const tableData = cart.map((item, index) => {
            const itemPrice = Number(item.itemPrice);
            const cgst = (itemPrice * (Number(item.cgst || 0) / 100));
            const sgst = (itemPrice * (Number(item.sgst || 0) / 100));
            const itemTotal = itemPrice + cgst + sgst;
            return [
                index + 1,
                item.itemName,
                `₹${itemPrice.toFixed(2)}`,
                item.hsn,
                `₹${cgst.toFixed(2)}`,
                `₹${sgst.toFixed(2)}`,
                `₹${itemTotal.toFixed(2)}`
            ];
        });

        doc.autoTable({
            startY: 85, // Shifted down slightly to fit Address
            head: [["Sl", "Item Name", "Price", "HSN", "CGST", "SGST", "Total"]],
            body: tableData,
            theme: "grid",
            headStyles: { fillColor: [92, 225, 230], textColor: [3, 33, 74] },
            styles: { fontSize: 9 }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        const rightMargin = 196;

        doc.text(`Subtotal:`, 140, finalY);
        doc.text(`₹${total.toFixed(2)}`, rightMargin, finalY, { align: "right" });
        doc.text(`CGST:`, 140, finalY + 6);
        doc.text(`₹${totalCgstAmount.toFixed(2)}`, rightMargin, finalY + 6, { align: "right" });
        doc.text(`SGST:`, 140, finalY + 12);
        doc.text(`₹${totalSgstAmount.toFixed(2)}`, rightMargin, finalY + 12, { align: "right" });
        doc.text(`Discount (${discount}%):`, 140, finalY + 18);
        doc.text(`-₹${discountAmount.toFixed(2)}`, rightMargin, finalY + 18, { align: "right" });
        doc.text(`Advance:`, 140, finalY + 24);
        doc.text(`-₹${Number(advance || 0).toFixed(2)}`, rightMargin, finalY + 24, { align: "right" });

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(`Grand Total:`, 140, finalY + 34);
        doc.text(`₹${grandTotal.toFixed(2)}`, rightMargin, finalY + 34, { align: "right" });

        doc.save(`Invoice_${invoiceNo || "Preview"}.pdf`);
        toast.success("PDF Downloaded Successfully!");
    };

    const handleSubmit = async () => {
        if (cart.length === 0) return toast.warn("Add at least one item to cart!");
        if (!customer.customerName || !customer.mobileNumber)
            return toast.warn("Please fill customer info first");

        try {
            const currentInvoiceNo = await fetchInvoiceNumber();
            if (!currentInvoiceNo) return toast.error("Could not generate invoice number. Please try again.");

            const billData = {
                invoiceNo: currentInvoiceNo,
                date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                customer,
                items: cart,
                subTotal: total,
                totalCgstAmount,
                totalSgstAmount,
                discountPercent: discount,
                discountAmount,
                advance,
                paymentMethod,
                remaining,
                grandTotal,
            };

            await fetch(`${API_URL}/api/billing/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(billData)
            });

            toast.success(`Bill submitted successfully (Invoice: ${currentInvoiceNo})`);
            handleFullReset();
        } catch (error) {
            console.error("Submit Bill Error:", error);
            toast.error("Failed to submit bill");
        }
    };

    const filteredItems = items.filter((item) => {
        if (searchTerm === "") return true;
        const searchField = filterType === 'itemName' ? item.itemName : item.itemNumber;
        return searchField.toLowerCase().includes(searchTerm.toLowerCase());
    });
    const displayedItems = showAllItems ? filteredItems : filteredItems.slice(0, 5);

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Sale Bill</h2>

                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Customer Name</label>
                            <input type="text" value={customer.customerName} onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
                            <input type="text" value={customer.mobileNumber} onChange={(e) => setCustomer({ ...customer, mobileNumber: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Purpose of Visit</label>
                            <select value={customer.purposeOfVisit} onChange={(e) => setCustomer({ ...customer, purposeOfVisit: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                                <option value="">Select Purpose</option>
                                <option value="Purchase">Purchase</option>
                                <option value="Inquiry">Inquiry</option>
                                <option value="Service/Repair">Service/Repair</option>
                                <option value="Browsing">Browsing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Gender</label>
                            <select value={customer.gender} onChange={(e) => setCustomer({ ...customer, gender: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">DOB</label>
                            <input type="date" value={customer.dob} onChange={(e) => setCustomer({ ...customer, dob: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
                        </div>

                        {/* --- NEW ADDRESS INPUT --- */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-600">Address</label>
                            <input type="text" placeholder="City / Street" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button onClick={handleSaveCustomer} className="bg-[#5ce1e6] text-[#03214a] px-4 py-2 rounded-full font-medium hover:bg-[#03214a] hover:text-white transition">
                            Save Customer
                        </button>
                        <button onClick={handleReset} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition">
                            <RefreshCw size={16} />
                            Reset Info
                        </button>
                    </div>
                </div>

                {/* Invoice & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Invoice No</label>
                        <input type="text" value={invoiceNo} readOnly placeholder="Generates when item is added to cart" className="w-full mt-1 p-2 border rounded-md bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Date</label>
                        <input type="text" value={date} readOnly className="w-full mt-1 p-2 border rounded-md bg-gray-100" />
                    </div>
                </div>

                {/* Items Selection Table */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Items</h3>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-600">Search Item</label>
                            <input type="text" placeholder={`Search by ${filterType === 'itemName' ? 'Name' : 'Number'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        <div className="w-1/4">
                            <label className="block text-sm font-medium text-gray-600">Search By</label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                                <option value="itemName">Item Name</option>
                                <option value="itemNumber">Item Number</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-t-lg border border-gray-200">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 border-b text-left">Sl.No</th>
                                    <th className="px-4 py-3 border-b text-left">Item Number</th>
                                    <th className="px-4 py-3 border-b text-left">Item Name</th>
                                    <th className="px-4 py-3 border-b text-left">Item Price</th>
                                    <th className="px-4 py-3 border-b text-left">HSN</th>
                                    <th className="px-4 py-3 border-b text-left">CGST%</th>
                                    <th className="px-4 py-3 border-b text-left">SGST%</th>
                                    <th className="px-4 py-3 border-b text-center">Add to Cart</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedItems.map((item, index) => (
                                    <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-left">{index + 1}</td>
                                        <td className="px-4 py-3">{item.itemNumber}</td>
                                        <td className="px-4 py-3">{item.itemName}</td>
                                        <td className="px-4 py-3 text-left">₹{item.itemPrice}/-</td>
                                        <td className="px-4 py-3 text-left">{item.hsn}</td>
                                        <td className="px-4 py-3 text-left">{item.cgst || 0}%</td>
                                        <td className="px-4 py-3 text-left">{item.sgst || 0}%</td>
                                        <td className="px-4 py-3 text-left">
                                            <button onClick={() => handleAddToCart(item)} className="flex items-center justify-center bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition mx-auto">
                                                <Plus size={16} className="mr-1" /> Add Item
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredItems.length > 5 && (
                        <div className="flex justify-center mt-4">
                            <button onClick={() => setShowAllItems(!showAllItems)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition">
                                {showAllItems ? <><span className="mr-1">Show Less</span><ChevronUp size={18} /></> : <><span className="mr-1">Show More ({filteredItems.length - 5} more items)</span><ChevronDown size={18} /></>}
                            </button>
                        </div>
                    )}
                </div>

                {/* Cart Section */}
                {cart.length > 0 && (
                    <>
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Cart</h3>
                            <div className="mt-4 overflow-x-auto rounded-t-lg border border-gray-200">
                                <table className="min-w-full text-sm text-left text-gray-700">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 border-b">Sl.No</th>
                                            <th className="px-4 py-3 border-b">Item Name</th>
                                            <th className="px-4 py-3 border-b">Price</th>
                                            <th className="px-4 py-3 border-b">HSN</th>
                                            <th className="px-4 py-3 border-b">CGST</th>
                                            <th className="px-4 py-3 border-b">SGST</th>
                                            <th className="px-4 py-3 border-b">Total</th>
                                            <th className="px-4 py-3 border-b text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item, index) => {
                                            const itemPrice = Number(item.itemPrice);
                                            const cgst = (itemPrice * (Number(item.cgst || 0) / 100));
                                            const sgst = (itemPrice * (Number(item.sgst || 0) / 100));
                                            const itemTotal = itemPrice + cgst + sgst;
                                            return (
                                                <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-left">{index + 1}</td>
                                                    <td className="px-4 py-3">{item.itemName}</td>
                                                    <td className="px-4 py-3 text-left">₹{itemPrice.toFixed(2)}/-</td>
                                                    <td className="px-4 py-3 text-left">{item.hsn}</td>
                                                    <td className="px-4 py-3 text-left">₹{cgst.toFixed(2)}/-</td>
                                                    <td className="px-4 py-3 text-left">₹{sgst.toFixed(2)}/-</td>
                                                    <td className="px-4 py-3 text-left">₹{itemTotal.toFixed(2)}/-</td>
                                                    <td className="px-4 py-3 text-left">
                                                        <button onClick={() => handleRemoveFromCart(item._id)} className="flex items-center justify-center bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition mx-auto">
                                                            <Trash2 size={14} className="mr-1" /> Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Advance</label>
                                <input type="number" placeholder="Enter advance amount" value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Discount (%)</label>
                                <input type="number" placeholder="Enter discount %" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full mt-1 p-2 border rounded-md">
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Remaining (Pre-discount)</label>
                                <input type="number" value={remaining.toFixed(2)} readOnly className="w-full mt-1 p-2 border rounded-md bg-gray-100" />
                            </div>
                        </div>

                        {/* Totals Display */}
                        <div className="text-right text-sm font-medium text-gray-700 mt-6 space-y-1">
                            <p>Subtotal : <span className="font-semibold text-base">₹{total.toFixed(2)}/-</span></p>
                            <p>Total CGST : <span className="font-semibold text-base">₹{totalCgstAmount.toFixed(2)}/-</span></p>
                            <p>Total SGST : <span className="font-semibold text-base">₹{totalSgstAmount.toFixed(2)}/-</span></p>
                            <p className="text-blue-600">Total (with Tax) : <span className="font-semibold text-base">₹{(total + totalCgstAmount + totalSgstAmount).toFixed(2)}/-</span></p>
                            <p className="text-red-600">Discount ({discount}%) : <span className="font-semibold text-base">-₹{discountAmount.toFixed(2)}/-</span></p>
                            <p className="text-green-600">Advance Paid : <span className="font-semibold text-base">-₹{Number(advance || 0).toFixed(2)}/-</span></p>
                            <p className="text-xl font-bold text-black mt-2">Grand Total : <span className="font-bold">₹{grandTotal.toFixed(2)}/-</span></p>
                        </div>

                        {/* Button Group */}
                        <div className="flex justify-end gap-3 mt-6 flex-wrap">
                            <button onClick={handleFullReset} className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-full transition">
                                <RefreshCw size={16} /> Full Reset
                            </button>
                            <button onClick={handlePreview} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full transition">
                                Preview
                            </button>
                            <button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition">
                                Print
                            </button>
                            <button onClick={handleDownloadPDF} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition">
                                Download PDF
                            </button>
                            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md">
                               <Save size={18} /> Save Sale Bill
                            </button>
                        </div>
                    </>
                )}

                {/* Preview Modal */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Invoice Preview</h2>
                                <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
                            </div>
                            <div className="border-b pb-4 mb-4">
                                <div className="text-center mb-2">
                                    <h3 className="font-bold text-xl">{COMPANY_INFO.name}</h3>
                                    <p className="text-sm text-gray-600">{COMPANY_INFO.address}</p>
                                    <p className="text-sm text-gray-600">GSTIN: {COMPANY_INFO.gstin}</p>
                                </div>
                                <p className="text-center text-sm font-bold mt-2">SALE INVOICE</p>
                                <p className="text-center text-sm">Invoice No: {invoiceNo || "N/A"}</p>
                                <p className="text-center text-sm">Date: {date}</p>
                            </div>
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Customer Information:</h3>
                                <p><strong>Name:</strong> {customer.customerName}</p>
                                <p><strong>Mobile:</strong> {customer.mobileNumber}</p>
                                <p><strong>Gender:</strong> {customer.gender || "N/A"}</p>
                                <p><strong>Address:</strong> {customer.address || "N/A"}</p>
                                <p><strong>Payment Method:</strong> {paymentMethod}</p>
                            </div>
                            <table className="w-full border-collapse border mb-4">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2">Sl.No</th>
                                        <th className="border p-2">Item Name</th>
                                        <th className="border p-2">Price</th>
                                        <th className="border p-2">HSN</th>
                                        <th className="border p-2">CGST</th>
                                        <th className="border p-2">SGST</th>
                                        <th className="border p-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, index) => {
                                        const itemPrice = Number(item.itemPrice);
                                        const cgst = (itemPrice * (Number(item.cgst || 0) / 100));
                                        const sgst = (itemPrice * (Number(item.sgst || 0) / 100));
                                        const itemTotal = itemPrice + cgst + sgst;
                                        return (
                                            <tr key={item._id}>
                                                <td className="border p-2 text-center">{index + 1}</td>
                                                <td className="border p-2">{item.itemName}</td>
                                                <td className="border p-2 text-right">₹{itemPrice.toFixed(2)}/-</td>
                                                <td className="border p-2 text-center">{item.hsn}</td>
                                                <td className="border p-2 text-right">₹{cgst.toFixed(2)}/-</td>
                                                <td className="border p-2 text-right">₹{sgst.toFixed(2)}/-</td>
                                                <td className="border p-2 text-right">₹{itemTotal.toFixed(2)}/-</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <div className="text-right space-y-1">
                                <p>Subtotal: ₹{total.toFixed(2)}/-</p>
                                <p>CGST: ₹{totalCgstAmount.toFixed(2)}/-</p>
                                <p>SGST: ₹{totalSgstAmount.toFixed(2)}/-</p>
                                <p>Discount ({discount}%): -₹{discountAmount.toFixed(2)}/-</p>
                                <p>Advance: -₹{Number(advance || 0).toFixed(2)}/-</p>
                                <p className="text-lg font-bold">Grand Total: ₹{grandTotal.toFixed(2)}/-</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowPreview(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer position="top-right" autoClose={2000} />
            </div>
        </Layout>
    );
};

export default Billing;