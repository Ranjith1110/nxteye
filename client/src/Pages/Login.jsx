import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const adminCredentials = {
        email: "admin@nxtEye.com",
        password: "admin123",
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (email === adminCredentials.email && password === adminCredentials.password) {
            localStorage.setItem("isAuthenticated", true);

            // ✅ Success toast (no icon)
            toast("Login successful!", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                icon: false,
                theme: "colored",
                style: {
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    fontWeight: "500",
                    borderRadius: "10px",
                },
            });

            // Redirect after toast delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 2200);
        } else {
            toast("Invalid credentials! Please try again.", {
                position: "bottom-right",
                autoClose: 2500,
                icon: false,
                theme: "colored",
                style: {
                    backgroundColor: "#E74C3C",
                    color: "#fff",
                    fontWeight: "500",
                    borderRadius: "10px",
                },
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#03214a] px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-[#03214a] mb-6">
                    Nxt<span className="text-[#5ce1e6]">Eye</span> Admin Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-[#03214a]"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]"
                            placeholder="admin@nxtEye.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-[#03214a]"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#03214a] hover:bg-[#5ce1e6] hover:text-[#03214a] text-white font-semibold py-2 rounded-lg transition-all duration-300"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-5">
                    © {new Date().getFullYear()} NxtEye. All rights reserved.
                </p>
            </div>

            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
};

export default Login;
