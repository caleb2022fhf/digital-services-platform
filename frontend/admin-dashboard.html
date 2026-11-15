
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
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

        const user = authData.user;

        const { data: admin, error: adminError } = await supabase
            .from("admin_users")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

        if (adminError || !admin || admin.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only."
            });
        }

        const [
            servicesResult,
            ordersResult,
            pendingResult,
            paidResult
        ] = await Promise.all([
            supabase.from("services").select("*", { count: "exact" }),
            supabase.from("orders").select("*", { count: "exact" }),
            supabase.from("orders")
                .select("*", { count: "exact", head: true })
                .eq("payment_status", "PENDING"),
            supabase.from("orders")
                .select("*", { count: "exact", head: true })
                .eq("payment_status", "PAID")
        ]);

        if (
            servicesResult.error ||
            ordersResult.error ||
            pendingResult.error ||
            paidResult.error
        ) {
            throw new Error("Unable to retrieve dashboard data.");
        }

        return res.status(200).json({
            success: true,
            adminEmail: user.email,
            statistics: {
                totalServices: servicesResult.count || 0,
                totalOrders: ordersResult.count || 0,
                pendingOrders: pendingResult.count || 0,
                paidOrders: paidResult.count || 0
            },
            services: servicesResult.data || [],
            orders: ordersResult.data || []
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load admin dashboard."
        });
    }
}
