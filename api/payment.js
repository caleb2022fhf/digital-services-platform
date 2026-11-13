
export default async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Only POST requests are allowed."
        });
    }

    const {
        customerName,
        customerEmail,
        phoneNumber,
        paymentMethod,
        service
    } = req.body || {};

    if (
        !customerName ||
        !customerEmail ||
        !phoneNumber ||
        !paymentMethod ||
        !service
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required order details."
        });
    }

    if (!["MTN MoMo", "Airtel Money"].includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            message: "Unsupported payment method."
        });
    }

    if (!/^07[2389][0-9]{7}$/.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Rwanda mobile money phone number."
        });
    }

    return res.status(501).json({
        success: false,
        paymentStatus: "NOT_CONFIGURED",
        message: "Payment processing is not configured yet. No money has been requested or charged."
    });
}
