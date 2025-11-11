import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    FileText,
    ShoppingBag,
    Clock,
    User,
    Settings,
    LogOut,
    HelpCircle,
    X,
} from "lucide-react";
import logo from "/assets/dashboard/nxteye-logo.png";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/login");
    };

    const menuItems = [
        { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
        { name: "Prescription", icon: <FileText size={18} />, path: "/prescription" },
        { name: "Billing", icon: <ShoppingBag size={18} />, path: "/billing" },
        { name: "Items", icon: <FileText size={18} />, path: "/items" },
        { name: "History", icon: <Clock size={18} />, path: "/history" },
    ];

    const bottomItems = [
        { name: "Sign Out", icon: <LogOut size={18} />, action: handleLogout },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 lg:hidden z-20"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-30 h-screen bg-white shadow-xl flex flex-col justify-between w-64 transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Top Section */}
                <div>
                    <div className="p-4 flex items-center justify-between">
                        <img width={180} src={logo} alt="NxtEye Logo" />
                        <button
                            className="lg:hidden text-[#03214a]"
                            onClick={toggleSidebar}
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex flex-col p-4 space-y-1">
                        {menuItems.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => toggleSidebar(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${isActive
                                        ? "bg-[#5ce1e6]/25 text-[#03214a]"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="border-t p-4 flex flex-col space-y-1">
                    {bottomItems.map((item, index) =>
                        item.action ? (
                            <button
                                key={index}
                                onClick={item.action}
                                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </button>
                        ) : (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => toggleSidebar(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        )
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
