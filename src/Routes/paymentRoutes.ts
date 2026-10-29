import express from "express";
import PaymentController from "../Controller/PaymentController.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";


const router = express.Router();

router.use(authenticate)
/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment records and payment status
 */

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   post:
 *     summary: Create a payment record for an order
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [method]
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [MOMO, CARD, BANK_TRANSFER]
 *                 example: MOMO
 *     responses:
 *       201:
 *         description: Payment record created
 *       400:
 *         description: Invalid method or existing payment
 *       404:
 *         description: Order not found
 *   get:
 *     summary: Get payment for an order
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved
 *       404:
 *         description: Payment not found
 */
router.post("/order/:orderId",authorize("Customer","Admin"), PaymentController.createPayment);
router.get("/Customer/my-payments",authorize("Customer", "Seller", "Admin"),PaymentController.getMyPayments);
router.get("/my-payments",authorize("Customer", "Seller", "Admin"),PaymentController.getMyPayments);
router.get("/order/:orderId",authorize("Customer", "Admin"), PaymentController.getOrderPayment);
router.get("/stats", authorize("Admin"), PaymentController.getPaymentStats);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payments retrieved
 */
router.get("/",authorize("Admin"), PaymentController.getAllPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get a payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved
 *       404:
 *         description: Payment not found
 */
router.get("/:id",authorize("Customer", "Admin"), PaymentController.getPayment);

/**
 * @swagger
 * /api/payments/Customer/{id}:
 *   get:
 *     summary: Get a payment by Customer id
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved
 *       404:
 *         description: Payment not found
 */
router.get("/Customer/:id",authorize("Customer", "Admin"),PaymentController.getCustomerPayments)



export default router;