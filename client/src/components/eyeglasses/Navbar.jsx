import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaFacebook,
    FaWhatsapp,
    FaLinkedin,
    FaCartPlus
} from 'react-icons/fa';
import { AiFillInstagram } from "react-icons/ai";
import {
    IoPersonCircleSharp,
    IoMenuOutline,
    IoCloseOutline,
    IoChevronDown,
    IoLocation,
    IoMail
} from 'react-icons/io5';
import { FaPhoneVolume } from "react-icons/fa6";
import logo from "/assets/home-hero/nxteye-logo.png";

const TOPBAR_HEIGHT = 40; // px

const navLinks = [
    {
        name: 'Home',
        href: '/', // Points to root
    },
    {
        name: 'Eyeglasses',
        href: '/eyeglasses',
        subLinks: [
            { name: 'Men', href: '/eyeglasses/men' },
            { name: 'Women', href: '/eyeglasses/women' },
            { name: 'Kids', href: '/eyeglasses/kids' },
        ],
    },
    {
        name: 'Sunglasses',
        href: '/sunglasses',
        subLinks: [
            { name: 'Aviator', href: '/sunglasses/aviator' },
            { name: 'Round', href: '/sunglasses/round' },
            { name: 'Polarized', href: '/sunglasses/polarized' },
        ],
    },
    {
        name: 'Contact Lenses',
        href: '/contact-lenses',
        subLinks: [
            { name: 'Daily', href: '/contacts/daily' },
            { name: 'Monthly', href: '/contacts/monthly' },
            { name: 'Colored', href: '/contacts/colored' },
        ],
    }
];

