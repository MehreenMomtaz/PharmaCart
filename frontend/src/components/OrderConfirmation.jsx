import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, MapPin, CreditCard } from 'lucide-react';

const OrderConfirmation = () => {
    const location = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        if (location.state) {
            setOrderDetails(location.state);
        }
    }, [location.state]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    if (!orderDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Order confirmation not found
                        </h2>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        Thank you for your order. We'll send you a confirmation email shortly.
                    </p>
                    <div className="text-lg font-semibold text-blue-600">
                        Order #{orderDetails.orderNumber}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Order Details */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Summary
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Total</span>
                                <span className="font-bold text-2xl text-green-600">
                                    {formatPrice(orderDetails.orderTotal)}
                                </span>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        Order Date: {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        Payment Status: Confirmed
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Truck className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        Estimated Delivery: 3-5 business days
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Delivery Address
                        </h2>
                        
                        <div className="space-y-2">
                            <p className="font-medium text-gray-900">
                                {orderDetails.deliveryDetails.fullName || 
                                    `${orderDetails.deliveryDetails.firstName || ''} ${orderDetails.deliveryDetails.lastName || ''}`.trim()}
                            </p>
                            {orderDetails.deliveryDetails.deliveryAddress ? (
                                <p className="text-gray-600 whitespace-pre-line">{orderDetails.deliveryDetails.deliveryAddress}</p>
                            ) : (
                                <div className="text-gray-600">
                                    <p>{orderDetails.deliveryDetails.address}</p>
                                    <p>{orderDetails.deliveryDetails.city}, {orderDetails.deliveryDetails.state} {orderDetails.deliveryDetails.zipCode}</p>
                                    <p>{orderDetails.deliveryDetails.country}</p>
                                    {orderDetails.deliveryDetails.phone && <p>Phone: {orderDetails.deliveryDetails.phone}</p>}
                                </div>
                            )}
                            <p className="text-gray-600 text-sm">
                                <strong>Email:</strong> {orderDetails.deliveryDetails.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">What's Next?</h2>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Order Confirmed</h3>
                            <p className="text-sm text-gray-600">
                                We've received your order and will begin processing it shortly.
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Package className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Preparing Order</h3>
                            <p className="text-sm text-gray-600">
                                Our pharmacy team will prepare your medicines with care.
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Truck className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Out for Delivery</h3>
                            <p className="text-sm text-gray-600">
                                We'll notify you when your order is on its way.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-center"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        to="/profile"
                        className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-xl font-semibold border border-gray-300 transition-all text-center"
                    >
                        View Order History
                    </Link>
                </div>

                {/* Support */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-2">
                        Need help with your order?
                    </p>
                    <a
                        href="mailto:support@pharmacart.com"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Contact our support team
                    </a>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
