import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { verifyAccessToken } from "@/lib/auth/tokenUtils";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    // Auth: cookie preferred; Bearer supported
    const authHeader = req.headers.authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : null;

    const cookieToken = req.cookies?.accessToken || null;
    const token = bearerToken || cookieToken;

    if (!token)
      return res.status(401).json({ error: "Missing authentication token" });

    const decoded = verifyAccessToken(token);
    if (!decoded?.userId)
      return res.status(401).json({ error: "Invalid token" });

    // Ensure admin role
    const { data: me, error: meErr } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", decoded.userId)
      .single();

    if (meErr || !me) return res.status(404).json({ error: "User not found" });
    if (me.role !== "admin")
      return res.status(403).json({ error: "Admin only" });

    // Pending creators: legal accepted, not kyc_verified
    const { data: profiles, error: profErr } = await supabase
      .from("creatorprofiles")
      .select(
        "user_id, kyc_submitted_at, legal_disclaimer_accepted_at, legal_disclaimer_accepted, kyc_verified",
      )
      .eq("legal_disclaimer_accepted", true)
      .or("kyc_verified.is.null,kyc_verified.eq.false");

    if (profErr) return res.status(500).json({ error: profErr.message });

    const ids = (profiles || [])
      .map((p) => p.user_id)
      .filter(Boolean) as string[];
    if (ids.length === 0) return res.status(200).json({ pending: [] });

    const { data: users, error: usersErr } = await supabase
      .from("users")
      .select("user_id, username, email")
      .in("user_id", ids);

    if (usersErr) return res.status(500).json({ error: usersErr.message });

    const byId = new Map((users || []).map((u) => [u.user_id, u]));

    const pending = (profiles || [])
      .map((p) => {
        const u = byId.get(p.user_id as string);
        return {
          user_id: p.user_id as string,
          username: u?.username ?? null,
          email: (u as any)?.email ?? null,
          submitted_at:
            (p.kyc_submitted_at as any) ??
            (p.legal_disclaimer_accepted_at as any) ??
            null,
        };
      })
      .sort((a, b) =>
        String(b.submitted_at || "").localeCompare(
          String(a.submitted_at || ""),
        ),
      );

    return res.status(200).json({ pending });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || "Internal server error" });
  }
}
