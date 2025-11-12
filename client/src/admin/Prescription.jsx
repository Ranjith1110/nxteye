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
        left: { SPH: "", CYL: "", AXIS: "", ADD: "", PD: "", DistanceVA: "", NearVA: "" },
        right: { SPH: "", CYL: "", AXIS: "", ADD: "", PD: "", DistanceVA: "", NearVA: "" },
    });

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
                onChange={e => setForm({ ...form, [eye]: { ...form[eye], [name]: e.target.value } })}
                className="w-full border rounded-md px-3 py-2"
            >
                <option value="">Select</option>
                {(label === "SPH" || label === "CYL") &&
                    SPH_CYL_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                {label === "AXIS" &&
                    AXIS_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                {label === "ADD" &&
                    ADD_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                {label === "PD" &&
                    PD_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                {label === "Distance VA" &&
                    DistanceVA_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
                {label === "Near VA" &&
                    NearVA_Values.map((v, i) => <option key={i} value={v}>{v}</option>)}
            </select>
        </div>
    );

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/prescriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) alert("PDF sent to WhatsApp!");
            else alert("Failed to send PDF.");
        } catch (err) {
            console.error(err);
            alert("Something went wrong!");
        }
    };

    return (
        <Layout>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Eye Checkup Entry Form</h2>

                {/* Appointment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input type="date" placeholder="Date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded-md p-2" />
                    <select value={form.eyeTestType} onChange={e => setForm({ ...form, eyeTestType: e.target.value })} className="border rounded-md p-2">
                        <option value="">Eye Test Type</option>
                        <option>Vision</option>
                        <option>Color</option>
                        <option>Complete</option>
                    </select>
                    <select value={form.customerType} onChange={e => setForm({ ...form, customerType: e.target.value })} className="border rounded-md p-2">
                        <option value="">Customer Type</option>
                        <option>New</option>
                        <option>Returning</option>
                    </select>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input type="text" placeholder="Customer Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-md p-2" />
                    <input type="text" placeholder="Mobile Number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="border rounded-md p-2" />
                    <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="border rounded-md p-2">
                        <option value="">Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                    <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="border rounded-md p-2" />
                </div>

                {/* Eye Readings */}
                {["left", "right"].map((eye) => (
                    <div key={eye} className="mb-6">
                        <h3 className="font-semibold text-lg mb-2">{eye.toUpperCase()} Eye</h3>
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                            {["SPH","CYL","AXIS","ADD","PD","Distance VA","Near VA"].map(field => (
                                <SelectInput key={field} label={field} name={field.replace(" ","")} eye={eye} />
                            ))}
                        </div>
                    </div>
                ))}

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send PDF via WhatsApp</button>
            </form>
        </Layout>
    );
};

export default Prescription;
