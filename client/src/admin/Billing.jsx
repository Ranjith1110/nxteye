import React from "react";
import Layout from "../components/dashboard/Layout";
import { Search } from "lucide-react";

const Billing = () => {
    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                {/* Header Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Sale Bill
                </h2>

                {/* Bill Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Bill No</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Date</label>
                        <input
                            type="date"
                            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100"
                        />
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Customer Name</label>
                            <input
                                type="text"
                                className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Mobile Number</label>
                            <input
                                type="text"
                                className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Gender</label>
                            <select className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100">
                                <option>Select</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">DOB</label>
                            <input
                                type="date"
                                className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-700">Items</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search items"
                                className="border rounded-md py-1 pl-8 pr-3 text-sm"
                            />
                            <Search className="absolute left-2 top-2 text-gray-400 w-4 h-4" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Sl.No</th>
                                    <th className="border p-2">Item Number</th>
                                    <th className="border p-2">Item Name</th>
                                    <th className="border p-2">Item Type</th>
                                    <th className="border p-2">Item Price</th>
                                    <th className="border p-2">GST%</th>
                                    <th className="border p-2">CGST%</th>
                                    <th className="border p-2">SGST%</th>
                                    <th className="border p-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-2 text-center">1</td>
                                    <td className="border p-2">nxteye - 001</td>
                                    <td className="border p-2">raybon glass</td>
                                    <td className="border p-2">Frame</td>
                                    <td className="border p-2 text-center">2000/-</td>
                                    <td className="border p-2 text-center">5%</td>
                                    <td className="border p-2 text-center">5%</td>
                                    <td className="border p-2 text-center">5%</td>
                                    <td className="border p-2 text-center">10</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 text-center">2</td>
                                    <td className="border p-2">nxteye - 002</td>
                                    <td className="border p-2">Cooling lens</td>
                                    <td className="border p-2">Lens</td>
                                    <td className="border p-2 text-center">1000/-</td>
                                    <td className="border p-2 text-center">5%</td>
                                    <td className="border p-2 text-center">5%</td>
                                    <td className="border p-2 text-center">5%</td>
                                    <td className="border p-2 text-center">10</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Advance</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Remaining</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                        <select className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100">
                            <option>Select</option>
                            <option>Paid</option>
                            <option>Unpaid</option>
                            <option>Partial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Mode of Payment</label>
                        <select className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-100">
                            <option>Select</option>
                            <option>Cash</option>
                            <option>Card</option>
                            <option>UPI</option>
                        </select>
                    </div>
                </div>

                {/* Totals Section */}
                <div className="text-right text-sm font-medium text-gray-700 mb-4">
                    <p>Total : <span className="font-semibold">1000/-</span></p>
                    <p>Discount : <span className="font-semibold">1000/-</span></p>
                    <p>Grand Total : <span className="font-semibold">1000/-</span></p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-md">
                        Preview Bill
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                        Download PDF
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Billing;
