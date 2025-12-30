import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Database, Zap, Shield, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistryStats, ApiResponse } from "@shared/types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
const MOCK_CHART_DATA = [
  { time: '00:00', reqs: 400 }, { time: '04:00', reqs: 300 },
  { time: '08:00', reqs: 900 }, { time: '12:00', reqs: 1200 },
  { time: '16:00', reqs: 1500 }, { time: '20:00', reqs: 1100 },
  { time: '23:59', reqs: 600 },
];
export function DashboardPage() {
  const { data: statsResponse, isLoading } = useQuery<ApiResponse<RegistryStats>>({
    queryKey: ["registry-stats"],
    queryFn: () => fetch("/api/registry/stats").then(res => res.json()),
  });
  const stats = statsResponse?.data;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Entities" value={stats?.totalEntities ?? 0} icon={Database} loading={isLoading} />
          <StatCard title="Total Transactions" value={stats?.totalTransactions ?? 0} icon={Zap} loading={isLoading} />
          <StatCard title="Registry Uptime" value="99.99%" icon={Shield} />
          <StatCard title="Storage Used" value={`${((stats?.storageUsage ?? 0) / 1024).toFixed(2)} KB`} icon={HardDrive} loading={isLoading} />
        </div>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Registry Throughput (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: '#0ea5e9' }}
                />
                <Area type="monotone" dataKey="reqs" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorReqs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function StatCard({ title, value, icon: Icon, loading }: { title: string, value: string | number, icon: any, loading?: boolean }) {
  return (
    <Card className="overflow-hidden border-border bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-sky-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-mono font-bold">
          {loading ? <span className="animate-pulse">...</span> : value}
        </div>
      </CardContent>
    </Card>
  );
}