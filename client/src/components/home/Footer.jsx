import React, { useState } from "react";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import logo from "/assets/home-hero/logo-white.png";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Footer = () => {
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [subscribed, setSubscribed] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) return toast.error("Please enter your name");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Enter a valid email");

        const toastId = toast.loading("Subscribing...");

        try {
            const res = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/subscribe`, formData);

            if (res.status === 200) {
                toast.dismiss(toastId);
                toast.success("Successfully subscribed to newsletter!");
                
                setSubscribed(true);
                setTimeout(() => setSubscribed(false), 3000);
                setFormData({ name: "", email: "" });
            }
        } catch (err) {
            toast.dismiss(toastId);
            toast.error("Error sending subscription request");
        }
    };

    return (
        <footer className="bg-black text-white mt-16 relative">
            <Toaster position="top-center" reverseOrder={false} />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* About Section */}
                    <div className="md:col-span-4">
                        <img
                            src={logo}
                            alt="NxTEye Logo"
                            className="w-46 h-auto mb-4"
                        />

                        <p className="text-gray-300 leading-relaxed mb-4">
                            NxTEye is a premium optical brand delivering quality eyewear,
                            expert eye care and transparent pricing. Trusted by thousands,
                            we craft eyewear that blends precision with style.
                        </p>

                        <p className="text-gray-400 mb-4">
                            Visit our stores or shop online — we make eyewear effortless.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3">
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="#">
                                <Facebook size={18} />
                            </a>
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="#">
                                <Instagram size={18} />
                            </a>
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="#">
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Inside NxTEye + Policy */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-6">
                        {/* Inside Nxteye */}
                        <div>
                            <h4 className="text-gray-200 font-bold text-sm tracking-wide mb-3">
                                INSIDE NXTEYE
                            </h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a className="hover:text-white transition" href="/">About us</a></li>
                                <li><a className="hover:text-white transition" href="/">Contact us</a></li>
                            </ul>
                        </div>

                        {/* Policy */}
                        <div>
                            <h4 className="text-gray-200 font-bold text-sm tracking-wide mb-3">
                                OUR POLICY
                            </h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a className="hover:text-white transition" href="#">Terms of use</a></li>
                                <li><a className="hover:text-white transition" href="#">Privacy policy</a></li>
                                <li><a className="hover:text-white transition" href="#">Warranty policy</a></li>
                                <li><a className="hover:text-white transition" href="#">Essilor warranty</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="md:col-span-4">
                        <h4 className="text-gray-200 font-bold text-sm tracking-wide mb-3">
                            NEWSLETTER
                        </h4>

                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/40"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-md bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/40"
                                required
                            />

                            <button
                                type="submit"
                                className="w-full px-4 py-3 rounded-md bg-[#5ce1e6] text-[#03214a] font-semibold hover:opacity-90 transition"
                            >
                                {subscribed ? "Subscribed!" : "Subscribe"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4">
                    <p>© {new Date().getFullYear()} NxTEye. All rights reserved.</p>

                    <div className="flex items-center gap-6">
                        <a className="hover:text-white transition" href="#">Privacy</a>
                        <a className="hover:text-white transition" href="#">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;