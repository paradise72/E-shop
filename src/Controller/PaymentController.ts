import express from "express";
import {OrderModel} from "../Model/Order.js";
import {PaymentModel} from "../Model/Payment.js";
import {CustomerModel} from "../Model/Customer.js";
import {sendPaymentConfirmation} from "../utils/emailTemplates.js";

class PaymentController {


    createPayment = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { orderId } = request.params;
            const { method } = request.body;

            const allowedMethods = [
                "MOMO",
                "CARD",
                "BANK_TRANSFER",
            ];

            if (!allowedMethods.includes(method)) {
                return response.status(400).json({
                    message: "Invalid payment method",
                });
            }

            const order = await OrderModel.findById(orderId);

            if (!order) {
                return response.status(404).json({
                    message: "Order not found",
                });
            }

            if (order.status === "CANCELLED") {
                return response.status(400).json({
                    message: "Cannot pay for a cancelled order",
                });
            }

            const existingPayment = await PaymentModel.findOne({
                order: orderId,
                status: { $in: ["PENDING", "SUCCESS"] },
            });

            if (existingPayment) {
                return response.status(400).json({
                    message: "A pending or successful payment already exists",
                    data: existingPayment,
                });
            }

            const payment = new PaymentModel({
                order: orderId,
                customer: order.customer,
                amount: order.totalAmount,
                method,
                status: "SUCCESS",
            });

            await payment.save();
            const customer = await CustomerModel.findById(payment.customer)
            if(customer){
                try{
                    await sendPaymentConfirmation(customer.email,String(order._id), `${customer.firstName} ${customer.lastName}`,payment.amount)

                }catch(e){
                    console.log(e)
                }
            }


            return response.status(201).json({
                message: "Payment record created successfully",
                data: payment,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to create payment",
                error,
            });
        }
    };



    getAllPayments = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const page = Number(request.query.page) || 1;
            const limit = Number(request.query.limit) || 100;
            const skip = (page - 1) * limit;

            const total = await PaymentModel.countDocuments();
            const payments = await PaymentModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "order",
                    populate: {
                        path: "items.product",
                        select: "name price image category",
                    },
                })
                .populate({
                    path: "customer",
                    populate: {
                        path: "user",
                        select: "name email role",
                    },
                });

            return response.status(200).json({
                total,
                page,
                data: payments,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get payments",
                error,
            });
        }
    };

    getPaymentStats = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const payments = await PaymentModel.find();
            const totalTransactions = payments.length;
            const totalRevenue = payments.reduce((sum, p) => p.status === "SUCCESS" ? sum + (Number(p.amount) || 0) : sum, 0);
            const successfulCount = payments.filter((p) => p.status === "SUCCESS").length;
            const pendingCount = payments.filter((p) => p.status === "PENDING").length;

            const methodsCount = {
                MOMO: payments.filter((p) => p.method === "MOMO").length,
                CARD: payments.filter((p) => p.method === "CARD").length,
                BANK_TRANSFER: payments.filter((p) => p.method === "BANK_TRANSFER").length,
            };

            return response.status(200).json({
                data: {
                    totalTransactions,
                    totalRevenue,
                    successfulCount,
                    pendingCount,
                    methodsCount,
                },
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get payment statistics",
                error,
            });
        }
    };


    getMyPayments = async  (request: express.Request, response: express.Response) => {
        try{
            const userId = (request as any).user.userId
            if(!userId){
                return response.status(404).json({message: "User not found"});
            }
            const customerId = await CustomerModel.findOne({user: userId});
            if(!customerId){
                return response.status(404).json({message: "Customer not found"});
            }
            const payments = await PaymentModel.find({customer:customerId._id})
            if(payments.length === 0){
                return response.status(404).json({message: "No payments found"});
            }

            return response.status(200).json({message: "Payment record found",data:payments});

        }catch(e){
            console.log(e);

            return response.status(500).json({message: `Failed to get payments`,error: e })
        }
    }

    getPayment = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const payment = await PaymentModel.findById(id)
                .populate("order")
                .populate("customer");

            if (!payment) {
                return response.status(404).json({
                    message: "Payment not found",
                });
            }

            return response.status(200).json({
                data: payment,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get payment",
                error,
            });
        }
    };


    getOrderPayment = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { orderId } = request.params;

            const payment = await PaymentModel.findOne({
                order: orderId,
            })
                .populate("order")
                .populate("customer");

            if (!payment) {
                return response.status(404).json({
                    message: "Payment not found for this order",
                });
            }

            return response.status(200).json({
                data: payment,
            });
        } catch (error) {
            return response.status(500).json({
                message: "Failed to get order payment",
                error,
            });
        }
    };

    // getCustomerPayments = async (
    //     req: express.Request,
    //     res: express.Response
    // ) => {
    //     try {
    //         const customerId = req.params.id;
    //         const user = (req as any).user;
    //
    //         // Check that user is logged in
    //         if (!user) {
    //             return res.status(401).json({
    //                 message: "You are not authenticated"
    //             });
    //         }
    //
    //         // ADMIN can view any customer's payments
    //         if (user.role === "ADMIN") {
    //
    //             const payments = await PaymentModel.find({
    //                 customer: customerId
    //             });
    //
    //             return res.status(200).json({
    //                 message: "Customer payments found",
    //                 data: payments
    //             });
    //         }
    //
    //         // CUSTOMER: find the Customer document belonging to logged-in user
    //         const customer = await CustomerModel.findOne({
    //             user: user.userId
    //         });
    //
    //         if (!customer) {
    //             return res.status(404).json({
    //                 message: "Customer not found"
    //             });
    //         }
    //
    //         // CUSTOMER can only access their own payments
    //         if (customer._id.toString() !== customerId) {
    //             return res.status(403).json({
    //                 message: "You are not allowed to view these payments"
    //             });
    //         }
    //
    //         // Now get this customer's payments
    //         const payments = await PaymentModel.find({
    //             customer: customer._id
    //         });
    //
    //         return res.status(200).json({
    //             message: "Customer payments found",
    //             data: payments
    //         });
    //
    //     } catch (error) {
    //         return res.status(500).json({
    //             message: "Failed to get customer payments",
    //             error: error
    //         });
    //     }
    // };

    getCustomerPayments = async (req:express.Request, res:express.Response) => {
        try{
            const {id} = req.params;

            const customerPayments = await PaymentModel.find({customer:id})
            res.status(200).json({message:"Customer payments", customerPayments})
        }catch(error){
            res.status(500).json({message: "Failed to get customer payments",})
        }
}



}

export default new PaymentController();