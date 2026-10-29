import express from "express";
import CategoryController from "../Controller/CategoryController.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Manage product categories
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Electronic components
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Invalid category data
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, authorize("Admin", "Seller"), CategoryController.createCategory);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved
 */
router.get("/", CategoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *                 example: Computers
 *               description:
 *                 type: string
 *                 example: Laptops and desktop computers
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */

router.get("/:id", CategoryController.getCategory);

router.put("/:id", authenticate, authorize("Admin"), CategoryController.updateCategory);

router.delete("/:id", authenticate, authorize("Admin"), CategoryController.deleteCategory);

export default router;