// Custom style object for the glassy menu to replace <style jsx>
const glassyMenuStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 10px 32px 0 rgba(53, 88, 195, 0.1)',
};

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(-1);
    const [openMobileAccordion, setOpenMobileAccordion] = useState(null);
    const [showTopBar, setShowTopBar] = useState(true);

    const lastScroll = useRef(0);
    const closeTimeoutRef = useRef(null);
    const navRef = useRef(null);

    // Scroll hide/show topbar
    useEffect(() => {
        const handleScroll = () => {
            const current = window.pageYOffset;
            if (Math.abs(current - lastScroll.current) < 10) return;
            if (current > lastScroll.current && current > 60) setShowTopBar(false);
            else setShowTopBar(true);
            lastScroll.current = current;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Disable body scroll when menu open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => (document.body.style.overflow = '');
    }, [isMobileMenuOpen]);

    // ESC closes menu/dropdown
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setOpenDropdownIndex(-1);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Click outside closes dropdown
    useEffect(() => {
        const onDocClick = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenDropdownIndex(-1);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const handleOpenDropdown = (idx) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setOpenDropdownIndex(idx);
    };

    const handleCloseDropdownDelayed = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = setTimeout(() => {
            setOpenDropdownIndex(-1);
            closeTimeoutRef.current = null;
        }, 200);
    };

    const handleBackdropClick = (e) => {
        if (e.target.dataset.backdrop === 'true') setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Topbar */}
            <div
                className={`fixed left-0 right-0 top-0 z-50 transform transition-transform duration-300`}
                style={{
                    transform: showTopBar ? 'translateY(0)' : `translateY(-${TOPBAR_HEIGHT}px)`,
                }}
            >
                <div className="bg-black text-white">
                    <div className="px-4 sm:px-6 h-10 flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center space-x-4">
                            <a href="tel:+917869369994" className="text-white flex items-center gap-1 text-[14px] md:text-xs">
                                <FaPhoneVolume />
                                <span className='hidden md:block'>+91 7869369994</span>
                            </a>
                            <a href="mailto:nxteyeopticals@gmail.com" className="text-white flex items-center gap-1 text-lg md:text-xs">
                                <IoMail />
                                <span className='hidden md:block'>nxteyeopticals@gmail.com</span>
                            </a>
                            <div className="text-white flex items-center gap-1 text-lg md:text-xs">
                                <IoLocation />
                                <span className='hidden md:block'>Ramanathapuram</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <a href="#" className="text-white text-lg"><FaFacebook /></a>
                            <a href="#" className="text-white text-lg"><AiFillInstagram /></a>
                            <a href="#" className="text-white text-lg"><FaWhatsapp /></a>
                            <a href="#" className="text-white text-lg"><FaLinkedin /></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div
                ref={navRef}
                className="fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300"
                style={{ top: showTopBar ? `${TOPBAR_HEIGHT}px` : '0px' }}
            >
                <div className="px-4 sm:px-6 h-20 flex items-center justify-between">

                    {/* LEFT: LOGO */}
                    <div className="flex items-center">
                        <Link to="/">
                            <img width={190} src={logo} alt="NxtEye Logo" />
                        </Link>
                    </div>

                    {/* RIGHT: NAV LINKS (Desktop) + ICONS */}
                    <div className="flex items-center gap-6 md:gap-8">

                        {/* Desktop Links */}
                        <div className="hidden lg:flex items-center gap-6">
                            {navLinks.map((link, idx) => {
                                const hasSubLinks = link.subLinks && link.subLinks.length > 0;

                                return (
                                    <div
                                        key={link.name}
                                        className="relative"
                                        onMouseEnter={() => hasSubLinks && handleOpenDropdown(idx)}
                                        onMouseLeave={handleCloseDropdownDelayed}
                                    >
                                        <Link
                                            to={link.href}
                                            className="text-gray-700 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition py-4"
                                        >
                                            {link.name}
                                            {/* {hasSubLinks && <IoChevronDown className="text-sm" />} */}
                                        </Link>

                                        {/* Dropdown - Only render if subLinks exist */}
                                        {/* {hasSubLinks && (
                                            <div
                                                style={glassyMenuStyle}
                                                className={`absolute top-[80%] right-0 w-[480px] md:w-[570px] border border-blue-100 rounded-2xl z-50 transition-all duration-200 origin-top-right ${openDropdownIndex === idx
                                                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                                                    : 'opacity-0 translate-y-2 pointer-events-none'
                                                    }`}
                                            >
                                                <div className="grid grid-cols-2 gap-4 p-6 text-left">
                                                    <div>
                                                        {link.subLinks.map((s) => (
                                                            <Link
                                                                key={s.name}
                                                                to={s.href}
                                                                className="block px-3 py-2 rounded-md text-base text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition"
                                                            >
                                                                {s.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-col justify-between items-start">
                                                        <div className="w-full h-24 bg-gradient-to-tr from-blue-50 to-white rounded-xl flex items-center justify-center border border-blue-100 shadow-md">
                                                            <span className="text-sm text-blue-600 font-semibold">Featured Collection</span>
                                                        </div>
                                                        <div className="mt-4 w-full">
                                                            <Link
                                                                to={link.href}
                                                                className="inline-block w-full text-center py-2 rounded-2xl bg-blue-600 text-white text-base font-bold transition hover:bg-blue-700"
                                                            >
                                                                Shop {link.name}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ICONS */}
                        <div className="flex items-center gap-3 md:gap-4">
                            {/* User Icon -> Login Page */}
                            <Link to="/login" className="text-gray-700 hover:text-blue-700 transition">
                                <IoPersonCircleSharp size={24} />
                            </Link>

                            <button
                                aria-label="Menu"
                                className="lg:hidden text-gray-700 hover:text-blue-700 transition"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <IoMenuOutline size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer to prevent content hidden behind fixed navbar */}
            <div style={{ height: `${TOPBAR_HEIGHT + 80}px` }} />

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}
            >
                <div
                    data-backdrop="true"
                    className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={handleBackdropClick}
                />
                <aside
                    className={`absolute inset-y-0 right-0 w-full max-w-xs sm:max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="h-20 flex items-center justify-between px-4 sm:px-6 border-b">
                        <Link to="/" className="text-2xl font-bold text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
                            NxtEye
                        </Link>
                        <button className="p-2 text-gray-700 hover:text-black" onClick={() => setIsMobileMenuOpen(false)}>
                            <IoCloseOutline size={26} />
                        </button>
                    </div>
                    <nav className="overflow-auto h-[calc(100%-80px)] p-4">
                        <ul className="space-y-4">
                            {navLinks.map((link, idx) => (
                                <li key={link.name} className="border-b pb-2">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={link.href}
                                            className="text-lg font-medium text-gray-800"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                        {link.subLinks?.length ? (
                                            <button
                                                onClick={() =>
                                                    setOpenMobileAccordion((prev) => (prev === idx ? null : idx))
                                                }
                                                className={`p-2 rounded-md text-gray-600 hover:text-blue-600 transition-transform ${openMobileAccordion === idx ? 'rotate-180' : ''}`}
                                            >
                                                {/* <IoChevronDown /> */}
                                            </button>
                                        ) : null}
                                    </div>
                                    {/* {link.subLinks?.length && openMobileAccordion === idx ? (
                                        <div className="mt-2 space-y-2 pl-3">
                                            {link.subLinks.map((s) => (
                                                <Link
                                                    key={s.name}
                                                    to={s.href}
                                                    className="block text-gray-700 py-1"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {s.name}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : null} */}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </>
    );
}