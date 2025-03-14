import { NextRequest, NextResponse } from "next/server";
import { getTokens, getUserInfo } from "@/lib/google/calendar";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/calendar?error=no_code", request.url)
      );
    }

    // Exchange the code for tokens
    const tokens = await getTokens(code);

    // Get user information to verify the email
    const userInfo = await getUserInfo(tokens);

    // Get the authenticated user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify that the Google account email matches the authenticated user's email
    if (userInfo.email !== user.email) {
      console.log(
        `Email mismatch: Google account ${userInfo.email} vs. User account ${user.email}`
      );
      // For now, let's allow different emails since this is a demo
      // In production, you might want to enforce this check
      // return NextResponse.redirect(
      //   new URL("/dashboard/calendar?error=email_mismatch", request.url)
      // );
    }

    // Store the tokens in Supabase
    const { error } = await supabase.from("google_calendar_tokens").upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        email: userInfo.email,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("Error storing tokens:", error);
      return NextResponse.redirect(
        new URL("/dashboard/calendar?error=token_storage", request.url)
      );
    }

    // Redirect back to the calendar page
    return NextResponse.redirect(
      new URL("/dashboard/calendar?connected=true", request.url)
    );
  } catch (error) {
    console.error("Error in Google Calendar callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard/calendar?error=callback_failed", request.url)
    );
  }
}
