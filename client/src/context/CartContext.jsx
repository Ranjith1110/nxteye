import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        const existingItem = cartItems.find((item) => item.id === product.id);
        if (existingItem) {
            alert("This item is already in your cart!");
            return;
        }
        setCartItems([...cartItems, product]);
        alert(`${product.brand} added to cart!`);
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);