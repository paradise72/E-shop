import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export const CategoryModel = mongoose.model(
    "Category",
    categorySchema
);