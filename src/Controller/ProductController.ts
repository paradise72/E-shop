import express from "express";
import mongoose from "mongoose";
import {ProductModel} from "../Model/Product.js";
import {CategoryModel} from "../Model/Category.js";

class ProductController {

    createProduct = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const {
                name,
                description,
                price,
                stock,
                image,
                category,
                isAvailable,
            } = request.body;

            const sellerId = (request as any).user?.userId;

            let resolvedCategory = category;
            if (category && typeof category === "string") {
                const trimmed = category.trim();
                if (mongoose.isValidObjectId(trimmed)) {
                    resolvedCategory = new mongoose.Types.ObjectId(trimmed);
                } else {
                    let catDoc = await CategoryModel.findOne({
                        name: { $regex: new RegExp(`^${trimmed}$`, "i") },
                    });
                    if (!catDoc) {
                        catDoc = new CategoryModel({
                            name: trimmed,
                            description: `${trimmed} products`,
                        });
                        await catDoc.save();
                    }
                    resolvedCategory = catDoc._id;
                }
            }

            const product = new ProductModel({
                name,
                description,
                price,
                stock,
                image: image || "",
                category: resolvedCategory,
                isAvailable: isAvailable !== undefined ? isAvailable : (Number(stock) > 0),
                seller: sellerId || undefined,
            });

            await product.save();

            const populatedProduct = await ProductModel
                .findById(product._id)
                .populate("category")
                .populate("seller", "name email role");

