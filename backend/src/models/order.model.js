import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [{
            medicineId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medicine',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            costPrice: {
                type: Number,
                min: 0
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            image: String
        }],
        deliveryDetails: {
            fullName: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            deliveryAddress: {
                type: String,
                required: true
            }
        },
        paymentDetails: {
            method: {
                type: String,
                enum: ['sslcommerz', 'card', 'bkash', 'nagad', 'rocket', 'cod'],
                required: true
            },
            transactionId: String,
            status: {
                type: String,
                enum: ['unpaid', 'completed', 'failed'],
                default: 'unpaid'
            }
        },
        subtotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['confirmed', 'processing', 'with_delivery_partner', 'out_for_delivery', 'delivered', 'return_requested', 'returned', 'refund_requested', 'refunded', 'cancelled'],
            default: 'processing'
        },
        statusHistory: [{
            status: { type: String, required: true },
            changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            actorRole: { type: String, enum: ['admin', 'user', 'system'], default: 'system' },
            note: { type: String, trim: true, maxlength: 300 },
            changedAt: { type: Date, default: Date.now }
        }],
        isApproved: {
            type: Boolean,
            default: true
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        notes: String
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
