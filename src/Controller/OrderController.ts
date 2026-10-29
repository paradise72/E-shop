import express from "express";
import {CustomerModel} from "../Model/Customer.js";
import {ProductModel} from "../Model/Product.js";
import {OrderModel} from "../Model/Order.js";
import {CartModel} from "../Model/Cart.js";
import {PaymentModel} from "../Model/Payment.js";
import {userModel} from "../Model/User.js";


class OrderController {

    createOrder = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId } = request.params;
            const { deliveryAddress } = request.body;

            if (!deliveryAddress || typeof deliveryAddress !== "string") {
                return response.status(400).json({
                    message: "Delivery address is required",
                });
            }

            const customer = await CustomerModel.findById(customerId);

            if (!customer) {
                return response.status(404).json({
                    message: "Customer not found",
                });
            }

            const cart = await CartModel.findOne({
                customer: customerId,
            });

            if (!cart || cart.items.length === 0) {
                return response.status(400).json({
                    message: "Cart is empty or not found",
                });
            }

            const orderItems = [];
            let totalAmount = 0;

            for (const item of cart.items) {
                const product = await ProductModel.findById(item.product);

                if (!product) {
                    return response.status(404).json({
                        message: "A product in the cart no longer exists",
                    });
                }

                if (!product.isAvailable || product.stock < item.quantity) {
                    return response.status(400).json({
                        message: `Insufficient stock for ${product.name}`,
                    });
                }

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                });

                totalAmount += product.price * item.quantity;
            }

            // Deduct stock for all ordered products
            for (const item of orderItems) {
                const product = await ProductModel.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    if (product.stock <= 0) {
                        product.isAvailable = false;
                    }
                    await product.save();
                }
            }

            const order = new OrderModel({
                customer: customerId,
                items: orderItems,
                totalAmount,
                deliveryAddress,
            });

            await order.save();

            cart.items.splice(0, cart.items.length);
            await cart.save();

            const populatedOrder = await OrderModel.findById(order._id)
                .populate("customer")
                .populate("items.product");

            return response.status(201).json({
                message: "Order created successfully",
                data: populatedOrder,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to create order",
                error,
            });
        }
    };


    getAllOrders = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const orders = await OrderModel.find()
                .populate("customer")
                .populate("items.product");

            return response.status(200).json({
                data: orders,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get orders",
                error,
            });
        }
    };



    getOrder = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const order = await OrderModel.findById(id)
                .populate("customer")
                .populate("items.product");

            if (!order) {
                return response.status(404).json({
                    message: "Order not found",
                });
            }

            return response.status(200).json({
                data: order,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get order",
                error,
            });
        }
    };



    getCustomerOrders = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId } = request.params;

            const orders = await OrderModel.find({
                customer: customerId,
            })
                .populate("customer")
                .populate("items.product");

            return response.status(200).json({
                data: orders,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get customer orders",
                error,
            });
        }
    };



    updateOrderStatus = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;
            const { status } = request.body;

            const allowedStatuses = [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
            ];

            if (!allowedStatuses.includes(status)) {
                return response.status(400).json({
                    message: "Invalid order status",
                });
            }

            const order = await OrderModel.findById(id);

            if (!order) {
                return response.status(404).json({
                    message: "Order not found",
                });
            }

            if (order.status === "CANCELLED") {
                return response.status(400).json({
                    message: "Cancelled orders cannot be updated",
                });
            }

            order.status = status;
            await order.save();

            return response.status(200).json({
                message: "Order status updated successfully",
                data: order,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to update order status",
                error,
            });
        }
    };



    cancelOrder = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const order = await OrderModel.findById(id);

            if (!order) {
                return response.status(404).json({
                    message: "Order not found",
                });
            }

            if (order.status !== "PENDING") {
                return response.status(400).json({
                    message: "Only pending orders can be cancelled",
                });
            }

            order.status = "CANCELLED";
            await order.save();

            return response.status(200).json({
                message: "Order cancelled successfully",
                data: order,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to cancel order",
                error,
            });
        }
    };

    checkoutDirect = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const userId = (request as any).user?.userId;
            if (!userId) {
                return response.status(401).json({ message: "User not authenticated" });
            }

            const { deliveryAddress, phone, paymentMethod = "MOMO", items } = request.body;

            if (!deliveryAddress || typeof deliveryAddress !== "string") {
                return response.status(400).json({
                    message: "Delivery address is required",
                });
            }

            if (!Array.isArray(items) || items.length === 0) {
                return response.status(400).json({
                    message: "No items provided for checkout",
                });
            }

            // Find or create customer for this user
            let customer = await CustomerModel.findOne({ user: userId });
            if (!customer) {
                const user = await userModel.findById(userId);
                const nameParts = (user?.name || "Customer User").trim().split(" ");
                const firstName = nameParts[0] || "Customer";
                const lastName = nameParts.slice(1).join(" ") || "Buyer";

                customer = new CustomerModel({
                    firstName,
                    lastName,
                    email: user?.email || `buyer_${userId}@paradise.com`,
                    phone: phone || "+250780000000",
                    address: deliveryAddress,
                    user: userId,
                });
                await customer.save();
            } else if (phone || deliveryAddress) {
                if (phone) customer.phone = phone;
                if (deliveryAddress) customer.address = deliveryAddress;
                await customer.save();
            }

            const orderItems = [];
            let totalAmount = 0;

            // Validate all products and stock first
            for (const item of items) {
                const productId = item.productId || item._id || item.id;
                const quantity = Number(item.quantity) || 1;

                const product = await ProductModel.findById(productId);
                if (!product) {
                    return response.status(404).json({
                        message: `Product was not found`,
                    });
                }

                if (!product.isAvailable || product.stock < quantity) {
                    return response.status(400).json({
                        message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
                    });
                }

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity,
                });

                totalAmount += product.price * quantity;
            }

            // Deduct stock for all items
            for (const item of orderItems) {
                const product = await ProductModel.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    if (product.stock <= 0) {
                        product.isAvailable = false;
                    }
                    await product.save();
                }
            }

            // Create Order
            const order = new OrderModel({
                customer: customer._id,
                items: orderItems,
                totalAmount,
                deliveryAddress,
                status: "CONFIRMED",
            });
            await order.save();

            // Create Payment Transaction Record
            const payment = new PaymentModel({
                order: order._id,
                customer: customer._id,
                amount: totalAmount,
                method: paymentMethod,
                status: "SUCCESS",
                transactionId: crypto.randomUUID(),
            });
            await payment.save();

            // Clear database cart if one exists
            const cart = await CartModel.findOne({ customer: customer._id });
            if (cart) {
                cart.items.splice(0, cart.items.length);
                await cart.save();
            }

            const populatedOrder = await OrderModel.findById(order._id)
                .populate("customer")
                .populate("items.product");

            return response.status(201).json({
                message: "Order placed and transaction completed successfully",
                data: {
                    order: populatedOrder,
                    payment,
                },
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to complete transaction",
                error,
            });
        }
    };

    getMyOrders = async (req: express.Request, res: express.Response) => {
        try {
            const loggedInUser = (req as any).user.userId;
            if (!loggedInUser) {
                return res.status(401).json({ message: "User not found" });
            }
            const customerUser = await CustomerModel.findOne({ user: loggedInUser });
            if (!customerUser) {
                return res.status(200).json({ message: "No orders found", data: [] });
            }
            const orders = await OrderModel.find({ customer: customerUser._id })
                .populate("items.product")
                .sort({ createdAt: -1 });

            return res.status(200).json({ message: "orders found", data: orders });
        } catch (e) {
            return res.status(500).json({ message: "Failed to get orders", error: e });
        }
    };
}

export default new OrderController();