            return response.status(201).json({
                message: "Product created successfully",
                data: populatedProduct,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to create product",
                error,
            });
        }
    };

    getMySellerProducts = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const userId = (request as any).user?.userId;
            if (!userId) {
                return response.status(401).json({ message: "User not authenticated" });
            }

            const products = await ProductModel.find({ seller: userId })
                .populate("category")
                .populate("seller", "name email role")
                .sort({ createdAt: -1 });

            return response.status(200).json({
                data: products,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get seller products",
                error,
            });
        }
    };

    getAllProducts = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const products = await ProductModel.find()
                .populate("category")
                .populate("seller", "name email role")
                .sort({ createdAt: -1 });

            return response.status(200).json({
                data: products,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to get products",
                error,
            });
        }
    };


    getProduct = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const product = await ProductModel.findById(id)
                .populate("category")
                .populate("seller", "name email role");

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            return response.status(200).json({
                data: product,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to get product",
                error,
            });
        }
    };


    updateProduct = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const {
                name,
                description,
                price,
                stock,
                image,
                category,
                isAvailable,
            } = request.body;

            const product = await ProductModel.findById(id).populate("category");

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            const currentUser = (request as any).user;
            if (currentUser && currentUser.role === "Seller") {
                const sellerId = (product.seller as any)?._id?.toString() || product.seller?.toString();
                if (sellerId && sellerId !== currentUser.userId) {
                    return response.status(403).json({
                        message: "Unauthorized: You can only update your own products",
                    });
                }
            }

            if (name !== undefined) product.name = name;
            if (description !== undefined) product.description = description;
            if (price !== undefined) product.price = Number(price);
            if (stock !== undefined) {
                product.stock = Number(stock);
                if (product.stock > 0 && isAvailable === undefined) {
                    product.isAvailable = true;
                }
            }
            if (image !== undefined) product.image = image;
            if (category !== undefined) {
                let resolvedCat = category;
                if (typeof category === "string") {
                    const trimmed = category.trim();
                    if (mongoose.isValidObjectId(trimmed)) {
                        resolvedCat = new mongoose.Types.ObjectId(trimmed);
                    } else if (trimmed) {
                        let catDoc = await CategoryModel.findOne({
                            name: { $regex: new RegExp(`^${trimmed}$`, "i") },
                        });
                        if (!catDoc) {
                            catDoc = new CategoryModel({
                                name: trimmed,
                                description: `${trimmed} products`,
                            });
                            await catDoc.save();
                        }
                        resolvedCat = catDoc._id;
                    }
                }
                product.category = resolvedCat;
            }
            if (isAvailable !== undefined) product.isAvailable = isAvailable;

            await product.save();

            const updatedProduct = await ProductModel.findById(product._id)
                .populate("category")
                .populate("seller", "name email role");

            return response.status(200).json({
                message: "Product updated successfully",
                data: updatedProduct,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to update product",
                error,
            });
        }
    };


    deleteProduct = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const product = await ProductModel.findById(id);

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            const currentUser = (request as any).user;
            if (currentUser && currentUser.role === "Seller") {
                const sellerId = (product.seller as any)?._id?.toString() || product.seller?.toString();
                if (sellerId && sellerId !== currentUser.userId) {
                    return response.status(403).json({
                        message: "Unauthorized: You can only delete your own products",
                    });
                }
            }

            await ProductModel.findByIdAndDelete(id);

            return response.status(200).json({
                message: "Product deleted successfully",
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to delete product",
                error,
            });
        }
    };


    searchProducts = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { name } = request.query;

            if (!name || typeof name !== "string") {
                return response.status(400).json({
                    message: "Search name is required"
                });
            }

            const products = await ProductModel.find({
                name: {
                    $regex: name,
                    $options: "i",
                },
            }).populate("category").populate("seller", "name email role");

            return response.status(200).json({
                data: products
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to search products",
                error
            });
        }
    };

    getProductsByCategory = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { categoryId } = request.params;

            const products = await ProductModel.find({
                category: categoryId,
            }).populate("category").populate("seller", "name email role");

            return response.status(200).json({
                data: products,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to get products by category",
                error,
            });
        }
    };



    updateStock = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;
            const { stock } = request.body;

            const product = await ProductModel.findById(id);

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            const currentUser = (request as any).user;
            if (currentUser && currentUser.role === "Seller") {
                const sellerId = (product.seller as any)?._id?.toString() || product.seller?.toString();
                if (sellerId && sellerId !== currentUser.userId) {
                    return response.status(403).json({
                        message: "Unauthorized: You can only update stock of your own products",
                    });
                }
            }

            product.stock = Number(stock);
            if (product.stock > 0) {
                product.isAvailable = true;
            } else {
                product.isAvailable = false;
            }

            await product.save();

            const updatedProduct = await ProductModel.findById(product._id)
                .populate("category")
                .populate("seller", "name email role");

            return response.status(200).json({
                message: "Stock updated successfully",
                data: updatedProduct,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to update stock",
                error,
            });
        }
    };

    increaseStock = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;
            const amount = Number(request.body.amount || request.body.quantity || request.body.stock);

            if (isNaN(amount) || amount <= 0) {
                return response.status(400).json({
                    message: "Stock increase amount must be a positive number",
                });
            }

            const product = await ProductModel.findById(id);

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            const currentUser = (request as any).user;
            if (currentUser && currentUser.role === "Seller") {
                const sellerId = (product.seller as any)?._id?.toString() || product.seller?.toString();
                if (sellerId && sellerId !== currentUser.userId) {
                    return response.status(403).json({
                        message: "Unauthorized: You can only increase stock of your own products",
                    });
                }
            }

            product.stock += amount;
            if (product.stock > 0) {
                product.isAvailable = true;
            }

            await product.save();

            const updatedProduct = await ProductModel.findById(product._id)
                .populate("category")
                .populate("seller", "name email role");

            return response.status(200).json({
                message: `Stock increased by ${amount} successfully`,
                data: updatedProduct,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to increase stock",
                error,
            });
        }
    };


    reduceStock = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;
            const { quantity } = request.body;

            const product = await ProductModel.findById(id);

            if (!product) {
                return response.status(404).json({
                    message: "Product not found",
                });
            }

            if (quantity <= 0) {
                return response.status(400).json({
                    message: "Quantity must be greater than 0",
                });
            }

            if (product.stock < quantity) {
                return response.status(400).json({
                    message: "Insufficient stock",
                });
            }

            product.stock = product.stock - quantity;

            await product.save();

            return response.status(200).json({
                message: "Stock reduced successfully",
                data: product,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to reduce stock",
                error,
            });
        }
    };
}

export default new ProductController();