import Order from "../models/order.model.js";
import Medicine from "../models/medicine.model.js";
import Review from '../models/review.model.js';

const TAX_RATE = 0.15;
const allowedPaymentMethods = new Set(["sslcommerz", "bkash", "cod"]);

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const createOrder = async (req, res) => {
  try {
    const { items = [], deliveryDetails = {}, paymentDetails = {} } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!deliveryDetails.fullName || !deliveryDetails.email || !deliveryDetails.deliveryAddress) {
      return res.status(400).json({ message: "Complete delivery details are required" });
    }

    const method = String(paymentDetails.method || "cod").toLowerCase();
    if (!allowedPaymentMethods.has(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }
    if (method === "bkash" && String(paymentDetails.demoOtp) !== (process.env.BKASH_DEMO_OTP || "123456")) {
      return res.status(400).json({ message: "Invalid bKash demo OTP. Use 123456" });
    }

    const normalizedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Each item must have a valid quantity" });
      }

      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: "A medicine in the cart no longer exists" });
      }
      if (!medicine.inStock || medicine.quantityAvailable < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantityAvailable}`,
        });
      }

      normalizedItems.push({
        medicineId: medicine._id,
        name: medicine.name,
        price: medicine.price,
        costPrice: medicine.costPrice ?? Number((medicine.price * 0.7).toFixed(2)),
        quantity,
        image: medicine.image,
      });
    }

    const subtotal = roundMoney(
      normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
    const tax = roundMoney(subtotal * TAX_RATE);
    const total = roundMoney(subtotal + tax);
    const orderNumber = `PH${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      items: normalizedItems,
      deliveryDetails: {
        fullName: String(deliveryDetails.fullName).trim(),
        email: String(deliveryDetails.email).trim().toLowerCase(),
        deliveryAddress: String(deliveryDetails.deliveryAddress).trim(),
      },
      paymentDetails: {
        method,
        transactionId: paymentDetails.transactionId || undefined,
        status: method === "bkash" ? "completed" : "unpaid",
      },
      subtotal,
      tax,
      total,
      status: method === "sslcommerz" ? "confirmed" : "delivered",
      isApproved: true,
      approvedAt: new Date(),
      notes: method === "sslcommerz" ? "Waiting for online payment" : "Order completed automatically",
      statusHistory: [{ status: method === 'sslcommerz' ? 'confirmed' : 'delivered', changedBy: req.user._id, actorRole: 'system', note: method === 'sslcommerz' ? 'Waiting for payment' : 'Order completed' }],
    });

    for (const item of normalizedItems) {
      const updated = await Medicine.findByIdAndUpdate(
        item.medicineId,
        { $inc: { quantityAvailable: -item.quantity } },
        { new: true }
      );
      if (updated && updated.quantityAvailable <= 0) {
        updated.inStock = false;
        updated.quantityAvailable = Math.max(0, updated.quantityAvailable);
        await updated.save();
      }
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error("Error in createOrder controller:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const sslBaseUrl = () => process.env.SSLCOMMERZ_IS_LIVE === "true"
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const sslCredentials = () => {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!storeId || !storePassword) throw new Error("SSLCOMMERZ sandbox credentials are not configured");
  return { storeId, storePassword };
};

export const initiateSslCommerzPayment = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentDetails.method !== "sslcommerz" || order.paymentDetails.status !== "unpaid") {
      return res.status(400).json({ message: "This order is not eligible for online payment" });
    }
    if (order.total < 10) {
      return res.status(400).json({ message: "SSLCOMMERZ sandbox requires a minimum order total of BDT 10" });
    }
    const { storeId, storePassword } = sslCredentials();
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const transactionId = `${order.orderNumber}-${Date.now()}`.slice(0, 50);
    const params = new URLSearchParams({
      store_id: storeId, store_passwd: storePassword, total_amount: order.total.toFixed(2), currency: "BDT",
      tran_id: transactionId, success_url: `${serverUrl}/api/orders/payment/sslcommerz/success`,
      fail_url: `${serverUrl}/api/orders/payment/sslcommerz/fail`, cancel_url: `${serverUrl}/api/orders/payment/sslcommerz/cancel`,
      ipn_url: `${serverUrl}/api/orders/payment/sslcommerz/ipn`, cus_name: order.deliveryDetails.fullName,
      cus_email: order.deliveryDetails.email, cus_add1: order.deliveryDetails.deliveryAddress, cus_city: "Dhaka",
      cus_postcode: "1000", cus_country: "Bangladesh", cus_phone: "01700000000", shipping_method: "NO",
      product_name: order.items.map((item) => item.name).join(", ").slice(0, 255), product_category: "Medicine",
      product_profile: "general", value_a: String(order._id)
    });
    const response = await fetch(`${sslBaseUrl()}/gwprocess/v4/api.php`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params });
    const result = await response.json();
    if (!response.ok || !result.GatewayPageURL) return res.status(502).json({ message: result.failedreason || "Payment gateway session failed" });
    order.paymentDetails.transactionId = transactionId;
    await order.save();
    return res.status(200).json({ gatewayUrl: result.GatewayPageURL, sessionKey: result.sessionkey });
  } catch (error) {
    console.error("SSLCOMMERZ initiation error:", error.message);
    return res.status(error.message.includes("credentials") ? 503 : 500).json({ message: error.message });
  }
};

