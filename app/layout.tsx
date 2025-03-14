import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./fix-supabase.css";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calendar App",
  description: "A simple calendar application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
