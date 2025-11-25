import React, { useState } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Navbar = ({ toggleSidebar }) => {
    const [openDropdown, setOpenDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        toast.success("Signed out successfully!");

        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");

        setTimeout(() => {
            navigate("/login");
        }, 1000);
    };

    return (
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg shadow-sm px-6 py-3 flex justify-between items-center relative">

            <Toaster position="top-center" reverseOrder={false} />

            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    className="lg:hidden text-[#03214a] focus:outline-none"
                    onClick={toggleSidebar}
                >
                    <Menu size={26} className="hover:text-[#5ce1e6] transition" />
                </button>

                <h1 className="text-xl lg:text-2xl font-bold text-[#03214a] tracking-wide">
                    Admin Dashboard
                </h1>
            </div>

            {/* Right Section */}
            <div className="relative">
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#5ce1e6] text-[#03214a] font-bold hover:bg-[#03214a] hover:text-white transition shadow-md"
                    onMouseEnter={() => setOpenDropdown(true)}
                    onMouseLeave={() => setOpenDropdown(false)}
                >
                    <User size={20} />
                </button>

                {/* Dropdown */}
                {openDropdown && (
                    <div
                        className="absolute right-0 w-40 bg-white shadow-lg border border-gray-200 rounded-lg py-2 text-sm"
                        onMouseEnter={() => setOpenDropdown(true)}
                        onMouseLeave={() => setOpenDropdown(false)}
                    >
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition text-red-600 font-medium"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;