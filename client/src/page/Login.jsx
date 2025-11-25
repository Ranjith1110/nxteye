import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Import React Hot Toast
import toast, { Toaster } from "react-hot-toast";

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

            // 2. Success Toast
            toast.success("Login successful!");

            // Redirect after toast delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } else {
            // 3. Error Toast
            toast.error("Invalid credentials! Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#03214a] px-4 relative">
            {/* 4. Add Toaster Component */}
            <Toaster position="top-center" reverseOrder={false} />

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
                            placeholder="Enter your email"
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
        </div>
    );
};

export default Login;