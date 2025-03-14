import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/google/calendar";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const calendarId = searchParams.get("calendarId");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!calendarId || !timeMin || !timeMax) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

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

    // Get the events
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    };

    const events = await getEvents(
      tokens,
      calendarId,
      new Date(timeMin),
      new Date(timeMax)
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
