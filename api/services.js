
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed."
        });
    }

    try {
        const { data, error } = await supabase
            .from("services")
            .select("id, name, description, price_rwf, created_at")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Services error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load services."
            });
        }

        return res.status(200).json({
            success: true,
            services: data
        });

    } catch (error) {
        console.error("Server error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}
