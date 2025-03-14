import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google/calendar";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Check if user is authenticated
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

    // Generate Google OAuth URL
    const authUrl = getAuthUrl();

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication URL" },
      { status: 500 }
    );
  }
}
