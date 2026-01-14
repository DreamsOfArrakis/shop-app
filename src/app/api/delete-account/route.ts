import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: cookieStore });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete user using admin client (requires service role)
    // Note: This requires the service role key, which should be server-side only
    const { createClient } = await import("@supabase/supabase-js");
    const { env } = await import("@/env.mjs");

    const adminClient = createClient(
      `https://${env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co`,
      env.DATABASE_SERVICE_ROLE,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error } = await adminClient.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in delete account:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

