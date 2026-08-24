import Medicine from "../models/medicine.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Review from '../models/review.model.js';
import Blog from '../models/blog.model.js';

// Medicine Management
export const getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({}).sort({ createdAt: -1 });
        res.status(200).json(medicines);
    } catch (error) {
        console.log("Error in getAllMedicines controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const createMedicine = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            costPrice,
            quantityAvailable,
            image,
            category,
            manufacturer,
            requiresPrescription,
            activeIngredient,
            dosage,
            dosageForm,
            strength,
            expiryDate,
            sideEffects,
            warnings,
            inStock
        } = req.body;

        const medicine = new Medicine({
            name,
            description,
            price,
            costPrice: costPrice === undefined || costPrice === '' ? undefined : Number(costPrice),
            quantityAvailable,
            image,
            category,
            manufacturer,
            requiresPrescription,
            activeIngredient,
            dosage,
            dosageForm,
            strength,
            expiryDate,
            sideEffects,
            warnings,
            inStock: typeof inStock === "boolean" ? inStock : Number(quantityAvailable) > 0
        });

        await medicine.save();
        res.status(201).json(medicine);
    } catch (error) {
        console.log("Error in createMedicine controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const medicine = await Medicine.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        res.status(200).json(medicine);
    } catch (error) {
        console.log("Error in updateMedicine controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;

        const medicine = await Medicine.findByIdAndDelete(id);

        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        res.status(200).json({ message: "Medicine deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMedicine controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Order Management
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'fullName email')
            .populate('approvedBy', 'fullName')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.log("Error in getAllOrders controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getCustomers = async (req, res) => {
    try {
        const customers = await User.aggregate([
            { $match: { role: 'user' } },
            { $lookup: { from: 'orders', localField: '_id', foreignField: 'userId', as: 'orders' } },
            { $project: {
                fullName: 1, email: 1, profilePic: 1, createdAt: 1,
                orderCount: { $size: '$orders' },
                totalSpent: { $sum: { $map: { input: '$orders', as: 'order', in: { $cond: [{ $ne: ['$$order.status', 'cancelled'] }, '$$order.total', 0] } } } },
                lastOrderAt: { $max: '$orders.createdAt' }
            } },
            { $sort: { createdAt: -1 } }
        ]);
        return res.status(200).json(customers);
    } catch (error) {
        console.log('Error in getCustomers controller:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('userId', 'fullName email phone')
            .populate('approvedBy', 'fullName');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.log("Error in getOrderById controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const allowedTransitions = {
            confirmed: ['processing'],
            processing: ['with_delivery_partner'],
            with_delivery_partner: ['out_for_delivery'],
            return_requested: ['returned'],
            refund_requested: ['refunded']
        };
        if (!allowedTransitions[order.status]?.includes(status)) {
            return res.status(409).json({ message: `Order cannot move from ${order.status} to ${status}. Completed steps cannot be undone.` });
        }
        order.status = status;
        order.notes = notes || order.notes;
        order.statusHistory.push({ status, changedBy: req.user._id, actorRole: 'admin', note: notes });
        await order.save();
        await order.populate('userId', 'fullName email');
        res.status(200).json(order);
    } catch (error) {
        console.log("Error in updateOrderStatus controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const approveOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            {
                isApproved: true,
                approvedBy: req.user._id,
                approvedAt: new Date(),
                status: 'confirmed',
                notes
            },
            { new: true }
        ).populate('userId', 'fullName email');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.log("Error in approveOrder controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const completeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // First check if order is approved
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.isApproved) {
            return res.status(400).json({ message: "Order must be approved before completion" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                status: 'delivered',
                notes: notes || order.notes
            },
            { new: true }
        ).populate('userId', 'fullName email');

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.log("Error in completeOrder controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const rejectOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            {
                status: 'cancelled',
                notes
            },
            { new: true }
        ).populate('userId', 'fullName email');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.log("Error in rejectOrder controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Analytics
export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const range = ['7d', '30d', '12m', 'all'].includes(req.query.range) ? req.query.range : '30d';
        const rangeStart = new Date(now);
        if (range === '7d') rangeStart.setDate(rangeStart.getDate() - 6);
        if (range === '30d') rangeStart.setDate(rangeStart.getDate() - 29);
        if (range === '12m') rangeStart.setMonth(rangeStart.getMonth() - 11, 1);
        rangeStart.setHours(0, 0, 0, 0);
        const dateMatch = range === 'all' ? {} : { createdAt: { $gte: rangeStart, $lte: now } };
        const paidOrderMatch = { ...dateMatch, status: { $ne: 'cancelled' }, $or: [{ 'paymentDetails.method': 'cod' }, { 'paymentDetails.status': 'completed' }] };
        const totalMedicines = await Medicine.countDocuments();
        const totalOrders = await Order.countDocuments();
        const [totalUsers, totalReviews, totalBlogs] = await Promise.all([
            User.countDocuments({ role: 'user' }), Review.countDocuments(), Blog.countDocuments()
        ]);

        const recentOrders = await Order.find({})
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(5);

        const lowStockMedicines = await Medicine.find({ quantityAvailable: { $lt: 10 } })
            .sort({ quantityAvailable: 1 })
            .limit(10);

        const [analytics = { revenue: 0, profit: 0, unitsSold: 0, orders: 0 }, statusStats, salesTrend] = await Promise.all([
            Order.aggregate([
                { $match: paidOrderMatch },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$total' },
                        profit: {
                            $sum: {
                                $sum: {
                                    $map: {
                                        input: '$items',
                                        as: 'item',
                                        in: {
                                            $multiply: [
                                                { $subtract: ['$$item.price', { $ifNull: ['$$item.costPrice', { $multiply: ['$$item.price', 0.7] }] }] },
                                                '$$item.quantity'
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        unitsSold: { $sum: { $sum: '$items.quantity' } },
                        orders: { $sum: 1 }
                    }
                },
                { $project: { _id: 0, revenue: 1, profit: 1, unitsSold: 1, orders: 1 } }
            ]).then((rows) => rows[0]),
            Order.aggregate([
                { $match: dateMatch },
                { $group: { _id: { $cond: [{ $eq: ['$status', 'pending'] }, 'processing', '$status'] }, count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Order.aggregate([
                { $match: paidOrderMatch },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: range === '12m' || range === 'all' ? '%Y-%m' : '%Y-%m-%d',
                                date: '$createdAt',
                                timezone: '+06:00'
                            }
                        },
                        revenue: { $sum: '$total' },
                        orders: { $sum: 1 },
                        units: { $sum: { $sum: '$items.quantity' } },
                        profit: {
                            $sum: {
                                $sum: {
                                    $map: {
                                        input: '$items',
                                        as: 'item',
                                        in: {
                                            $multiply: [
                                                { $subtract: ['$$item.price', { $ifNull: ['$$item.costPrice', { $multiply: ['$$item.price', 0.7] }] }] },
                                                '$$item.quantity'
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const monthlyOrders = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$total" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
        ]);

        res.status(200).json({
            stats: {
                totalMedicines,
                totalOrders,
                totalUsers,
                totalReviews,
                totalBlogs
            },
            recentOrders,
            lowStockMedicines,
            monthlyOrders,
            analytics: { ...analytics, range, isProfitEstimated: true },
            statusStats,
            salesTrend
        });
    } catch (error) {
        console.log("Error in getDashboardStats controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Inventory Management
export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantityAvailable } = req.body;

        const medicine = await Medicine.findByIdAndUpdate(
            id,
            { quantityAvailable, inStock: Number(quantityAvailable) > 0 },
            { new: true, runValidators: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        res.status(200).json(medicine);
    } catch (error) {
        console.log("Error in updateInventory controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
