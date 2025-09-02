import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  password: string;
  plan_type?: string; // e.g., 'annual' | 'monthly'
}

const log = (step: string, details?: unknown) => {
  console.log(`[CREATE-USER-WITH-SUB] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = (await req.json()) as RequestBody;
    const email = body?.email?.trim();
    const password = body?.password;
    const planType = (body?.plan_type || "annual").toLowerCase();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing email or password" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    log("Starting process", { email, planType });

    // 1) Try to create the user; if exists, we will find and update password
    let userId: string | null = null;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: email.split("@")[0] },
    });

    if (createErr) {
      log("Create user error (might already exist)", { message: createErr.message });
      // Try to locate existing user by paging through listUsers
      const perPage = 100;
      let page = 1;
      while (!userId) {
        const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page, perPage });
        if (listErr) throw listErr;
        const found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (found) {
          userId = found.id;
          break;
        }
        if (list.users.length < perPage) break; // no more pages
        page += 1;
        if (page > 50) break; // safety cap
      }

      if (!userId) {
        throw new Error("User exists but could not be found via admin list.");
      }

      // Ensure email confirmed and update password
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updErr) throw updErr;
      log("Updated existing user's password and confirmed email", { userId });
    } else {
      userId = created.user.id;
      log("User created", { userId });
    }

    if (!userId) throw new Error("Unable to resolve user id");

    // 2) Upsert into public.poupeja_users
    const displayName = email.split("@")[0];
    const { error: upsertUserErr } = await admin.from("poupeja_users").upsert(
      {
        id: userId,
        email,
        name: displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (upsertUserErr) throw upsertUserErr;
    log("Upserted into poupeja_users");

    // 3) Create default categories for this user (best effort)
    const { error: catErr } = await admin.rpc("create_default_categories_for_user", {
      user_id: userId,
    });
    if (catErr) log("create_default_categories_for_user failed", { message: catErr.message });

    // 4) Insert active subscription (annual by default)
    const now = new Date();
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + 1);

    const { error: subErr } = await admin.from("poupeja_subscriptions").insert({
      user_id: userId,
      status: "active",
      plan_type: planType === "annual" ? "annual" : planType,
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
      cancel_at_period_end: false,
    });
    if (subErr) throw subErr;
    log("Created active subscription");

    return new Response(
      JSON.stringify({ success: true, user_id: userId, email, plan_type: planType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
