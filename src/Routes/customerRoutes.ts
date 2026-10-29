import express from "express";
import CustomerController from "../Controller/CustomerController.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js";


const router = express.Router();

router.use(authenticate)
/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Manage Customer records
 */

/**
 * @swagger
 * /api/Customers:
 *   post:
 *     summary: Create a Customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phone, address]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Blaise
 *               lastName:
 *                 type: string
 *                 example: Niyonshuti
 *               email:
 *                 type: string
 *                 format: email
 *                 example: niyoblaise@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+250788123456"
 *               address:
 *                 type: string
 *                 example: Kigali, Rwanda
 *     responses:
 *       201:
 *         description: Customer created
 *       400:
 *         description: Invalid Customer data
 *   get:
 *     summary: Get all Customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Customers retrieved
 */
router.post("/",authorize("Customer", "Admin"), CustomerController.createCustomer);
router.get("/",authorize("Admin"), CustomerController.getAllCustomers);

/**
 * @swagger
 * /api/Customers/{id}:
 *   get:
 *     summary: Get a Customer by ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer retrieved
 *       404:
 *         description: Customer not found
 *   put:
 *     summary: Update a Customer
 *     tags: [Customers]
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
 *               firstName:
 *                 type: string
 *                 example: Blaise
 *               lastName:
 *                 type: string
 *                 example: Niyonshuti
 *               email:
 *                 type: string
 *                 example: niyoblaise@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+250788123456"
 *               address:
 *                 type: string
 *                 example: Kigali, Rwanda
 *     responses:
 *       200:
 *         description: Customer updated
 *       404:
 *         description: Customer not found
 *   delete:
 *     summary: Delete a Customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted
 *       404:
 *         description: Customer not found
 */
router.get("/:id",authorize("Customer", "Admin"), CustomerController.getCustomer);
router.put("/:id",authorize("Customer", "Admin"), CustomerController.updateCustomer);
router.delete("/:id",authorize("Admin"), CustomerController.deleteCustomer);

export default router;