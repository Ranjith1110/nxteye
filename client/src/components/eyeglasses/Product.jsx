import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import vincent from "/assets/vincent.webp";
// Make sure you have installed react-icons: npm install react-icons

// ==========================================
// MOCK DATA SECTION
// ==========================================
const products = [
    {
        id: 1,
        brand: "John Jacobs",
        details: "Size: Medium • John Jacobs",
        rating: 4.8,
        reviews: 2162,
        price: 3300,
        originalPrice: 3900,
        discount: 15,
        colors: ["#1f1f1f", "#d4a373"], // Black and Gold/Brown dots
        // ▼▼▼ REPLACE THIS URL WITH YOUR RIMLESS GLASSES IMAGE PATH ▼▼▼
        // Example: image: "/assets/images/rimless-glasses.png"
        image: vincent
    },
    {
        id: 2,
        brand: "Vincent Chase",
        details: "Size: Wide • Sleek Steel",
        rating: 4.8,
        reviews: 5252,
        price: 1400,
        originalPrice: 1900,
        discount: 26,
        // The multi-color dots
        colors: ["#d4c4a8", "#333", "#555", "#000"],
        extraColors: 2,
        // ▼▼▼ REPLACE THIS URL WITH YOUR CLUBMASTER GLASSES IMAGE PATH ▼▼▼
        image: vincent
    },
    {
        id: 3,
        brand: "John Jacobs",
        details: "Size: Narrow • John Jacobs",
        rating: 4.9,
        reviews: 869,
        price: 3300,
        originalPrice: 3900,
        discount: 15,
        colors: ["#333", "#b08d55"], // Black and Tortoise dots
        // ▼▼▼ REPLACE THIS URL WITH YOUR ROUND GLASSES IMAGE PATH ▼▼▼
        image: vincent
    }
];

// ==========================================
// INDIVIDUAL CARD COMPONENT
// ==========================================
const ProductCard = ({ product }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <div className="group relative bg-white border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between h-full">

            {/* 1. Wishlist Icon (Top Right) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    // prevent navigation if the card itself is a link later
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                }}
                className="absolute top-4 right-4 z-10 p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
                {isLiked ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-xl" />}
            </button>

            {/* 2. Product Image Container with Hover Rotation Effect */}
            {/* - `h-52`: Sets height for the image area.
         - `flex items-center justify-center`: Centers the image.
      */}
            <div className="relative w-full h-52 flex items-center justify-center overflow-visible mb-4">

                {/* THE IMAGE WITH ROTATION ANIMATION */}
                <img
                    src={product.image}
                    alt={product.brand}
                    // This handles if the image link is broken
                    onError={(e) => e.target.src = "https://via.placeholder.com/300x150?text=No+Image"}
                    /* THE HOVER MAGIC:
                       - `transform`: Enables transformations.
                       - `-rotate-6`: Initial state, slightly tilted left.
                       - `scale-95`: Initial state, slightly smaller.
                       - `group-hover:rotate-0`: On hover, straighten to 0 degrees.
                       - `group-hover:scale-105`: On hover, get slightly bigger.
                       - `transition-transform duration-500 ease-in-out`: Smooth animation.
                    */
                    className="w-[85%] object-contain transform -rotate-6 scale-95 transition-transform duration-500 ease-in-out group-hover:rotate-0 group-hover:scale-105"
                />

                {/* Rating Badge (Bottom Left of Image Container) */}
                <div className="absolute bottom-0 left-0 bg-gray-50 border border-gray-100 rounded-full px-2 py-[2px] flex items-center gap-1 shadow-sm">
                    <span className="font-bold text-[13px] text-gray-800">{product.rating}</span>
                    {/* Teal Star */}
                    <FaStar className="text-teal-500 text-[10px] mb-[1px]" />
                    {/* Review Count with vertical separator line */}
                    <span className="text-[11px] text-gray-500 border-l border-gray-300 pl-1 ml-1">{product.reviews}</span>
                </div>
            </div>

            {/* 3. Product Details Section */}
            <div className="mt-1 text-left">
                {/* Brand Name */}
                <h3 className="text-[17px] font-bold text-gray-800 mb-1 leading-tight">{product.brand}</h3>
                {/* Sub-details */}
                <p className="text-[13px] text-gray-500 font-medium mb-4 truncate">{product.details}</p>

                {/* Price and Colors Footer Row */}
                <div className="flex items-end justify-between">

                    {/* Price Block */}
                    <div className="flex items-baseline gap-[6px]">
                        {/* Current Price */}
                        <span className="text-[17px] font-bold text-gray-900">₹{product.price}</span>
                        {/* Original Price (Strikethrough) */}
                        <span className="text-[13px] text-gray-400 line-through font-medium">₹{product.originalPrice}</span>
                        {/* Discount Percentage (Teal Color) */}
                        <span className="text-[13px] text-teal-600 font-bold">({product.discount}% OFF)</span>
                    </div>

                    {/* Color Swatches (Overlapping Circles) */}
                    <div className="flex items-center -space-x-[6px]">
                        {product.colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-5 h-5 rounded-full border-[2px] border-white shadow-sm bg-cover"
                                // Using inline style to set the dynamic background color from data
                                style={{ backgroundColor: color }}
                            ></div>
                        ))}
                        {/* Extra colors counter (+2) if available */}
                        {product.extraColors && (
                            <div className="w-5 h-5 rounded-full border-[2px] border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600 shadow-sm z-10">
                                +{product.extraColors}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN SECTION COMPONENT
// ==========================================
export default function Product() {
    return (
        <section className="py-12 px-4 md:px-8 bg-gray-50/50 mt-8 md:mt-16">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold tracking-wide text-[#03214a] uppercase">
                        Products
                    </h2>
                </div>

                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

            </div>
        </section>
    );
}