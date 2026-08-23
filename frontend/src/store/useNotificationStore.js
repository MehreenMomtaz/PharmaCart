import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            addNotification: (notification) => {
                const newNotification = {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    isRead: false,
                    ...notification
                };

                set(state => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1
                }));
            },

            markAsRead: (notificationId) => {
                set(state => ({
                    notifications: state.notifications.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            },

            markAllAsRead: () => {
                set(state => ({
                    notifications: state.notifications.map(notification => ({
                        ...notification,
                        isRead: true
                    })),
                    unreadCount: 0
                }));
            },

            deleteNotification: (notificationId) => {
                set(state => {
                    const notification = state.notifications.find(n => n.id === notificationId);
                    return {
                        notifications: state.notifications.filter(n => n.id !== notificationId),
                        unreadCount: notification && !notification.isRead 
                            ? Math.max(0, state.unreadCount - 1) 
                            : state.unreadCount
                    };
                });
            },

            clearAllNotifications: () => {
                set({ notifications: [], unreadCount: 0 });
            },

            // Helper functions for different notification types
            addOrderConfirmation: (orderData) => {
                get().addNotification({
                    type: 'order_confirmation',
                    title: 'Order Confirmed',
                    message: `Your order #${orderData.orderNumber} has been confirmed for ৳${orderData.total}`,
                    icon: '✅',
                    orderId: orderData._id,
                    orderNumber: orderData.orderNumber
                });
            },

            addDeliveryUpdate: (orderData, status) => {
                const statusMessages = {
                    confirmed: 'Your order has been confirmed and is being prepared.',
                    processing: 'Your order is being processed by our pharmacy team.',
                    shipped: 'Your order has been shipped and is on its way!',
                    delivered: 'Your order has been delivered successfully.'
                };

                const statusIcons = {
                    confirmed: '📋',
                    processing: '⚗️',
                    shipped: '🚚',
                    delivered: '📦'
                };

                get().addNotification({
                    type: 'delivery_update',
                    title: 'Order Update',
                    message: `Order #${orderData.orderNumber}: ${statusMessages[status]}`,
                    icon: statusIcons[status] || '📋',
                    orderId: orderData._id,
                    orderNumber: orderData.orderNumber,
                    status
                });
            },

            addLowStockAlert: (medicineName) => {
                get().addNotification({
                    type: 'low_stock',
                    title: 'Low Stock Alert',
                    message: `${medicineName} is running low in stock. Order soon!`,
                    icon: '⚠️'
                });
            },

            addPromotionalAlert: (title, message) => {
                get().addNotification({
                    type: 'promotional',
                    title,
                    message,
                    icon: '🎉'
                });
            }
        }),
        {
            name: 'pharmacart-notifications',
            partialize: (state) => ({
                notifications: state.notifications,
                unreadCount: state.unreadCount
            })
        }
    )
);
