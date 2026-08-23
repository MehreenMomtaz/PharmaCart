import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useCartStore = create(
    persist(
        (set, get) => ({
                cartItems: [],
                totalItems: 0,
                totalPrice: 0,

                // Add item to cart
                addToCart: (medicine, quantity = 1) => {
                    const currentCart = get().cartItems;
                    const existingItem = currentCart.find(item => item._id === medicine._id);

                    let updatedCart;
                    
                    if (existingItem) {
                        // Update quantity if item already exists
                        const newQuantity = existingItem.quantity + quantity;
                        
                        // Check if new quantity exceeds available stock
                        if (newQuantity > medicine.quantityAvailable) {
                            toast.error(`Only ${medicine.quantityAvailable} items available in stock`);
                            return;
                        }
                        
                        updatedCart = currentCart.map(item =>
                            item._id === medicine._id
                                ? { ...item, quantity: newQuantity }
                                : item
                        );
                        toast.success(`Updated ${medicine.name} quantity in cart`);
                    } else {
                        // Add new item to cart
                        if (quantity > medicine.quantityAvailable) {
                            toast.error(`Only ${medicine.quantityAvailable} items available in stock`);
                            return;
                        }
                        
                        // Ensure the medicine object has valid data
                        const medicineWithValidData = {
                            ...medicine,
                            price: Number(medicine.price) || 0,
                            quantityAvailable: Number(medicine.quantityAvailable) || 0
                        };
                        
                        updatedCart = [...currentCart, { ...medicineWithValidData, quantity }];
                        toast.success(`${medicine.name} added to cart`);
                    }

                    get().updateCartTotals(updatedCart);
                },

            // Remove item from cart
            removeFromCart: (medicineId) => {
                const currentCart = get().cartItems;
                const updatedCart = currentCart.filter(item => item._id !== medicineId);
                
                get().updateCartTotals(updatedCart);
                toast.success('Item removed from cart');
            },

            // Update item quantity
            updateQuantity: (medicineId, newQuantity) => {
                const currentCart = get().cartItems;
                const item = currentCart.find(item => item._id === medicineId);
                
                if (!item) return;
                
                if (newQuantity <= 0) {
                    get().removeFromCart(medicineId);
                    return;
                }
                
                if (newQuantity > item.quantityAvailable) {
                    toast.error(`Only ${item.quantityAvailable} items available in stock`);
                    return;
                }
                
                const updatedCart = currentCart.map(cartItem =>
                    cartItem._id === medicineId
                        ? { ...cartItem, quantity: newQuantity }
                        : cartItem
                );
                
                get().updateCartTotals(updatedCart);
            },

            // Clear entire cart
            clearCart: () => {
                set({ cartItems: [], totalItems: 0, totalPrice: 0 });
                toast.success('Cart cleared');
            },

            // Update cart totals
            updateCartTotals: (cartItems) => {
                const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = cartItems.reduce((sum, item) => {
                    // Ensure price is a valid number
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.quantity) || 0;
                    return sum + (price * quantity);
                }, 0);
                
                set({ cartItems, totalItems, totalPrice });
            },

            // Get item quantity in cart
            getItemQuantity: (medicineId) => {
                const item = get().cartItems.find(item => item._id === medicineId);
                return item ? item.quantity : 0;
            },

            // Check if item is in cart
            isInCart: (medicineId) => {
                return get().cartItems.some(item => item._id === medicineId);
            },

            // Get total with tax
            getTotalWithTax: (taxRate = 0.15) => {
                const total = get().totalPrice;
                return total + (total * taxRate);
            }
        }),
        {
            name: 'pharmacart-cart', // unique name for localStorage
            partialize: (state) => ({ 
                cartItems: state.cartItems,
                totalItems: state.totalItems,
                totalPrice: state.totalPrice
            })
        }
    )
);
