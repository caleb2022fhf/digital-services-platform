
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed."
        });
    }

    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const token = authorization.substring(7);

        const { data: authData, error: authError } =
            await supabase.auth.getUser(token);

        if (authError || !authData.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired session."
            });
        }

        const { data: admin, error: adminError } = await supabase
            .from("admin_users")
            .select("role")
            .eq("user_id", authData.user.id)
            .maybeSingle();

        if (adminError || !admin || admin.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });
        }

        const { name, description, price_rwf, is_active } = req.body || {};

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof price_rwf !== "number" ||
            !Number.isSafeInteger(price_rwf) ||
            price_rwf <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid service name and positive price."
            });
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid description."
            });
        }

        if (
            is_active !== undefined &&
            typeof is_active !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid service status."
            });
        }

        const { data: service, error: insertError } = await supabase
            .from("services")
            .insert({
                name: name.trim(),
                description: description?.trim() || null,
                price_rwf,
                is_active: is_active ?? true
            })
            .select()
            .single();

        if (insertError) {
            console.error("Service insert error:", insertError);

            return res.status(500).json({
                success: false,
                message: "Unable to create service."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Service created successfully.",
            service
        });

    } catch (error) {
        console.error("Admin services error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
