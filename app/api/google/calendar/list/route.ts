import { NextResponse } from "next/server";
import { getCalendars, setCredentials } from "@/lib/google/calendar";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Get the authenticated user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the user's Google Calendar tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from("google_calendar_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "Google Calendar not connected", code: "not_connected" },
        { status: 404 }
      );
    }

    // Get the user's calendars
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    };

    const calendars = await getCalendars(tokens);

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 }
    );
  }
}
