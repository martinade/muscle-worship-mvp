import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAccessToken } from "@/lib/auth/tokenUtils";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Auth check - support both Bearer and cookie
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: "Missing authorization" });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Verify user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", decoded.userId)
      .single();

    if (adminError || !adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Fetch pending creators: legal_disclaimer_accepted = true AND kyc_verified is not true
    const { data: pending, error: pendingError } = await supabase
      .from("creatorprofiles")
      .select(`
        user_id,
        legal_disclaimer_accepted_at,
        created_at
      `)
      .eq("legal_disclaimer_accepted", true)
      .or("kyc_verified.is.null,kyc_verified.eq.false");

    if (pendingError) {
      console.error("Error fetching pending creators:", pendingError);
      return res.status(500).json({ error: "Failed to fetch pending creators" });
    }

    if (!pending || pending.length === 0) {
      return res.status(200).json({ pending: [] });
    }

    // Get user details for each pending creator
    const userIds = pending.map((p) => p.user_id);
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, username, email, created_at")
      .in("user_id", userIds);

    if (usersError) {
      console.error("Error fetching user details:", usersError);
      return res.status(500).json({ error: "Failed to fetch user details" });
    }

    // Combine data
    const result = pending.map((p) => {
      const user = users?.find((u) => u.user_id === p.user_id);
      return {
        user_id: p.user_id,
        username: user?.username || "Unknown",
        email: user?.email || "Unknown",
        submitted_at: p.legal_disclaimer_accepted_at || p.created_at,
      };
    });

    // Sort by submitted_at descending (newest first)
    result.sort((a, b) => {
      const dateA = new Date(a.submitted_at || 0).getTime();
      const dateB = new Date(b.submitted_at || 0).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({ pending: result });
  } catch (error: any) {
    console.error("Pending KYC error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
