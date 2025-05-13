"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  CreditCard,
  Users,
  Settings,
  BriefcaseBusiness,
  UserCircle,
  Briefcase,
  BarChart,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  isOpen: boolean;
  userRole?: 'client' | 'freelancer' | 'admin';
}

export function Sidebar({ isOpen, userRole = 'client' }: SidebarProps) {
  const pathname = usePathname();

  // Define navigation items based on user role
  const clientNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "My Projects",
      href: "/projects",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Post a Project",
      href: "/projects/create",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Contracts",
      href: "/contracts",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  const freelancerNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
   
    {
      title: "My Bids",
      href: "/bids",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Contracts",
      href: "/contracts",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Earnings",
      href: "/earnings",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Projects",
      href: "/admin/projects",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Contracts",
      href: "/admin/contracts",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
  ];

  // Common navigation items at the bottom
  const commonNavItems = [
    {
      title: "Profile",
      href: "/profile",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Help & Support",
      href: "/support",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  // Select which navigation items to show based on user role
  let navItems;
  switch (userRole) {
    case 'freelancer':
      navItems = freelancerNavItems;
      break;
    case 'admin':
      navItems = adminNavItems;
      break;
    default:
      navItems = clientNavItems;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-full w-64 flex-col border-r bg-background transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <BriefcaseBusiness className="h-6 w-6 text-primary" />
          <div className="font-bold text-primary text-xl">ConnectLance</div>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 px-3">
          <div className="mt-2 space-y-1">
            {commonNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}