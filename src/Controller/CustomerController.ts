import express from "express";
import {CustomerModel} from "../Model/Customer.js";

class CustomerController {

    createCustomer = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const {
                firstName,
                lastName,
                email,
                phone,
                address,
                user,
            } = request.body;

            const customer = new CustomerModel({
                firstName,
                lastName,
                email,
                phone,
                address,
                user,
            });

            await customer.save();

            return response.status(201).json({
                message: "Customer created successfully",
                data: customer,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to create customer",
                error,
            });
        }
    };


    getAllCustomers = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const customers = await CustomerModel.find();

            return response.status(200).json({
                data: customers,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to get customers",
                error,
            });
        }
    };




    getCustomer = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const customer = await CustomerModel.findById(id);

            if (!customer) {
                return response.status(404).json({
                    message: "Customer not found",
                });
            }

            return response.status(200).json({
                data: customer,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to get customer",
                error,
            });
        }
    };


    updateCustomer = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const {
                firstName,
                lastName,
                email,
                phone,
                address,
                user
            } = request.body;

            const customer = await CustomerModel.findById(id);

            if (!customer) {
                return response.status(404).json({
                    message: "Customer not found",
                });
            }

            customer.firstName = firstName;
            customer.lastName = lastName;
            customer.email = email;
            customer.phone = phone;
            customer.address = address;
            customer.user = user

            await customer.save();

            return response.status(200).json({
                message: "Customer updated successfully",
                data: customer,
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to update customer",
                error,
            });
        }
    };


    deleteCustomer = async (
        request: express.Request,
        response: express.Response
    ) => {
        try {
            const { id } = request.params;

            const customer = await CustomerModel.findByIdAndDelete(id);

            if (!customer) {
                return response.status(404).json({
                    message: "Customer not found",
                });
            }

            return response.status(200).json({
                message: "Customer deleted successfully",
            });

        } catch (error) {
            return response.status(500).json({
                message: "Failed to delete customer",
                error,
            });
        }
    };
}

export default new CustomerController();