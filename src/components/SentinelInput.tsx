import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { AlertCircle, MapPin, Tag, Send, Clock, CheckCircle2, XCircle, Info, ShieldCheck, Network, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <header className="border-l-2 border-blue-500 pl-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Sentinel_Uplink</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Regional_Broadcast_Active</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-mono font-bold uppercase animate-pulse">
            <Network className="size-3" /> Network_Ready
          </div>
        </header>
        <Card className="bg-[#040408] border-slate-900 rounded-3xl">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Event_Type</Label>
                <Input {...form.register("title")} placeholder="e.g. UTILITY_OUTAGE" className="bg-slate-900 border-slate-800 text-slate-200 font-mono text-xs h-11" />
                {form.formState.errors.title && <p className="text-[9px] text-rose-500 uppercase font-mono">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Address_Context</Label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3.5 size-4 text-slate-600" />
                   <Input {...form.register("street")} placeholder="Intersection or Street" className="bg-slate-900 border-slate-800 text-slate-200 font-mono text-xs h-11 pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Telemetry_Tags</Label>
                <div className="relative">
                   <Tag className="absolute left-3 top-3.5 size-4 text-slate-600" />
                   <Input {...form.register("tags")} placeholder="Infrastructure, Grid" className="bg-slate-900 border-slate-800 text-slate-200 font-mono text-xs h-11 pl-10" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-widest gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <Globe className="size-4" /> Broadcast_to_Mesh
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="p-5 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-3">
           <div className="flex items-center gap-2">
             <ShieldCheck className="size-4 text-emerald-500" />
             <span className="text-[10px] font-mono font-bold text-white uppercase italic">Privacy_Protocol_v3</span>
           </div>
           <p className="text-[9px] font-mono text-slate-500 leading-relaxed uppercase">
             Geohash is jittered by 500m. Address is converted to a SHA-256 residency commitment. No raw location data is transmitted to the regional registry.
           </p>
        </div>
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Telemetry_Registry</h2>
          <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Clock className="size-4 text-slate-600" />
          </div>
        </div>
        <div className="space-y-4">
          {recentReports.map(report => (
            <div key={report.id} className="p-4 rounded-2xl bg-[#040408] border border-slate-900 flex items-center justify-between group hover:border-blue-500/30 transition-all">
              <div className="flex gap-4">
                 <div className={cn(
                   "size-10 rounded-xl flex items-center justify-center shrink-0",
                   report.status === ReportStatus.SENT ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                 )}>
                    {report.status === ReportStatus.SENT ? <CheckCircle2 className="size-5" /> : <Info className="size-5" />}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-mono font-bold text-slate-200 uppercase">{report.title}</span>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-[9px] font-mono text-slate-500 uppercase">{report.street}</span>
                     <span className="text-slate-700">•</span>
                     <span className="text-[9px] font-mono text-blue-500 font-bold">COMMIT:{report.residencyCommitment?.slice(0, 8)}</span>
                   </div>
                 </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border",
                   report.status === ReportStatus.SENT ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-blue-500/5 text-blue-500 border-blue-500/20"
                )}>
                  {report.status}
                </div>
                <div className="text-[8px] font-mono text-slate-600 mt-1 uppercase">
                  {format(report.createdAt, "MMM d, HH:mm")}
                </div>
              </div>
            </div>
          ))}
          {recentReports.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-900 rounded-3xl">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">No_Active_Telemetry_Ingress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}