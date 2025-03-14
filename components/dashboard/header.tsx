"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export function DashboardHeader() {
  const { setTheme, theme } = useTheme();

  return (
    <nav className="w-full bg-white">
      <div className="container max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* <Link href="/dashboard" className="font-semibold text-lg">
          YourCalendar
        </Link> */}
        {/* <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-4 py-3">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">bogdan@buildxpert.ie</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>
    </nav>
  );
}
