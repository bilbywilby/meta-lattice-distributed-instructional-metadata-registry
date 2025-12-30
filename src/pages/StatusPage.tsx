import React from "react";
import { Activity, Globe, Cpu, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
const NODES = Array.from({ length: 12 }, (_, i) => ({
  id: `Lattice-Node-${i + 1}`,
  region: ['US-EAST', 'EU-WEST', 'AP-SOUTH', 'US-WEST'][i % 4],
  latency: Math.floor(Math.random() * 50) + 10,
  status: Math.random() > 0.1 ? 'online' : 'degraded'
}));
const TRAFFIC_DATA = [
  { region: 'Americas', load: 85 },
  { region: 'Europe', load: 42 },
  { region: 'Asia', load: 68 },
  { region: 'Oceania', load: 15 },
];
export function StatusPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">System Reliability</h2>
            <p className="text-muted-foreground">Real-time health telemetry across the Meta-Lattice edge.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <Radio className="size-3" /> System Operational
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white col-span-1 md:col-span-2 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Globe className="size-48" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-400">Global Distribution (Mock)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {NODES.map((node) => (
                  <div key={node.id} className="group relative">
                    <div className={`h-12 rounded flex items-center justify-center border border-slate-700 transition-colors ${
                      node.status === 'online' ? 'hover:bg-emerald-500/20 hover:border-emerald-500/50' : 'bg-amber-500/10 border-amber-500/50'
                    }`}>
                      <div className={`size-2 rounded-full ${node.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block z-20 w-32 bg-slate-800 p-2 rounded text-[10px] shadow-xl border border-slate-700">
                      <p className="font-bold">{node.id}</p>
                      <p className="text-slate-400">{node.region} • {node.latency}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Regional Payload Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TRAFFIC_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="region" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="load" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatusMetric title="API Latency" value="14ms" icon={Activity} color="text-sky-500" />
           <StatusMetric title="CPU Utilization" value="12.4%" icon={Cpu} color="text-amber-500" />
           <StatusMetric title="Ingress" value="4.2 GB/s" icon={Globe} color="text-emerald-500" />
           <StatusMetric title="Active Nodes" value="42 / 45" icon={Radio} color="text-indigo-500" />
        </div>
      </div>
    </div>
  );
}
function StatusMetric({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`size-4 ${color}`} />
          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-2xl font-mono font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}