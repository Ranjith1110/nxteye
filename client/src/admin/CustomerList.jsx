// CustomerList.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/dashboard/Layout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react'; // Import RefreshCw icon

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_APP_BASE_URL;
const CUSTOMERS_PER_PAGE = 15;

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for Search and Pagination ---
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- Fetch Data Function ---
    const fetchCustomers = async (page, search) => {
        setLoading(true);
        setError(null);
        try {
            // Construct the query URL
            const url = `${API_URL}/api/customers?page=${page}&limit=${CUSTOMERS_PER_PAGE}&search=${search}`;

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
        fetchCustomers(1, "");
    }, []);

    // --- Event Handlers ---

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search button click
    const handleSearchSubmit = () => {
        setCurrentPage(1); // Reset to first page on a new search
        fetchCustomers(1, searchTerm);
    };

    // --- NEW: Handle Reset Button Click ---
    const handleReset = () => {
        setSearchTerm("");    // Clear the search input
        setCurrentPage(1);  // Go back to page 1
        fetchCustomers(1, ""); // Fetch all customers
        toast.info("Customer list reset");
    };

    // Handle pressing Enter in search box
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchCustomers(newPage, searchTerm);
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

                {/* --- Search Bar --- */}
                <div className="flex gap-2 mb-6">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search by Name or Mobile Number..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={handleSearchKeyPress}
                            className="w-full mt-1 p-2 pl-10 border rounded-md"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={handleSearchSubmit}
                        className="bg-[#5ce1e6] text-[#03214a] px-4 py-2 rounded-full font-medium hover:bg-[#03214a] hover:text-white transition"
                    >
                        Search
                    </button>
                    {/* --- NEW RESET BUTTON --- */}
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2">Sl.No</th>
                                        <th className="border p-2 text-left">Name</th>
                                        <th className="border p-2 text-left">Mobile Number</th>
                                        <th className="border p-2">Gender</th>
                                        <th className="border p-2">DOB</th>
                                        <th className="border p-2 text-left">Purpose of Visit</th>
                                        <th className="border p-2">Date Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer, index) => (
                                        <tr key={customer._id}>
                                            <td className="border p-2 text-center">
                                                {/* Calculate serial number based on page */}
                                                {(currentPage - 1) * CUSTOMERS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="border p-2">{customer.customerName}</td>
                                            <td className="border p-2">{customer.mobileNumber}</td>
                                            <td className="border p-2 text-center">{customer.gender || "N/A"}</td>
                                            <td className="border p-2 text-center">{formatDate(customer.dob)}</td>
                                            <td className="border p-2">{customer.purposeOfVisit || "N/A"}</td>
                                            <td className="border p-2 text-center">{formatDate(customer.createdAt)}</td>
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