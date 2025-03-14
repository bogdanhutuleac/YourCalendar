const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// Read the SQL file
const sqlContent = fs.readFileSync(
  path.join(
    __dirname,
    "../supabase/migrations/20250314_google_calendar_tokens.sql"
  ),
  "utf8"
);

// Supabase project details
const supabaseUrl = "https://fuzejrthjgkpbgojgnew.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // This should be your service role key, not the anon key

async function runMigration() {
  if (!supabaseKey) {
    console.error(
      "Error: SUPABASE_SERVICE_KEY environment variable is not set"
    );
    console.log("Please set it by running:");
    console.log('$env:SUPABASE_SERVICE_KEY="your_service_role_key"');
    process.exit(1);
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pgbouncer_exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        query: sqlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to run migration: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const result = await response.json();
    console.log("Migration successful!");
    console.log(result);
  } catch (error) {
    console.error("Error running migration:", error);
  }
}

runMigration();
