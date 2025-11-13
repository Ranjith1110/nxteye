import React from "react";
import { Menu } from "lucide-react";

const Navbar = ({ toggleSidebar }) => {
    return (
        <header className="sticky top-0 z-20 bg-white shadow-sm px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden text-[#03214a] focus:outline-none"
                    onClick={toggleSidebar}
                >
                    <Menu size={24} />
                </button>

                {/* Page Info */}
                <div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-[#03214a]">
                        Welcome
                    </h1>
                </div>
            </div>

            {/* Button */}
            <button className="bg-[#5ce1e6] text-[#03214a] px-4 py-1 rounded-full font-medium hover:bg-[#03214a] hover:text-white transition">
                Export Data
            </button>
        </header>
    );
};

export default Navbar;