const clientPaymentUrl = (status, orderId = "") => `${process.env.CLIENT_URL || "http://localhost:5173"}/orders?payment=${status}${orderId ? `&order=${orderId}` : ""}`;

export const sslCommerzSuccess = async (req, res) => {
  try {
    const { value_a: orderId, tran_id: transactionId } = req.body;
    const order = orderId
      ? await Order.findById(orderId)
      : await Order.findOne({ "paymentDetails.transactionId": transactionId });
    if (!order || !transactionId) return res.redirect(clientPaymentUrl("failed"));
    const { storeId, storePassword } = sslCredentials();
    const query = new URLSearchParams({ tran_id: transactionId, store_id: storeId, store_passwd: storePassword, format: "json" });
    const result = await fetch(`${sslBaseUrl()}/validator/api/merchantTransIDvalidationAPI.php?${query}`).then((response) => response.json());
    const transactions = Array.isArray(result.element) ? result.element : [];
    const valid = transactions.some((transaction) =>
      ["VALID", "VALIDATED"].includes(transaction.status) &&
      transaction.tran_id === transactionId &&
      Math.abs(Number(transaction.amount) - order.total) < 0.01 &&
      Number(transaction.risk_level || 0) === 0
    );
    if (!valid) return res.redirect(clientPaymentUrl("failed", orderId));
    order.paymentDetails.status = "completed";
    order.paymentDetails.transactionId = transactionId;
    order.status = "delivered";
    order.notes = "Payment verified and order completed";
    order.statusHistory.push({ status: 'delivered', actorRole: 'system', note: 'Online payment completed' });
    await order.save();
    return res.redirect(clientPaymentUrl("success", orderId));
  } catch (error) {
    console.error("SSLCOMMERZ validation error:", error.message);
    return res.redirect(clientPaymentUrl("failed"));
  }
};

export const sslCommerzFailure = async (req, res) => {
  const orderId = req.body.value_a;
  if (orderId) await Order.findByIdAndUpdate(orderId, { status: "cancelled", "paymentDetails.status": "failed", notes: "Online payment was not completed" });
  return res.redirect(clientPaymentUrl(req.path.endsWith("cancel") ? "cancelled" : "failed", orderId));
};

export const sslCommerzIpn = async (req, res) => {
  if (!req.body.val_id) return res.status(400).json({ message: "Validation ID required" });
  return sslCommerzSuccess(req, res);
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    const reviews = await Review.find({ userId: req.user._id }).lean();
    const reviewMap = new Map(reviews.map((review) => [String(review.medicineId), review]));
    return res.status(200).json(orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item, review: reviewMap.get(String(item.medicineId)) || null }))
    })));
  } catch (error) {
    console.error("Error in getUserOrders controller:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json(order);
  } catch (error) {
    console.error("Error in getOrderById controller:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const customerTransitions = {
  out_for_delivery: new Set(['delivered', 'return_requested']),
  delivered: new Set(['return_requested']),
  returned: new Set(['refund_requested'])
};

export const updateCustomerOrderStatus = async (req, res) => {
  try {
    const nextStatus = String(req.body.status || '');
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!customerTransitions[order.status]?.has(nextStatus)) {
      return res.status(409).json({ message: `Order cannot move from ${order.status} to ${nextStatus}` });
    }
    order.status = nextStatus;
    order.statusHistory.push({ status: nextStatus, changedBy: req.user._id, actorRole: 'user', note: String(req.body.note || '').trim() });
    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error in updateCustomerOrderStatus controller:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
