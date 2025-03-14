import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-6">Login to Your Calendar</h1>
        <div className="flex flex-col space-y-4">
          <form>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              formAction={async () => {
                "use server";
                const supabase = await createClient();
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                    queryParams: {
                      access_type: "offline",
                      prompt: "consent",
                      scope:
                        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
                    },
                  },
                });
                if (error) {
                  console.error("OAuth error:", error);
                  return;
                }
                if (data?.url) {
                  redirect(data.url);
                }
              }}
            >
              Login with Google
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
