import mongoose, { Schema } from "mongoose";


const paymentSchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        customer: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index:true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        method: {
            type: String,
            enum: [
                "MOMO",
                "CARD",
                "BANK_TRANSFER",
            ],
            required: true,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "SUCCESS",
                "FAILED",
                "REFUNDED",
            ],
            default: "PENDING",
        },

        transactionId: {
            type: String,
            default: crypto.randomUUID(),
        },
    },
    { timestamps: true }
);

export const PaymentModel = mongoose.model(
    "Payment",
    paymentSchema
);