import React, { useState } from "react";
import Layout from "../components/dashboard/Layout";

const Prescription = () => {
    const [form, setForm] = useState({
        date: "",
        eyeTestType: "",
        customerType: "",
        name: "",
        mobile: "",
        gender: "",
        dob: "",
        left: {
            SPH: "",
            CYL: "",
            AXIS: "",
            ADD: "",
            PD: "",
            DistanceVA: "",
            NearVA: "",
        },
        right: {
            SPH: "",
            CYL: "",
            AXIS: "",
            ADD: "",
            PD: "",
            DistanceVA: "",
            NearVA: "",
        },
    });

    const [errors, setErrors] = useState({}); // store errors

    // Generate dropdown options
    const generateRange = (start, end, step = 0.25, includePlusMinus = false) => {
        const values = [];
        for (let i = start; i <= end; i += step) values.push(i.toFixed(2));
        if (includePlusMinus)
            return ["00", ...values.map(v => `+${v}`), ...values.map(v => `-${v}`)];
        return values;
    };

    const SPH_CYL_Values = generateRange(0.25, 20.0, 0.25, true);
    const AXIS_Values = Array.from({ length: 37 }, (_, i) => i * 5);
    const ADD_Values = generateRange(0.25, 3.5, 0.25);
    const PD_Values = ["N/A", ...Array.from({ length: 31 }, (_, i) => (25 + i * 0.5).toFixed(1))];
    const DistanceVA_Values = ["N/A", "6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"];
    const NearVA_Values = ["N/A", "N32", "N18", "N12", "N10", "N8", "N6", "N5"];

    const SelectInput = ({ label, name, eye }) => (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <select
                name={name}
                value={form[eye][name]}
                onChange={e => {
                    setForm({ ...form, [eye]: { ...form[eye], [name]: e.target.value } });
                    setErrors(prev => ({ ...prev, [name]: "" })); // clear error on change
                }}
                className="w-full border rounded-md px-3 py-2"
            >
                <option value="">Select</option>
                {(label === "SPH" || label === "CYL") &&
                    SPH_CYL_Values.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                    ))}
                {label === "AXIS" &&
                    AXIS_Values.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                    ))}
                {label === "ADD" &&
                    ADD_Values.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                    ))}
                {label === "PD" &&
                    PD_Values.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                    ))}
                {label === "Distance VA" &&
                    DistanceVA_Values.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                    ))}
                {label === "Near VA" &&
                    NearVA_Values.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                    ))}
            </select>
            {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
        </div>
    );

    const handleReset = () => {
        setForm({
            date: "",
            eyeTestType: "",
            customerType: "",
            name: "",
            mobile: "",
            gender: "",
            dob: "",
            left: { SPH: "", CYL: "", AXIS: "", ADD: "", PD: "", DistanceVA: "", NearVA: "" },
            right: { SPH: "", CYL: "", AXIS: "", ADD: "", PD: "", DistanceVA: "", NearVA: "" },
        });
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.date) newErrors.date = "Please select the eye checkup date.";
        if (!form.eyeTestType) newErrors.eyeTestType = "Please select the test type.";
        if (!form.customerType) newErrors.customerType = "Please select the customer type.";
        if (!form.name.trim()) newErrors.name = "Please enter the customer's name.";
        if (!form.mobile) newErrors.mobile = "Please enter the mobile number.";
        if (form.mobile && !/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Please enter a valid 10-digit number.";
        if (!form.gender) newErrors.gender = "Please select gender.";
        if (!form.dob) newErrors.dob = "Please select the date of birth.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!validateForm()) return;

        let whatsappNumber = form.mobile.replace(/[^0-9]/g, "");
        if (whatsappNumber.length === 10) whatsappNumber = "91" + whatsappNumber;

        const msg = `
            *NxtEye Optical - Eye Checkup Report*

            ━━━━━━━━━━━━━━━━━━━
            *Date:* ${form.date}
            *Test Type:* ${form.eyeTestType}
            *Name:* ${form.name}
            *Mobile:* ${form.mobile}
            *Gender:* ${form.gender}
            *DOB:* ${form.dob}
            ━━━━━━━━━━━━━━━━━━━

            *LEFT EYE*
            • SPH: ${form.left.SPH || "-"}
            • CYL: ${form.left.CYL || "-"}
            • AXIS: ${form.left.AXIS || "-"}
            • ADD: ${form.left.ADD || "-"}
            • PD: ${form.left.PD || "-"}
            • Distance VA: ${form.left.DistanceVA || "-"}
            • Near VA: ${form.left.NearVA || "-"}

            *RIGHT EYE*
            • SPH: ${form.right.SPH || "-"}
            • CYL: ${form.right.CYL || "-"}
            • AXIS: ${form.right.AXIS || "-"}
            • ADD: ${form.right.ADD || "-"}
            • PD: ${form.right.PD || "-"}
            • Distance VA: ${form.right.DistanceVA || "-"}
            • Near VA: ${form.right.NearVA || "-"}
            ━━━━━━━━━━━━━━━━━━━

            *Thank you for trusting NxtEye Optical!*  
            Your vision, our care
            _Stay Clear. Stay Confident._
            `;

        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg.trim())}`;
        window.open(url, "_blank");
    };

    return (
        <Layout>
            <form
                onSubmit={handleSubmit}
                onReset={handleReset}
                className="bg-white shadow-md rounded-lg p-6"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Eye Checkup Entry Form</h2>

                {/* Appointment Details */}
                <section className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Eye Checkup Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => { setForm({ ...form, date: e.target.value }); setErrors(prev => ({ ...prev, date: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            />
                            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Eye Test Type</label>
                            <select
                                value={form.eyeTestType}
                                onChange={e => { setForm({ ...form, eyeTestType: e.target.value }); setErrors(prev => ({ ...prev, eyeTestType: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select</option>
                                <option>Vision</option>
                                <option>Color</option>
                                <option>Complete</option>
                            </select>
                            {errors.eyeTestType && <p className="text-red-500 text-sm mt-1">{errors.eyeTestType}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Type</label>
                            <select
                                value={form.customerType}
                                onChange={e => { setForm({ ...form, customerType: e.target.value }); setErrors(prev => ({ ...prev, customerType: "" })); }}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select</option>
                                <option>New</option>
                                <option>Returning</option>
                            </select>
                            {errors.customerType && <p className="text-red-500 text-sm mt-1">{errors.customerType}</p>}
                        </div>
                    </div>
                </section>

                {/* Customer Info */}
                <section className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={form.name}
                                onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(prev => ({ ...prev, name: "" })); }}
                                className="w-full border rounded-md px-3 py-2" // ✅ w-full added
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Mobile Number"
                                value={form.mobile}
                                onChange={e => { setForm({ ...form, mobile: e.target.value }); setErrors(prev => ({ ...prev, mobile: "" })); }}
                                className="w-full border rounded-md px-3 py-2" // ✅ w-full added
                            />
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                        </div>

                        <div>
                            <select
                                value={form.gender}
                                onChange={e => { setForm({ ...form, gender: e.target.value }); setErrors(prev => ({ ...prev, gender: "" })); }}
                                className="w-full border rounded-md px-3 py-2" // ✅ w-full added
                            >
                                <option value="">Select</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                        </div>

                        <div>
                            <input
                                type="date"
                                value={form.dob}
                                onChange={e => { setForm({ ...form, dob: e.target.value }); setErrors(prev => ({ ...prev, dob: "" })); }}
                                className="w-full border rounded-md px-3 py-2" // ✅ w-full added
                            />
                            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                        </div>
                    </div>
                </section>


                {/* Eye Test Readings */}
                <section>
                    <h3 className="font-semibold text-lg mb-2">Eye Test Readings</h3>

                    <h4 className="font-semibold mt-4 mb-2">Left Eye:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {["SPH", "CYL", "AXIS", "ADD", "PD", "Distance VA", "Near VA"].map((f, i) => (
                            <SelectInput key={i} label={f} name={f.replace(" ", "")} eye="left" />
                        ))}
                    </div>

                    <h4 className="font-semibold mt-6 mb-2">Right Eye:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        {["SPH", "CYL", "AXIS", "ADD", "PD", "Distance VA", "Near VA"].map((f, i) => (
                            <SelectInput key={i} label={f} name={f.replace(" ", "")} eye="right" />
                        ))}
                    </div>
                </section>

                {/* Buttons */}
                <div className="flex justify-end mt-8 gap-4">
                    <button
                        type="reset"
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-[#03214a] text-white rounded-md hover:bg-[#04326d]"
                    >
                        Send Report via WhatsApp
                    </button>
                </div>
            </form>
        </Layout>
    );
};

export default Prescription;
