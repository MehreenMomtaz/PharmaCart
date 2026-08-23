import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartSummary = ({ isOpen, onClose }) => {
    const { cartItems, totalItems, totalPrice, removeFromCart } = useCartStore();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Shopping Cart ({totalItems})
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Qty: {item.quantity}
                                            </p>
                                            <p className="text-sm font-semibold text-green-600">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t p-4 space-y-4">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total:</span>
                                <span className="text-green-600">{formatPrice(totalPrice)}</span>
                            </div>
                            <Link
                                to="/cart"
                                onClick={onClose}
                                className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium"
                            >
                                View Cart & Checkout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
