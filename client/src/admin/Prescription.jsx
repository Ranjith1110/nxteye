import React, { useState } from "react";
import Layout from "../components/dashboard/Layout";

const Prescription = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <Layout>
            {/* Main Content */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Eye Checkup Entry Form
                </h2>

                {/* Appointment Details */}
                <section className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">
                        Appointment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Eye Checkup Date
                            </label>
                            <input
                                type="date"
                                className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                                defaultValue="2025-11-06"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Eye Test Type
                            </label>
                            <select className="w-full border rounded-md px-3 py-2">
                                <option>Select</option>
                                <option>Vision</option>
                                <option>Color</option>
                                <option>Complete</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Customer Type
                            </label>
                            <select className="w-full border rounded-md px-3 py-2">
                                <option>Select</option>
                                <option>New</option>
                                <option>Returning</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Customer Info */}
                <section className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Customer Name
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Enter name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Mobile Number
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Enter mobile"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Gender
                            </label>
                            <select className="w-full border rounded-md px-3 py-2">
                                <option>Select</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                DOB
                            </label>
                            <input type="date" className="w-full border rounded-md px-3 py-2" />
                        </div>
                    </div>
                </section>

                {/* Eye Test Readings */}
                <section>
                    <h3 className="font-semibold text-lg mb-2">Eye Test Readings</h3>

                    {/* Left Eye */}
                    <h4 className="font-semibold mt-4 mb-2">Left Eye:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {["SPH", "CYL", "PD", "ADDD C", "Distance VA", "Near VA"].map(
                            (label, i) => (
                                <div key={i}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        {label}
                                    </label>
                                    <select className="w-full border rounded-md px-3 py-2">
                                        <option>Select</option>
                                    </select>
                                </div>
                            )
                        )}
                    </div>

                    {/* Right Eye */}
                    <h4 className="font-semibold mt-6 mb-2">Right Eye:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {["SPH", "CYL", "PD", "ADDD C", "Distance VA", "Near VA"].map(
                            (label, i) => (
                                <div key={i}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        {label}
                                    </label>
                                    <select className="w-full border rounded-md px-3 py-2">
                                        <option>Select</option>
                                    </select>
                                </div>
                            )
                        )}
                    </div>
                </section>

                {/* Buttons */}
                <div className="flex justify-end mt-8 gap-4">
                    <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                        Reset
                    </button>
                    <button className="px-6 py-2 bg-[#03214a] text-white rounded-md hover:bg-[#04326d]">
                        Submit
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Prescription;
