import express from "express";
import ProductController from "../Controller/ProductController.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";

const router = express.Router();

// router.use(authenticate)
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Manage products, search, categories and stock
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               description:
 *                 type: string
 *                 example: Lenovo laptop
 *               price:
 *                 type: number
 *                 example: 640000
 *               stock:
 *                 type: integer
 *                 example: 12
 *               image:
 *                 type: string
 *                 example: https://kanis.rw/storage/app/public/product/2024-07-04-668697951f6a9.png
 *               category:
 *                 type: string
 *                 example: 6abe16cb3d694a0f73130dc6
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid product data
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products retrieved
 */
router.post("/", authenticate, authorize("Seller", "Admin"), ProductController.createProduct);
router.get("/", ProductController.getAllProducts);
router.get("/seller/my-products", authenticate, authorize("Seller", "Admin"), ProductController.getMySellerProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products by name
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: laptop
 *     responses:
 *       200:
 *         description: Matching products retrieved
 *       400:
 *         description: Search name is required
 */

router.get("/search", ProductController.searchProducts);

/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products in the category retrieved
 */
router.get("/category/:categoryId", ProductController.getProductsByCategory);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               description:
 *                 type: string
 *                 example: Lenovo laptop
 *               price:
 *                 type: number
 *                 example: 640000
 *               stock:
 *                 type: integer
 *                 example: 10
 *               image:
 *                 type: string
 *                 example: https://example.com/laptop.jpg
 *               category:
 *                 type: string
 *                 example: 6abe16cb3d694a0f73130dc6
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.get("/:id", ProductController.getProduct);
router.put("/:id", authenticate, authorize("Seller", "Admin"), ProductController.updateProduct);
router.delete("/:id", authenticate, authorize("Seller", "Admin"), ProductController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     summary: Set a product's stock quantity
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stock]
 *             properties:
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 20
 *     responses:
 *       200:
 *         description: Stock updated
 *       404:
 *         description: Product not found
 */
router.patch("/:id/stock", authenticate, authorize("Seller", "Admin"), ProductController.updateStock);
router.patch("/:id/increase-stock", authenticate, authorize("Seller", "Admin"), ProductController.increaseStock);

/**
 * @swagger
 * /api/products/{id}/reduce-stock:
 *   patch:
 *     summary: Reduce a product's stock
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Stock reduced
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       404:
 *         description: Product not found
 */
router.patch("/:id/reduce-stock", authenticate, authorize("Customer", "Seller", "Admin"), ProductController.reduceStock);

export default router;