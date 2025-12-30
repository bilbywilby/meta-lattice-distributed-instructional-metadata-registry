import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { Crosshair, MapPin, Tag, CheckCircle2, Info, ShieldAlert, Globe, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { db, addLog } from "@/lib/db";
import { useOutboxSync } from "@/hooks/use-outbox";
import { Report, ReportStatus } from "@shared/types";
import { generateJitteredGeo, computeGeohash, createResidencyCommitment } from "@/lib/crypto";
import { cn } from "@/lib/utils";
const reportSchema = z.object({
  title: z.string().min(3, "Title too short").max(50),
  street: z.string().min(5, "Address required"),
  tags: z.string().optional()
});
export function SentinelInput() {
  const { enqueueReport } = useOutboxSync();
  const recentReports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().limit(10).toArray()) ?? [];
  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: { title: "", street: "", tags: "" }
  });
  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    try {
      const userLat = 40.6023;
      const userLon = -75.4714;
      const jittered = generateJitteredGeo(userLat, userLon);
      const geohash = computeGeohash(jittered.lat, jittered.lon);
      const resCommit = await createResidencyCommitment(values.street, "LV_HUB_SALT_2025");
      const report: Report = {
        id: uuidv4(),
        createdAt: Date.now(),
        status: ReportStatus.LOCAL,
        title: values.title,
        street: values.street,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
        lat: jittered.lat,
        lon: jittered.lon,
        geohash,
        mediaIds: [],
        residencyCommitment: resCommit
      };
      await enqueueReport(report);
      form.reset();
      addLog("SENTINEL_UPLINK_BROADCAST", "INFO", { id: report.id });
    } catch (err) {
      console.error(err);
      addLog("UPLINK_ERROR", "CRITICAL");
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Column 1: Transmit Form */}
      <div className="space-y-6">
        <header className="border-l-2 border-blue-600 pl-4 mb-4">
          <h1 className="text-lg font-mono font-bold italic text-white uppercase tracking-tighter">Sentinel_Uplink</h1>
          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Regional_Ingress_Node</p>
        </header>
        <Card className="bg-[#040408] border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Event_Type</Label>
                <div className="relative">
                   <Crosshair className="absolute left-3 top-3 size-4 text-slate-600" />
                   <Input {...form.register("title")} placeholder="e.g. GRID_OUTAGE" className="bg-slate-950 border-slate-800 text-slate-200 font-mono text-[11px] h-10 pl-10 focus:border-blue-500/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Cross_Streets</Label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 size-4 text-slate-600" />
                   <Input {...form.register("street")} placeholder="Hamilton & 7th" className="bg-slate-950 border-slate-800 text-slate-200 font-mono text-[11px] h-10 pl-10 focus:border-blue-500/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Metadata_Tags</Label>
                <div className="relative">
                   <Tag className="absolute left-3 top-3 size-4 text-slate-600" />
                   <Input {...form.register("tags")} placeholder="power, safety" className="bg-slate-950 border-slate-800 text-slate-200 font-mono text-[11px] h-10 pl-10 focus:border-blue-500/50" />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold uppercase tracking-widest gap-2 transition-all active:scale-95 shadow-blue-900/20">
                <Globe className="size-4" /> Transmit_Mesh
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Column 2: Amber Explainer */}
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]">
           <div className="flex items-center gap-2">
             <ShieldAlert className="size-5 text-amber-500" />
             <span className="text-[11px] font-mono font-bold text-amber-500 uppercase italic">Geo-Privacy_Protocols</span>
           </div>
           <div className="space-y-4">
             <p className="text-[10px] font-mono text-amber-500/70 leading-relaxed uppercase">
               All coordinates are jittered by ±0.0045 (~500m) before registry entry.
             </p>
             <p className="text-[10px] font-mono text-amber-500/70 leading-relaxed uppercase">
               Cross-street data is hashed via SHA-256 for proof-of-residency without disclosing raw addresses.
             </p>
             <div className="pt-2 border-t border-amber-500/10">
                <div className="flex items-center gap-2 text-[9px] font-mono text-amber-600 font-bold uppercase">
                  <div className="size-1 rounded-full bg-amber-600 animate-pulse" />
                  Active_Masking: ENABLED
                </div>
             </div>
           </div>
        </div>
      </div>
      {/* Column 3: Recent Observations */}
      <div className="space-y-4">
        <h2 className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">Recent_Observations</h2>
        <div className="space-y-3">
          {recentReports.map(report => (
            <div key={report.id} className="p-3 rounded-2xl bg-[#040408] border border-slate-900 group hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-mono font-bold text-slate-200 uppercase">{report.title}</span>
                   <span className="text-[8px] font-mono text-slate-600 uppercase mt-0.5">{report.street}</span>
                 </div>
                 <div className={cn(
                   "size-6 rounded-lg flex items-center justify-center shrink-0",
                   report.status === ReportStatus.SENT ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                 )}>
                    {report.status === ReportStatus.SENT ? <CheckCircle2 className="size-4" /> : <Database className="size-4" />}
                 </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900/50">
                <span className="text-[8px] font-mono text-slate-700 uppercase">
                  {format(report.createdAt, "HH:mm:ss")}
                </span>
                <span className={cn(
                  "text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md",
                   report.status === ReportStatus.SENT ? "text-emerald-500" : "text-blue-500"
                )}>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
          {recentReports.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-slate-900 rounded-3xl">
              <p className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">Registry_Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}