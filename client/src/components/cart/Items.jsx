import React from 'react';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Items = () => {
    const { cartItems, removeFromCart } = useCart();

    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    return (
        <section className="py-12 px-4 md:px-8 mt-20 min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-[#03214a] mb-8">Shopping Cart</h2>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-xl font-medium text-gray-600 mb-4">Your cart is currently empty.</h3>
                        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline">
                            <FaArrowLeft /> Go back to shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md">
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center p-2">
                                        <img src={item.image} alt={item.brand} className="w-full h-full object-contain" />
                                    </div>

                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="font-bold text-gray-800 text-lg">{item.brand}</h3>
                                        <p className="text-gray-500 text-sm">{item.details}</p>
                                        <p className="text-teal-600 font-bold mt-1 text-lg">₹{item.price}</p>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-3 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Remove item"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Order Summary</h3>
                                <div className="flex justify-between mb-3 text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <div className="flex justify-between mb-4 text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-teal-600 font-bold">Free</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-2xl text-gray-900 mb-6">
                                    <span>Total</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <button className="w-full bg-[#03214a] text-white py-3.5 rounded-lg font-bold hover:bg-blue-900 transition-colors shadow-lg active:scale-95">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Items;