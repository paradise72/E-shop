import express from "express";
import { CartModel } from "../Model/Cart.js";
import {CustomerModel} from "../Model/Customer.js";
import {ProductModel} from "../Model/Product.js";


class CartController {

    createCart = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId } = request.body;

            const customer = await CustomerModel.findById(customerId);

            if (!customer) {
                return response.status(404).json({
                    message: "Customer not found",
                });
            }

            const existingCart = await CartModel.findOne({
                customer: customerId,
            });

            if (existingCart) {
                return response.status(400).json({
                    message: "Customer already has a cart",
                });
            }

            const cart = new CartModel({
                customer: customerId,
                items: [],
            });

            await cart.save();

            return response.status(201).json({
                message: "Cart created successfully",
                data: cart,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to create cart",
                error,
            });
        }
    };


    getCart = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId } = request.params;

            const cart = await CartModel.findOne({
                customer: customerId,
            })
                .populate("customer")
                .populate("items.product");

            if (!cart) {
                return response.status(404).json({
                    message: "Cart not found",
                });
            }

            return response.status(200).json({
                data: cart,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get cart",
                error,
            });
        }
    };


    addToCart = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId } = request.params;
            const { productId, quantity } = request.body;

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return response.status(400).json({
                    message: "Quantity must be a positive integer",
                });
            }

            const customer = await CustomerModel.findById(customerId);

            if (!customer) {
                return response.status(404).json({
                    message: "Customer not found",
                });
            }

            const product = await ProductModel.findById(productId);

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            if (!product.isAvailable || product.stock < quantity) {
                return response.status(400).json({
                    message: "Product is unavailable or stock is insufficient",
                });
            }

            let cart = await CartModel.findOne({
                customer: customerId,
            });

            if (!cart) {
                cart = new CartModel({
                    customer: customerId,
                    items: [],
                });
            }

            const existingItem = cart.items.find(
                (item) => item.product.toString() === productId
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;

                if (newQuantity > product.stock) {
                    return response.status(400).json({
                        message: "Requested quantity exceeds available stock",
                    });
                }

                existingItem.quantity = newQuantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                });
            }

            await cart.save();

            const updatedCart = await CartModel.findById(cart._id)
                .populate("customer")
                .populate("items.product");

            return response.status(200).json({
                message: "Product added to cart successfully",
                data: updatedCart,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to add product to cart",
                error,
            });
        }
    };



    updateCartItem = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId, productId } = request.params;
            const { quantity } = request.body;

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return response.status(400).json({
                    message: "Quantity must be a positive integer",
                });
            }

            const cart = await CartModel.findOne({
                customer: customerId,
            });

            if (!cart) {
                return response.status(404).json({
                    message: "Cart not found",
                });
            }

            const item = cart.items.find(
                (item) => item.product.toString() === productId
            );

            if (!item) {
                return response.status(404).json({
                    message: "Product not found in cart",
                });
            }

            const product = await ProductModel.findById(productId);

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            if (!product.isAvailable || quantity > product.stock) {
                return response.status(400).json({
                    message: "Requested quantity exceeds available stock",
                });
            }

            item.quantity = quantity;

            await cart.save();

            const updatedCart = await CartModel.findById(cart._id)
                .populate("customer")
                .populate("items.product");

            return response.status(200).json({
                message: "Cart item updated successfully",
                data: updatedCart,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to update cart item",
                error,
            });
        }
    };


    removeCartItem = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId, productId } = request.params;

            const cart = await CartModel.findOne({
                customer: customerId,
            });

            if (!cart) {
                return response.status(404).json({
                    message: "Cart not found",
                });
            }

            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                return response.status(404).json({
                    message: "Product not found in cart",
                });
            }

            cart.items.splice(itemIndex, 1);

            await cart.save();

            const updatedCart = await CartModel.findById(cart._id)
                .populate("customer")
                .populate("items.product");

            return response.status(200).json({
                message: "Product removed from cart",
                data: updatedCart,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to remove cart item",
                error,
            });
        }
    };


    clearCart = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId } = request.params;

            const cart = await CartModel.findOne({
                customer: customerId,
            });

            if (!cart) {
                return response.status(404).json({
                    message: "Cart not found",
                });
            }

            cart.items.splice(0,cart.items.length)

            await cart.save();

            return response.status(200).json({
                message: "Cart cleared successfully",
                data: cart,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to clear cart",
                error,
            });
        }
    };


    getCartTotal = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { customerId } = request.params;

            const cart = await CartModel.findOne({
                customer: customerId,
            }).populate("items.product");

            if (!cart) {
                return response.status(404).json({
                    message: "Cart not found",
                });
            }

            const total = cart.items.reduce((sum, item) => {
                const product = item.product as any;

                return sum + product.price * item.quantity;
            }, 0);

            return response.status(200).json({
                message: "Cart total calculated successfully",
                total,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to calculate cart total",
                error,
            });
        }
    };
}

export default new CartController();