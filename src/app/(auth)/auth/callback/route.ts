import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient({ cookieStore });

  const { searchParams } = new URL(request.url);

  // Supabase sends 'token' in email verification links, not 'token_hash'
  // But when redirecting to callback, it may use 'token_hash' or include it in hash
  const token = searchParams.get("token") || searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token");
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("error");
  redirectTo.searchParams.delete("error_code");
  redirectTo.searchParams.delete("error_description");

  // Check for errors first (from Supabase redirect)
  const error = searchParams.get("error");
  if (error) {
    redirectTo.pathname = "/sign-in";
    redirectTo.searchParams.set("error", error);
    redirectTo.searchParams.set(
      "error_description",
      decodeURIComponent(
        searchParams.get("error_description") || "Authentication failed",
      ),
    );
    return NextResponse.redirect(redirectTo);
  }

  // Check if user is already authenticated (Supabase may verify before redirecting)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is already authenticated - redirect to home or next path
    redirectTo.pathname = next === "/" ? "/" : next;
    redirectTo.searchParams.delete("next");
    return NextResponse.redirect(redirectTo);
  }

  // Verify OTP if we have token and type
  if (token && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash: token, // verifyOtp expects token_hash parameter name
    });

    if (!verifyError) {
      // Success - redirect to home or the next path
      redirectTo.pathname = next === "/" ? "/" : next;
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    } else {
      // Verification failed - redirect to sign-in with error
      redirectTo.pathname = "/sign-in";
      redirectTo.searchParams.set("error", verifyError.message);
      redirectTo.searchParams.set(
        "error_description",
        verifyError.message || "Email verification failed",
      );
      return NextResponse.redirect(redirectTo);
    }
  }

  // No token provided and user not authenticated - redirect to sign-in
  redirectTo.pathname = "/sign-in";
  redirectTo.searchParams.set(
    "error",
    "Verification token is missing or invalid",
  );
  return NextResponse.redirect(redirectTo);
}
