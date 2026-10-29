import express from "express";
import {forgotPassword, loginUser, registerUser, resetPassword} from "../Controller/authController.js";

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Blaise
 *               email:
 *                 type: string
 *                 format: email
 *                 example: niyoblaise@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post("/register",registerUser)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: niyoblaise@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123
 *     responses:
 *       200:
 *         description: Login successful; returns authentication details
 *       401:
 *         description: Invalid credentials
 */
router.post("/login",loginUser)

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;