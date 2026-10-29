import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import CartController from "../Controller/CartController.js";
import {authorize} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticate)



/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: Customer shopping cart operations
 */

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Create a cart
 *     tags: [Carts]
 *     description: Creates a cart for a Customer.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [CustomerId]
 *             properties:
 *               CustomerId:
 *                 type: string
 *                 example: 6abe16cb3d694a0f73130dc6
 *     responses:
 *       201:
 *         description: Cart created
 *       400:
 *         description: Customer already has a cart
 *       401:
 *         description: Unauthorized
 */
router.post("/",authorize("Customer"), CartController.createCart);

/**
 * @swagger
 * /api/carts/{CustomerId}/total:
 *   get:
 *     summary: Calculate cart total
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: CustomerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart total calculated
 *       404:
 *         description: Cart not found
 */
router.get("/:CustomerId/total",authorize("Customer","Admin"), CartController.getCartTotal);

/**
 * @swagger
 * /api/carts/{CustomerId}:
 *   get:
 *     summary: Get a Customer's cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: CustomerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart retrieved
 *       404:
 *         description: Cart not found
 */
router.get("/:CustomerId",authorize("Customer"), CartController.getCart);

/**
 * @swagger
 * /api/carts/{CustomerId}/items:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: CustomerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 6abe16e33d694a0f73130dc7
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       404:
 *         description: Customer or product not found
 */
router.post("/:customerId/items",authorize("Customer"), CartController.addToCart);

/**
 * @swagger
 * /api/carts/{CustomerId}/items/{productId}:
 *   put:
 *     summary: Update a cart item's quantity
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: CustomerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
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
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       404:
 *         description: Cart or product not found
 */
router.put("/:customerId/items/:productId",authorize("Customer"), CartController.updateCartItem);

/**
 * @swagger
 * /api/carts/{CustomerId}/items/{productId}:
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: CustomerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed
 *       404:
 *         description: Cart or item not found
 */
router.delete("/:CustomerId/items/:productId", authorize("Customer"), CartController.removeCartItem);

/**
 * @swagger
 * /api/carts/{CustomerId}:
 *   delete:
 *     summary: Clear a Customer's cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: CustomerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart cleared
 *       404:
 *         description: Cart not found
 */
router.delete("/:CustomerId",authorize("Customer"), CartController.clearCart);

export default router;