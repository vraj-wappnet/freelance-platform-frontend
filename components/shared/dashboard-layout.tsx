"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  X,
  Gavel,
  Briefcase,
  LayoutDashboard,
  User,
  FileText,
  Award,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import { RootState } from "@/lib/store";
import { logout } from "@/lib/authSlice";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    setActivePath(window.location.pathname);

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ...(userRole === "admin"
      ? [{ name: "Users", icon: User, href: "/users" }]
      : []),
    { name: "Bids", icon: Gavel, href: "/bids" },
    ...(userRole === "admin" || userRole === "client"
      ? [{ name: "Projects", icon: User, href: "/projects" }]
      : []),
    { name: "Contracts", icon: FileText, href: "/contracts" },
    { name: "Milestones", icon: CalendarCheck, href: "/milestones" },
    { name: "Messages", icon: MessageSquare, href: "/messages" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-card border-r transition-all duration-300 z-40",
          isSidebarOpen ? "w-64" : "w-20",
          "hidden md:flex flex-col"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b">
          {isSidebarOpen ? (
            <Link
              href="/dashboard"
              className="text-xl font-bold flex items-center gap-2"
            >
              <Briefcase className="h-6 w-6 text-primary" />
              <span>ConnectLance</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto">
              <Briefcase className="h-6 w-6 text-primary" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {isSidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 flex flex-col space-y-1 p-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center p-2 rounded-lg transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  activePath.startsWith(item.href)
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                  isSidebarOpen ? "justify-start gap-3" : "justify-center"
                )}
                title={!isSidebarOpen ? item.name : undefined}
                onClick={() => setActivePath(item.href)}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              {isSidebarOpen && (
                <div className="truncate">
                  <p className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className={cn("w-full", !isSidebarOpen && "px-2")}
            >
              <LogOut className={cn("h-4 w-4", isSidebarOpen && "mr-2")} />
              {isSidebarOpen && "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        >
          <aside
            className="fixed top-0 left-0 h-full w-64 bg-card border-r transform transition-transform duration-300 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b h-16">
              <Link
                href="/dashboard"
                className="text-xl font-bold flex items-center gap-2"
              >
                <Briefcase className="h-6 w-6 text-primary" />
                <span>ConnectLance</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex flex-col space-y-1 p-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    activePath.startsWith(item.href)
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                  onClick={() => {
                    setActivePath(item.href);
                    toggleMobileMenu();
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t mt-auto">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        <header className="border-b p-4 md:hidden sticky top-0 bg-background z-10 h-16">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="text-xl font-bold flex items-center gap-2"
            >
              <Briefcase className="h-6 w-6 text-primary" />
              <span>ConnectLance</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="h-8 w-8"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <header className="border-b p-4 hidden md:flex sticky top-0 bg-background z-10 h-16">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-lg font-semibold capitalize">
              {activePath.split("/")[1] || "Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 bg-muted/10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
