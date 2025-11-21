import React, { useState } from "react";
import { Facebook, Youtube, Instagram, MessageCircle, Linkedin } from "lucide-react";
import logo from "/assets/home-hero/nxteye-logo.png";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            alert("Please enter a valid email.");
            return;
        }

        setSubscribed(true);
        setTimeout(() => setSubscribed(false), 2500);
        setEmail("");
    };

    return (
        <footer className="bg-black text-white mt-16">
            <div className="max-w-7xl mx-auto px-6 py-16">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* About Section */}
                    <div className="md:col-span-4">
                        <img
                            src={logo}
                            alt="NxTEye Logo"
                            className="w-36 h-auto mb-4"
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
                                <Youtube size={18} />
                            </a>
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="#">
                                <Instagram size={18} />
                            </a>
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="#">
                                <MessageCircle size={18} />
                            </a>
                            <a className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition" href="#">
                                <Linkedin size={18} />
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
                                <li><a className="hover:text-white transition" href="#">About us</a></li>
                                <li><a className="hover:text-white transition" href="#">Blogs</a></li>
                                <li><a className="hover:text-white transition" href="#">Size guide</a></li>
                                <li><a className="hover:text-white transition" href="#">Careers</a></li>
                                <li><a className="hover:text-white transition" href="#">Contact us</a></li>
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

                        <p className="text-gray-400 text-sm mb-4">
                            Frame your inbox — get exclusive style drops, eye-care tips and offers straight to you.
                        </p>

                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        <div className="mt-6 text-gray-400 text-sm">
                            <p className="mb-2">Need help?</p>
                            <a href="tel:+919988997689" className="block hover:text-white">Call: +91 99889 97689</a>
                            <a href="mailto:hello@nxteye.com" className="block hover:text-white">hello@nxteye.com</a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4">
                    <p>© {new Date().getFullYear()} NxTEye. All rights reserved.</p>

                    <div className="flex items-center gap-6">
                        <a className="hover:text-white transition" href="#">Privacy</a>
                        <a className="hover:text-white transition" href="#">Terms</a>
                        <a className="hover:text-white transition" href="#">Sitemap</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
