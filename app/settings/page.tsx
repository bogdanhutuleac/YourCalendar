import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="mb-4">
          <p className="text-gray-600">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        {user.user_metadata?.full_name && (
          <div className="mb-4">
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{user.user_metadata.full_name}</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
        <form>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            formAction={async () => {
              "use server";
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect("/");
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
