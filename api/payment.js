
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Only POST requests are allowed."
        });
    }

    try {
        const {
            customerName,
            customerEmail,
            phoneNumber,
            paymentMethod,
            service
        } = req.body || {};

        if (
            typeof customerName !== "string" ||
            typeof customerEmail !== "string" ||
            typeof phoneNumber !== "string" ||
            typeof paymentMethod !== "string" ||
            typeof service !== "string" ||
            !customerName.trim() ||
            !customerEmail.trim() ||
            !phoneNumber.trim() ||
            !service.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required order details."
            });
        }

        if (customerName.trim().length > 150 ||
            customerEmail.trim().length > 254) {
            return res.status(400).json({
                success: false,
                message: "Some customer details are too long."
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(customerEmail.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!["MTN MoMo", "Airtel Money"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Unsupported payment method."
            });
        }

        if (!/^07[2389][0-9]{7}$/.test(phoneNumber.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid Rwanda mobile money phone number."
            });
        }

        const { data: selectedService, error: serviceError } =
            await supabase
                .from("services")
                .select("id, name, price_rwf")
                .eq("id", service.trim())
                .eq("is_active", true)
                .maybeSingle();

        if (serviceError) {
            console.error("Service lookup error:", serviceError);

            return res.status(500).json({
                success: false,
                message: "Unable to verify the selected service."
            });
        }

        if (!selectedService) {
            return res.status(404).json({
                success: false,
                message: "The selected service does not exist or is unavailable."
            });
        }

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_name: customerName.trim(),
                customer_email: customerEmail.trim().toLowerCase(),
                phone_number: phoneNumber.trim(),
                service_id: selectedService.id,
                service_name: selectedService.name,
                amount_rwf: selectedService.price_rwf,
                payment_method: paymentMethod,
                payment_status: "PENDING"
            })
            .select("id, service_name, amount_rwf, payment_status")
            .single();

        if (orderError) {
            console.error("Order creation error:", orderError);

            return res.status(500).json({
                success: false,
                message: "Unable to save your order. Please try again."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Your order has been created successfully. Payment has not been requested yet.",
            order: {
                id: order.id,
                service: order.service_name,
                amount: order.amount_rwf,
                currency: "RWF",
                paymentStatus: order.payment_status
            }
        });

    } catch (error) {
        console.error("Payment API error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
