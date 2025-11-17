import React, { useState, useEffect } from 'react';
import Layout from '../components/dashboard/Layout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_APP_BASE_URL;
const CUSTOMERS_PER_PAGE = 15;

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for Search, Filters, and Pagination ---
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- State for Filters ---
    const [purpose, setPurpose] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // --- Fetch Data Function ---
    const fetchCustomers = async (page, search, purpose, startDate, endDate) => {
        setLoading(true);
        setError(null);
        try {
            // Construct the query URL with all filter parameters
            const url = `${API_URL}/api/customers?page=${page}&limit=${CUSTOMERS_PER_PAGE}&search=${search}&purpose=${purpose}&startDate=${startDate}&endDate=${endDate}`;

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await res.json();

            setCustomers(data.customers);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);

        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message || "Failed to load customer data.");
        } finally {
            setLoading(false);
        }
    };

    // --- Effects ---
    // Initial fetch on component mount
    useEffect(() => {
        fetchCustomers(1, "", "", "", "");
    }, []);

    // --- Event Handlers ---

    // Handle "Apply Filters" button click
    const handleFilterSubmit = () => {
        setCurrentPage(1); // Reset to first page on a new filter
        fetchCustomers(1, searchTerm, purpose, startDate, endDate);
    };

    // Handle Reset Button Click
    const handleReset = () => {
        setSearchTerm("");    // Clear the search input
        setPurpose("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);  // Go back to page 1
        fetchCustomers(1, "", "", "", ""); // Fetch all customers
        toast.info("Filters reset");
    };

    // Handle pressing Enter in search box
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleFilterSubmit();
        }
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            // Fetch new page *with* all current filters
            fetchCustomers(newPage, searchTerm, purpose, startDate, endDate);
        }
    };

    // --- Helper to format date ---
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString; // Fallback for invalid dates
        }
    };

    return (
        <Layout>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer List</h2>

                {/* --- Filter Bar --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {/* Search */}
                    <div className="relative md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Search Name/Mobile</label>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            className="w-full mt-1 p-2 pl-10 border rounded-md"
                        />
                        <Search size={18} className="absolute left-3 bottom-2.5 text-gray-400" />
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Purpose</label>
                        <select
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md bg-white"
                        >
                            <option value="">All Purposes</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Inquiry">Inquiry</option>
                            <option value="Service/Repair">Service/Repair</option>
                            <option value="Browsing">Browsing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                        />
                    </div>
                </div>

                {/* --- Button Controls --- */}
                <div className="flex justify-end gap-2 mb-6">
                    <button
                        onClick={handleFilterSubmit}
                        className="bg-[#5ce1e6] text-[#03214a] px-4 py-2 rounded-full font-medium hover:bg-[#03214a] hover:text-white transition"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition"
                    >
                        <RefreshCw size={16} />
                        Reset
                    </button>
                </div>

                {/* --- Data Display --- */}
                {loading ? (
                    <div className="text-center py-10">Loading customers...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600">{error}</div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No customers found.</div>
                ) : (
                    <>
                        {/* --- Customer Table --- */}
                        <div className="mt-4 overflow-x-auto rounded-t-lg border border-gray-200">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 border-b">Sl.No</th>
                                        <th className="px-4 py-3 border-b">Name</th>
                                        <th className="px-4 py-3 border-b">Mobile Number</th>
                                        <th className="px-4 py-3 border-b">Address</th> {/* Added Address Header */}
                                        <th className="px-4 py-3 border-b">Gender</th>
                                        <th className="px-4 py-3 border-b">DOB</th>
                                        <th className="px-4 py-3 border-b">Purpose of Visit</th>
                                        <th className="px-4 py-3 border-b">Date Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer, index) => (
                                        <tr key={customer._id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-center">
                                                {(currentPage - 1) * CUSTOMERS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="p-2">{customer.customerName}</td>
                                            <td className="p-4">{customer.mobileNumber}</td>
                                            <td className="p-4">{customer.address || "N/A"}</td> {/* Added Address Data */}
                                            <td className="p-4 text-left">{customer.gender || "N/A"}</td>
                                            <td className="p-4 text-left">{formatDate(customer.dob)}</td>
                                            <td className="p-4">{customer.purposeOfVisit || "N/A"}</td>
                                            <td className="p-4 text-left">{formatDate(customer.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* --- Pagination Controls --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span className="text-sm font-medium text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={2000} />
        </Layout>
    );
};

export default CustomerList;