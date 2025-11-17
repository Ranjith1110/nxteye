import React, { useState, useEffect } from 'react';
import Layout from '../components/dashboard/Layout';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const PurchaseBill = () => {
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
    hsn: "",
    rate: "",
    disPercent: 0,
    disRate: 0,
    qty: 1,
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

    if (['rate', 'disPercent', 'qty'].includes(name)) {
      val = parseFloat(value) || 0;
    }

    setCurrentItem(prev => {
      const updated = { ...prev, [name]: val };

      // Calculation Logic
      const rate = parseFloat(updated.rate) || 0;
      const disPer = parseFloat(updated.disPercent) || 0;
      const qty = parseFloat(updated.qty) || 0;

      const discountAmount = rate * (disPer / 100);
      const net = (rate - discountAmount) * qty;

      return {
        ...updated,
        disRate: discountAmount.toFixed(2),
        netAmount: net.toFixed(2)
      };
    });
  };

  // --- Add Item ---
  const handleAddItem = () => {
    if (!currentItem.itemName || !currentItem.rate) {
      toast.warn("Please enter Item Name and Rate");
      return;
    }
    setItems([...items, { ...currentItem, id: Date.now() }]);
    setCurrentItem({
      itemName: "",
      hsn: "",
      rate: "",
      disPercent: 0,
      disRate: 0,
      qty: 1,
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Bill Entry</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <h3 className="text-2xl font-bold text-blue-600">₹{grandTotal.toFixed(2)}</h3>
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
            <div className="md:col-span-3">
              <label className="text-xs font-medium text-gray-600">Item Name</label>
              <input
                type="text" name="itemName" value={currentItem.itemName} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="Item Description"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">HSN/SAC</label>
              <input
                type="text" name="hsn" value={currentItem.hsn} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">Rate</label>
              <input
                type="number" name="rate" value={currentItem.rate} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="0.00"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">Dis %</label>
              <input
                type="number" name="disPercent" value={currentItem.disPercent} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm" placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Dis Rate (Auto)</label>
              <input
                type="number" name="disRate" value={currentItem.disRate} readOnly
                className="w-full p-2 border rounded text-sm bg-gray-100 text-gray-500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-medium text-gray-600">Qty</label>
              <input
                type="number" name="qty" value={currentItem.qty} onChange={handleItemChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Net Amount</label>
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
                  <th className="px-4 py-3 border-b">Description</th>
                  <th className="px-4 py-3 border-b">HSN/SAC</th>
                  <th className="px-4 py-3 border-b text-right">Rate</th>
                  <th className="px-4 py-3 border-b text-center">Dis %</th>
                  <th className="px-4 py-3 border-b text-right">Dis Rate</th>
                  <th className="px-4 py-3 border-b text-center">Qty</th>
                  <th className="px-4 py-3 border-b text-right">Net Amount</th>
                  <th className="px-4 py-3 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-6 text-center text-gray-500">No items added yet.</td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-center">{index + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-2">{item.hsn || "-"}</td>
                      <td className="px-4 py-2 text-right">{item.rate}</td>
                      <td className="px-4 py-2 text-center">{item.disPercent}%</td>
                      <td className="px-4 py-2 text-right text-red-500">-{item.disRate}</td>
                      <td className="px-4 py-2 text-center">{item.qty}</td>
                      <td className="px-4 py-2 text-right font-bold">₹{item.netAmount}</td>
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
                    <td colSpan="6" className="px-4 py-3 text-right">Total:</td>
                    <td className="px-4 py-3 text-center">{items.reduce((acc, i) => acc + parseFloat(i.qty), 0)}</td>
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