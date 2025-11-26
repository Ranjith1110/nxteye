import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/dashboard/Layout';
import { Plus, Trash2, Save, RefreshCw, History } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const PurchaseBill = () => {
  const navigate = useNavigate();

  // --- State: Vendor Info ---
  const [vendor, setVendor] = useState({
    vendorName: "",
    address: "",
    gstin: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: ""
  });

  // --- State: Items List ---
  const [items, setItems] = useState([]);

  // --- State: Current Item Input ---
  const [currentItem, setCurrentItem] = useState({
    itemName: "",
    itemType: "",
    hsn: "",
    itemPrice: "", // Basic Price
    stock: "",     // Quantity
    gstPercent: 0,
    cgstPercent: 0,
    sgstPercent: 0,
    taxAmount: 0,
    netAmount: 0
  });

  // --- State: Grand Total ---
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- Handlers: Vendor ---
  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendor(prev => ({ ...prev, [name]: value }));
  };

  // --- Handlers: Item Input & Calculations ---
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    // Convert numbers
    if (['itemPrice', 'stock', 'gstPercent', 'cgstPercent', 'sgstPercent'].includes(name)) {
      val = parseFloat(value) || 0;
    }

    setCurrentItem(prev => {
      const updated = { ...prev, [name]: val };

      // --- Auto-Calculate CGST & SGST if GST changes ---
      if (name === 'gstPercent') {
        updated.cgstPercent = val / 2;
        updated.sgstPercent = val / 2;
      }

      // --- Calculate Amounts ---
      const price = parseFloat(updated.itemPrice) || 0;
      const stock = parseFloat(updated.stock) || 0; // "Stock" here acts as Quantity
      const gst = parseFloat(updated.gstPercent) || 0;

      const baseTotal = price * stock;
      const taxAmt = baseTotal * (gst / 100);
      const net = baseTotal + taxAmt;

      return {
        ...updated,
        taxAmount: taxAmt.toFixed(2),
        netAmount: net.toFixed(2)
      };
    });
  };

  // --- Add Item ---
  const handleAddItem = () => {
    if (!currentItem.itemName || !currentItem.itemPrice || !currentItem.stock) {
      toast.warn("Please enter Item Name, Price, and Stock (Qty)");
      return;
    }
    setItems([...items, { ...currentItem, id: Date.now() }]);

    // Reset Current Item
    setCurrentItem({
      itemName: "",
      itemType: "",
      hsn: "",
      itemPrice: "",
      stock: "",
      gstPercent: 0,
      cgstPercent: 0,
      sgstPercent: 0,
      taxAmount: 0,
      netAmount: 0
    });
  };

  // --- Remove Item ---
  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // --- Calculate Grand Total ---
  useEffect(() => {
    const total = items.reduce((acc, curr) => acc + parseFloat(curr.netAmount || 0), 0);
    setGrandTotal(total);
  }, [items]);

  // --- SUBMIT TO DATABASE ---
  const handleSubmit = async () => {
    if (items.length === 0) return toast.warn("Please add items to the bill");
    if (!vendor.vendorName || !vendor.invoiceNumber) return toast.warn("Please fill Vendor Name and Invoice Number");

    const payload = {
      vendor,
      items,
      grandTotal
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/purchase-bills/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Purchase Bill Saved Successfully!");
        // Reset Form
        setItems([]);
        setVendor({
          vendorName: "",
          address: "",
          gstin: "",
          purchaseDate: new Date().toISOString().split('T')[0],
          invoiceNumber: ""
        });
        setGrandTotal(0);
      } else {
        toast.error(data.message || "Failed to save bill");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Purchase Bill Entry</h2>
            <p className="text-sm text-gray-500">Add new stock inventory from vendors</p>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/purchase-history')}
              className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50"
            >
              <History size={18} /> History
            </button>
            <div className="text-right pl-4 border-l-2 border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase">Total Amount</p>
              <h3 className="text-2xl font-bold text-blue-600">₹{grandTotal.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* --- SECTION 1: VENDOR INFO --- */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Vendor Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Vendor Name</label>
              <input
                type="text" name="vendorName" value={vendor.vendorName} onChange={handleVendorChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter Vendor Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">GST Number</label>
              <input
                type="text" name="gstin" value={vendor.gstin} onChange={handleVendorChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Example: 33ABCDE1234F1Z5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Invoice Number</label>
              <input
                type="text" name="invoiceNumber" value={vendor.invoiceNumber} onChange={handleVendorChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter Invoice No"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Address</label>
              <input
                type="text" name="address" value={vendor.address} onChange={handleVendorChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Vendor Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Purchase Date</label>
              <input
                type="date" name="purchaseDate" value={vendor.purchaseDate} onChange={handleVendorChange}
                className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: ITEMS ENTRY --- */}
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Add Items</h3>

          {/* Input Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-blue-50 p-3 rounded-md border border-blue-100">

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Item Name</label>
              <input
                type="text" name="itemName" value={currentItem.itemName} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="Name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Item Type</label>
              <input
                type="text" name="itemType" value={currentItem.itemType} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="Type"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">Price</label>
              <input
                type="number" name="itemPrice" value={currentItem.itemPrice} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="0.00"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">HSN</label>
              <input
                type="text" name="hsn" value={currentItem.hsn} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="HSN"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">GST %</label>
              <input
                type="number" name="gstPercent" value={currentItem.gstPercent} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="0"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">CGST %</label>
              <input
                type="number" name="cgstPercent" value={currentItem.cgstPercent} readOnly
                className="w-full p-2 border rounded text-sm bg-gray-100 text-gray-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">SGST %</label>
              <input
                type="number" name="sgstPercent" value={currentItem.sgstPercent} readOnly
                className="w-full p-2 border rounded text-sm bg-gray-100 text-gray-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">Stock</label>
              <input
                type="number" name="stock" value={currentItem.stock} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="Qty"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">Amount</label>
              <input
                type="number" name="netAmount" value={currentItem.netAmount} readOnly
                className="w-full p-2 border rounded text-sm bg-gray-100 font-bold text-blue-600"
              />
            </div>

            <div className="md:col-span-1 flex justify-center">
              <button
                onClick={handleAddItem}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition w-full flex justify-center"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4 overflow-x-auto rounded-t-lg border border-gray-200">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-3 border-b">SNo</th>
                  <th className="px-4 py-3 border-b">Name</th>
                  <th className="px-4 py-3 border-b">Type</th>
                  <th className="px-4 py-3 border-b">HSN</th>
                  <th className="px-4 py-3 border-b text-right">Price</th>
                  <th className="px-4 py-3 border-b text-center">GST%</th>
                  <th className="px-4 py-3 border-b text-center">CGST%</th>
                  <th className="px-4 py-3 border-b text-center">SGST%</th>
                  <th className="px-4 py-3 border-b text-center">Stock</th>
                  <th className="px-4 py-3 border-b text-right">Total</th>
                  <th className="px-4 py-3 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-4 py-6 text-center text-gray-500">No items added yet.</td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">{index + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-2">{item.itemType || "-"}</td>
                      <td className="px-4 py-2">{item.hsn || "-"}</td>
                      <td className="px-4 py-2 text-right">{item.itemPrice}</td>
                      <td className="px-4 py-2 text-center">{item.gstPercent}%</td>
                      <td className="px-4 py-2 text-center text-gray-500">{item.cgstPercent}%</td>
                      <td className="px-4 py-2 text-center text-gray-500">{item.sgstPercent}%</td>
                      <td className="px-4 py-2 text-center">{item.stock}</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-600">₹{item.netAmount}</td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-gray-100 font-semibold text-gray-900">
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-right">Total Stock (Qty):</td>
                    <td className="px-4 py-3 text-center">{items.reduce((acc, i) => acc + parseFloat(i.stock), 0)}</td>
                    <td className="px-4 py-3 text-right text-blue-700">₹{grandTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="flex items-center gap-2 px-5 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={18} /> Reset
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save size={18} /> {loading ? "Saving..." : "Save Purchase Bill"}
          </button>
        </div>

        <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      </div>
    </Layout>
  );
}

export default PurchaseBill;