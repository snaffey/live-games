"use client";

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-5 px-6 shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 border-b border-gray-800/50">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <Link href="/" className="text-3xl font-bold font-[family-name:var(--font-geist-sans)] bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-300 tracking-tight">LiveGames</Link>
        
        <div className="flex items-center gap-4">
          <NavigationMenu className="w-full sm:w-auto">
            <NavigationMenuList className="flex justify-center sm:justify-end space-x-4">
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-gray-800 hover:text-blue-300 transition-colors duration-300"
                  )}>
                    Live Scores
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              {user && (
                <NavigationMenuItem>
                  <Link href="/favorites" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-gray-800 hover:text-blue-300 transition-colors duration-300"
                    )}>
                      Favorites
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
              
              <NavigationMenuItem>
                <Link href="/football" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-gray-800 hover:text-blue-300 transition-colors duration-300"
                  )}>
                    Football
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link href="/basketball" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-gray-800 hover:text-blue-300 transition-colors duration-300"
                  )}>
                    Basketball
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-3">
            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300 hidden md:inline">{user.email}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="hover:bg-gray-800 hover:text-red-300"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/auth')}
                  className="hover:bg-gray-800 hover:text-blue-300"
                >
                  Sign In
                </Button>
              )
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}