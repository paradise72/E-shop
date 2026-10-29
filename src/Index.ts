import express from "express";
import connectDB from "./config/Database.js";
import productRoutes from "./Routes/productRoutes.js";
import categoryRoutes from "./Routes/categoryRoutes.js";
import customerRoutes from "./Routes/customerRoutes.js";
import authRouter from "./Routes/authRouter.js";
import cartRoutes from "./Routes/cartRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/Swagger.js";
import cors from "cors";
import { CategoryModel } from "./Model/Category.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 4000;

const seedDefaultCategories = async () => {
    try {
        const count = await CategoryModel.countDocuments();
        if (count === 0) {
            const defaults = [
                { name: "Electronics", description: "Gadgets, devices, and consumer electronics" },
                { name: "Transport & Driving", description: "Bikes, cars, and vehicles" },
                { name: "Food & Groceries", description: "Quality food, pantry items, and groceries" },
                { name: "Fresh Produce", description: "Fresh fruits, vegetables, and farm goods" },
                { name: "Construction & Tools", description: "Hardware, building supplies, and tools" },
                { name: "Clothing & Fashion", description: "Men and women apparel and accessories" },
                { name: "Furniture & Living", description: "Home furniture and living decor" },
                { name: "Computers & Laptops", description: "Laptops, desktops, and accessories" },
                { name: "Phones & Tablets", description: "Smartphones, tablets, and mobile gadgets" },
                { name: "Sports & Outdoors", description: "Sporting goods and outdoor gear" },
            ];
            await CategoryModel.insertMany(defaults);
            console.log("Default categories seeded successfully.");
        }
    } catch (e) {
        console.warn("Category auto-seed note:", e);
    }
};

const startServer = async () => {
    try {
        await connectDB();
        await seedDefaultCategories();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

startServer();