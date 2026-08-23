import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { 
    ArrowLeft, 
    Bell, 
    Trash2, 
    CheckCheck, 
    Filter,
    Calendar,
    Package,
    Truck,
    AlertTriangle,
    Gift
} from 'lucide-react';

const NotificationsPage = () => {
    const { authUser } = useAuthStore();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications
    } = useNotificationStore();

    const [filter, setFilter] = useState('all');

    // Redirect if not authenticated
    if (!authUser) {
        return <Navigate to="/login" replace />;
    }

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_confirmation': return <Package className="w-5 h-5 text-green-600" />;
            case 'delivery_update': return <Truck className="w-5 h-5 text-blue-600" />;
            case 'low_stock': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
            case 'promotional': return <Gift className="w-5 h-5 text-purple-600" />;
            default: return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'order_confirmation': return 'border-green-200 bg-green-50';
            case 'delivery_update': return 'border-blue-200 bg-blue-50';
            case 'low_stock': return 'border-orange-200 bg-orange-50';
            case 'promotional': return 'border-purple-200 bg-purple-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.isRead;
        return notification.type === filter;
    });

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <p className="text-gray-600 mt-1">
                                    You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all notifications?')) {
                                        clearAllNotifications();
                                    }
                                }}
                                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Filter notifications:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'unread', label: 'Unread' },
                            { value: 'order_confirmation', label: 'Order Confirmations' },
                            { value: 'delivery_update', label: 'Delivery Updates' },
                            { value: 'low_stock', label: 'Low Stock Alerts' },
                            { value: 'promotional', label: 'Promotions' }
                        ].map(filterOption => (
                            <button
                                key={filterOption.value}
                                onClick={() => setFilter(filterOption.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filter === filterOption.value
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filterOption.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl shadow-lg border p-6 transition-all hover:shadow-xl cursor-pointer ${
                                    !notification.isRead ? 'ring-2 ring-blue-200' : ''
                                } ${getNotificationColor(notification.type)}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {notification.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-700 mb-4">
                                            {notification.message}
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(notification.timestamp)}
                                            </div>
                                            
                                            {notification.orderId && (
                                                <Link
                                                    to="/orders"
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View Order Details
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {filter === 'all' ? 'No notifications' : `No ${filter.replace('_', ' ')} notifications`}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {filter === 'all' 
                                    ? "You're all caught up! We'll notify you when there's something new."
                                    : `No ${filter.replace('_', ' ')} notifications found. Try changing the filter.`
                                }
                            </p>
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View all notifications
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results count */}
                {filteredNotifications.length > 0 && (
                    <div className="mt-8 text-center text-gray-600">
                        Showing {filteredNotifications.length} of {notifications.length} notifications
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
