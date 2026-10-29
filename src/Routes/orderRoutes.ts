import express from "express";
import OrderController from "../Controller/OrderController.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";


const router = express.Router();

router.use(authenticate);
router.post("/checkout", authorize("Customer", "Seller", "Admin"), OrderController.checkoutDirect);
router.get("/my-orders", authorize("Customer", "Seller", "Admin"), OrderController.getMyOrders);
router.get("/Customers/my-orders", authorize("Customer", "Seller", "Admin"), OrderController.getMyOrders);
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Create and manage Customer orders
 */

/**
 * @swagger
 * /api/orders/Customer/{CustomerId}:
 *   post:
 *     summary: Create an order from a Customer's cart
 *     tags: [Orders]
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
 *             required: [deliveryAddress]
 *             properties:
 *               deliveryAddress:
 *                 type: string
 *                 example: Kigali, Rwanda
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Empty cart or insufficient stock
 *       404:
 *         description: Customer or product not found
 *   get:
 *     summary: Get a Customer's orders
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: CustomerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer orders retrieved
 */
router.post("/Customer/:customerId",authorize("Customer","Admin"), OrderController.createOrder);
router.get("/Customer/:customerId",authorize("Customer", "Admin"), OrderController.getCustomerOrders);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Orders retrieved
 */
router.get("/",authorize("Admin"), OrderController.getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved
 *       404:
 *         description: Order not found
 */
router.get("/:id",authorize("Customer", "Admin"), OrderController.getOrder);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update an order's status
 *     tags: [Orders]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED]
 *                 example: PROCESSING
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status or cancelled order
 *       404:
 *         description: Order not found
 */
router.patch("/:id/status",authorize("Admin"), OrderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel a pending order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Order cannot be cancelled
 *       404:
 *         description: Order not found
 */
router.patch("/:id/cancel",authorize("Customer"), OrderController.cancelOrder);



export default router