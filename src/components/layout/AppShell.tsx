import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Activity, ShieldCheck, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
const NAV_ITEMS = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Registry", icon: Database, href: "/registry" },
  { title: "Network Status", icon: Activity, href: "/status" },
  { title: "Security", icon: ShieldCheck, href: "/security" },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="h-16 flex items-center px-6 border-b border-border bg-slate-950 text-white">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded bg-sky-500 flex items-center justify-center font-bold text-lg">M</div>
              <span className="font-mono tracking-tighter text-sm uppercase">Meta-Lattice</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2 bg-slate-900 text-slate-400">
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                    <Link to={item.href} className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      location.pathname === item.href ? "bg-sky-500/10 text-sky-400" : "hover:bg-slate-800 hover:text-slate-100"
                    )}>
                      <item.icon className="size-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col bg-slate-50 dark:bg-slate-950">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                {NAV_ITEMS.find(i => i.href === location.pathname)?.title || "Registry Console"}
              </h1>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}