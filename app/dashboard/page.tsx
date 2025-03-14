import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome,{" "}
          {user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email}
          !
        </h2>
        <p className="text-gray-600 mb-4">
          You are now logged in to your calendar application. Here you can
          manage your appointments and settings.
        </p>
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-2">Account Information</h3>
          {(user.user_metadata?.name || user.user_metadata?.full_name) && (
            <p>
              <strong>Name:</strong>{" "}
              {user.user_metadata?.name || user.user_metadata?.full_name}
            </p>
          )}
          {user.user_metadata?.given_name &&
            user.user_metadata?.family_name && (
              <p>
                <strong>Full Name:</strong> {user.user_metadata.given_name}{" "}
                {user.user_metadata.family_name}
              </p>
            )}
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
          <p>
            <strong>Last Sign In:</strong>{" "}
            {new Date(user.last_sign_in_at || "").toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
