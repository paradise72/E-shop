import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            unique: true,
        },

        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

export const CartModel = mongoose.model(
    "Cart",
    cartSchema
);