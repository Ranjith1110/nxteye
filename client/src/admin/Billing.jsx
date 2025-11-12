import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/dashboard/Layout";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const Billing = () => {
    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState("");
    const [customer, setCustomer] = useState({
        customerName: "",
        mobileNumber: "",
        gender: "",
        dob: "",
    });
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    const printRef = useRef();

    // Payment & Calculation Fields
    const [advance, setAdvance] = useState("");
    const [remaining, setRemaining] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [gst, setGst] = useState(12);
    const [total, setTotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    // Fetch Items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`${API_URL}/api/items`);
                const data = await res.json();
                setItems(data);
            } catch {
                toast.error("Failed to fetch items");
            }
        };
        fetchItems();
        setDate(new Date().toLocaleString());
    }, []);

    // Add to Cart
    const handleAddToCart = (item) => {
        if (cart.some((c) => c._id === item._id)) {
            return toast.info("Item already in cart");
        }
        setCart([...cart, item]);
        toast.success(`${item.itemName} added to cart`);
    };

    // Remove from Cart
    const handleRemoveFromCart = (id) => {
        setCart(cart.filter((i) => i._id !== id));
    };

    // Calculate Totals
    useEffect(() => {
        if (cart.length === 0) {
            setTotal(0);
            setGrandTotal(0);
            setRemaining(0);
            return;
        }

        let totalAmount = cart.reduce((sum, item) => sum + Number(item.itemPrice), 0);
        setTotal(totalAmount);

        const gstAmount = (totalAmount * gst) / 100;
        const discountAmount = (totalAmount * discount) / 100;
        const grand = totalAmount + gstAmount - Number(advance || 0) - discountAmount;
        const remain = totalAmount - Number(advance || 0);

        setGrandTotal(grand);
        setRemaining(remain);
    }, [cart, discount, gst, advance]);

    // Save Customer Info Only
    const handleSaveCustomer = async () => {
        if (!customer.customerName || !customer.mobileNumber) {
            return toast.warn("Enter customer name & mobile number");
        }
        try {
            await fetch(`${API_URL}/api/billing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customer)
            });
            toast.success("Customer saved successfully!");
        } catch (error) {
            console.error("Save Customer Error:", error);
            toast.error("Error saving customer info");
        }
    };

    // Reset Customer Info
    const handleReset = () => {
        setCustomer({
            customerName: "",
            mobileNumber: "",
            gender: "",
            dob: "",
        });
    };

    // Preview Invoice
    const handlePreview = () => {
        if (cart.length === 0) return toast.warn("Add at least one item to cart!");
        if (!customer.customerName || !customer.mobileNumber)
            return toast.warn("Please fill customer info first");
        setShowPreview(true);
    };

    // Print Invoice
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
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-header h1 { margin: 0; color: #333; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-details table { width: 100%; }
            .invoice-details td { padding: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .items-table th { background-color: #f4f4f4; }
            .totals { text-align: right; margin-top: 20px; }
            .totals p { margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; color: #333; }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>SALE INVOICE</h1>
            <p>Invoice No: ${invoiceNo || "N/A"}</p>
            <p>Date: ${date}</p>
          </div>
          <div class="invoice-details">
            <table>
              <tr>
                <td><strong>Customer Name:</strong></td>
                <td>${customer.customerName}</td>
                <td><strong>Mobile:</strong></td>
                <td>${customer.mobileNumber}</td>
              </tr>
              <tr>
                <td><strong>Gender:</strong></td>
                <td>${customer.gender || "N/A"}</td>
                <td><strong>DOB:</strong></td>
                <td>${customer.dob || "N/A"}</td>
              </tr>
            </table>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Item Name</th>
                <th>Item Price</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.itemName}</td>
                  <td>₹${item.itemPrice}/-</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="totals">
            <p>Total: ₹${total.toFixed(2)}/-</p>
            <p>GST (${gst}%): ₹${((total * gst) / 100).toFixed(2)}/-</p>
            <p>Discount (${discount}%): -₹${((total * discount) / 100).toFixed(2)}/-</p>
            <p>Advance: -₹${Number(advance || 0).toFixed(2)}/-</p>
            <p class="grand-total">Grand Total: ₹${grandTotal.toFixed(2)}/-</p>
            <p>Remaining: ₹${remaining.toFixed(2)}/-</p>
          </div>
          <script>
            window.onload = function() { 
              window.print(); 
            };
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    // Download PDF
    const handleDownloadPDF = () => {
        if (cart.length === 0) return toast.warn("Add at least one item to cart!");
        if (!customer.customerName || !customer.mobileNumber)
            return toast.warn("Please fill customer info first");

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("SALE INVOICE", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Invoice No: ${invoiceNo || "N/A"}`, 105, 30, { align: "center" });
        doc.text(`Date: ${date}`, 105, 36, { align: "center" });

        // Customer Details
        doc.setFontSize(12);
        doc.text("Customer Information:", 14, 50);
        doc.setFontSize(10);
        doc.text(`Name: ${customer.customerName}`, 14, 58);
        doc.text(`Mobile: ${customer.mobileNumber}`, 14, 64);
        doc.text(`Gender: ${customer.gender || "N/A"}`, 14, 70);
        doc.text(`DOB: ${customer.dob || "N/A"}`, 14, 76);

        // Items Table
        const tableData = cart.map((item, index) => [
            index + 1,
            item.itemName,
            `₹${item.itemPrice}/-`
        ]);

        doc.autoTable({
            startY: 85,
            head: [["Sl.No", "Item Name", "Item Price"]],
            body: tableData,
            theme: "grid",
            headStyles: { fillColor: [92, 225, 230] }
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Total: ₹${total.toFixed(2)}/-`, 150, finalY);
        doc.text(`GST (${gst}%): ₹${((total * gst) / 100).toFixed(2)}/-`, 150, finalY + 6);
        doc.text(`Discount (${discount}%): -₹${((total * discount) / 100).toFixed(2)}/-`, 150, finalY + 12);
        doc.text(`Advance: -₹${Number(advance || 0).toFixed(2)}/-`, 150, finalY + 18);

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}/-`, 150, finalY + 26);
        doc.text(`Remaining: ₹${remaining.toFixed(2)}/-`, 150, finalY + 34);

        doc.save(`Invoice_${invoiceNo || "Preview"}.pdf`);
        toast.success("PDF Downloaded Successfully!");
    };

    // Submit Bill
    const handleSubmit = async () => {
        if (cart.length === 0) return toast.warn("Add at least one item to cart!");
        if (!customer.customerName || !customer.mobileNumber)
            return toast.warn("Please fill customer info first");

        try {
            const res = await fetch(`${API_URL}/api/billing/invoice`);
            const data = await res.json();
            const generatedInvoice = data.invoiceNo;
            setInvoiceNo(generatedInvoice);

            const billData = {
                invoiceNo: generatedInvoice,
                date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                customer,
                items: cart,
                total,
                gst,
                discount,
                advance,
                remaining,
                grandTotal,
            };

            await fetch(`${API_URL}/api/billing/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(billData)
            });

            toast.success(`Bill submitted successfully (Invoice: ${generatedInvoice})`);
        } catch (error) {
            console.error("Submit Bill Error:", error);
            toast.error("Failed to submit bill");
        }
    };

    // Display limited items
    const displayedItems = showAllItems ? items : items.slice(0, 5);

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Sale Bill</h2>

                {/* Customer Info */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Customer Name
                            </label>
                            <input
                                type="text"
                                value={customer.customerName}
                                onChange={(e) =>
                                    setCustomer({ ...customer, customerName: e.target.value })
                                }
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Mobile Number
                            </label>
                            <input
                                type="text"
                                value={customer.mobileNumber}
                                onChange={(e) =>
                                    setCustomer({ ...customer, mobileNumber: e.target.value })
                                }
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Gender
                            </label>
                            <select
                                value={customer.gender}
                                onChange={(e) =>
                                    setCustomer({ ...customer, gender: e.target.value })
                                }
                                className="w-full mt-1 p-2 border rounded-md"
                            >
                                <option>Select</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                DOB
                            </label>
                            <input
                                type="date"
                                value={customer.dob}
                                onChange={(e) =>
                                    setCustomer({ ...customer, dob: e.target.value })
                                }
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleSaveCustomer}
                            className="bg-[#5ce1e6] text-[#03214a] px-4 py-2 rounded-full font-medium hover:bg-[#03214a] hover:text-white transition"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Invoice & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Invoice No
                        </label>
                        <input
                            type="text"
                            value={invoiceNo}
                            readOnly
                            placeholder="Will generate on Submit"
                            className="w-full mt-1 p-2 border rounded-md bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Date</label>
                        <input
                            type="text"
                            value={date}
                            readOnly
                            className="w-full mt-1 p-2 border rounded-md bg-gray-100"
                        />
                    </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Items</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Sl.No</th>
                                    <th className="border p-2">Item Number</th>
                                    <th className="border p-2">Item Name</th>
                                    <th className="border p-2">Item Price</th>
                                    <th className="border p-2">GST%</th>
                                    <th className="border p-2">Add to Cart</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedItems.map((item, index) => (
                                    <tr key={item._id}>
                                        <td className="border p-2 text-center">{index + 1}</td>
                                        <td className="border p-2">{item.itemNumber}</td>
                                        <td className="border p-2">{item.itemName}</td>
                                        <td className="border p-2 text-center">{item.itemPrice}/-</td>
                                        <td className="border p-2 text-center">{item.gst}%</td>
                                        <td className="border p-2 text-center">
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className="flex items-center justify-center bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition mx-auto"
                                            >
                                                <Plus size={16} className="mr-1" /> Add Item
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Show More/Less Button */}
                    {items.length > 5 && (
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
                                        Show More ({items.length - 5} more items) <ChevronDown size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                    <>
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Cart</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border p-2">Sl.No</th>
                                            <th className="border p-2">Item Name</th>
                                            <th className="border p-2">Item Price</th>
                                            <th className="border p-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item, index) => (
                                            <tr key={item._id}>
                                                <td className="border p-2 text-center">{index + 1}</td>
                                                <td className="border p-2">{item.itemName}</td>
                                                <td className="border p-2 text-center">{item.itemPrice}/-</td>
                                                <td className="border p-2 text-center">
                                                    <button
                                                        onClick={() => handleRemoveFromCart(item._id)}
                                                        className="flex items-center justify-center bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition mx-auto"
                                                    >
                                                        <Trash2 size={14} className="mr-1" /> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment & Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Advance
                                </label>
                                <input
                                    type="number"
                                    value={advance}
                                    onChange={(e) => setAdvance(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Remaining
                                </label>
                                <input
                                    type="number"
                                    value={remaining.toFixed(2)}
                                    readOnly
                                    className="w-full mt-1 p-2 border rounded-md bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Discount (%)
                                </label>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="text-right text-sm font-medium text-gray-700 mt-6">
                            <p>Total : <span className="font-semibold">{total.toFixed(2)}/-</span></p>
                            <p>GST (12%) : <span className="font-semibold">{gst}%</span></p>
                            <p>Discount : <span className="font-semibold">{discount}%</span></p>
                            <p>Grand Total : <span className="font-semibold">{grandTotal.toFixed(2)}/-</span></p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 flex-wrap">
                            <button
                                onClick={handlePreview}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
                            >
                                Preview
                            </button>
                            <button
                                onClick={handlePrint}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                            >
                                Print
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                            >
                                Download PDF
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-[#5ce1e6] hover:bg-[#03214a] text-[#03214a] hover:text-white px-4 py-2 rounded-md font-semibold transition"
                            >
                                Submit
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
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="border-b pb-4 mb-4">
                                <p className="text-center text-lg font-semibold">SALE INVOICE</p>
                                <p className="text-center text-sm">Invoice No: {invoiceNo || "N/A"}</p>
                                <p className="text-center text-sm">Date: {date}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Customer Information:</h3>
                                <p><strong>Name:</strong> {customer.customerName}</p>
                                <p><strong>Mobile:</strong> {customer.mobileNumber}</p>
                                <p><strong>Gender:</strong> {customer.gender || "N/A"}</p>
                                <p><strong>DOB:</strong> {customer.dob || "N/A"}</p>
                            </div>

                            <table className="w-full border-collapse border mb-4">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2">Sl.No</th>
                                        <th className="border p-2">Item Name</th>
                                        <th className="border p-2">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, index) => (
                                        <tr key={item._id}>
                                            <td className="border p-2 text-center">{index + 1}</td>
                                            <td className="border p-2">{item.itemName}</td>
                                            <td className="border p-2 text-right">₹{item.itemPrice}/-</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="text-right space-y-1">
                                <p>Total: ₹{total.toFixed(2)}/-</p>
                                <p>GST ({gst}%): ₹{((total * gst) / 100).toFixed(2)}/-</p>
                                <p>Discount ({discount}%): -₹{((total * discount) / 100).toFixed(2)}/-</p>
                                <p>Advance: -₹{Number(advance || 0).toFixed(2)}/-</p>
                                <p className="text-lg font-bold">Grand Total: ₹{grandTotal.toFixed(2)}/-</p>
                                <p>Remaining: ₹{remaining.toFixed(2)}/-</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                >
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