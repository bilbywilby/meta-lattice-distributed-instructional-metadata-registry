import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Activity, ShieldCheck, Box, ChevronRight } from "lucide-react";
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
  { title: "Schemas", icon: Box, href: "/schemas" },
  { title: "Network Status", icon: Activity, href: "/status" },
  { title: "Security Audit", icon: ShieldCheck, href: "/security" },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentNav = NAV_ITEMS.find(i => i.href === location.pathname) || 
                   (location.pathname.startsWith('/registry/') ? { title: 'Inspector' } : { title: 'Console' });
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar className="border-r border-slate-800 bg-slate-950 text-slate-300">
          <SidebarHeader className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-8 rounded bg-sky-500 flex items-center justify-center font-bold text-slate-950">M</div>
              <div className="flex flex-col">
                <span className="font-mono tracking-tighter text-xs font-bold text-white uppercase leading-none">Meta-Lattice</span>
                <span className="text-[10px] text-slate-500 font-mono tracking-widest leading-tight">NODE.EDGE.V1</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href} className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-100",
                        isActive 
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" 
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                      )}>
                        <item.icon className="size-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground" />
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="hover:text-foreground cursor-pointer transition-colors">ROOT</span>
                <ChevronRight className="size-3" />
                <span className="text-foreground">{currentNav.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-mono font-bold leading-none">CLUSTER-ALPHA-92</span>
                <span className="text-[10px] text-emerald-500 font-mono">LATENCY: 14MS</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}