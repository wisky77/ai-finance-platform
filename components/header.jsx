import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignOutButton from "./sign-out-button";

const Header = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await checkUser();
  }

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <h2>PesaTrack</h2>
        </Link>

        {/* Navigation Links - Different for signed in/out users */}
        <div className="hidden md:flex items-center space-x-8">
          {!user && (
            <a href="#features" className="text-gray-600 hover:text-blue-600">
              Features
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
              >
                <Button variant="outline">
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/transaction/create">
                <Button className="flex items-center gap-2">
                  <PenBox size={18} />
                  <span className="hidden md:inline">Add Transaction</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer w-10 h-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback>
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.user_metadata?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/sign-in">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
