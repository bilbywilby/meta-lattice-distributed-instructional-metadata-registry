import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { AlertCircle, MapPin, Tag, Send, Clock, CheckCircle2, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { db, addLog } from "@/lib/db";
import { useOutboxSync } from "@/hooks/use-outbox";
import { Report, ReportStatus } from "@shared/types";
import { generateJitteredGeo, computeGeohash } from "@/lib/crypto";
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
      // Mock user coordinates (Allentown Center)
      const userLat = 40.6023;
      const userLon = -75.4714;
      const jittered = generateJitteredGeo(userLat, userLon);
      const geohash = computeGeohash(jittered.lat, jittered.lon);
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
        mediaIds: []
      };
      await enqueueReport(report);
      form.reset();
      addLog("SENTINEL_REPORT_CREATED", "INFO", { id: report.id });
    } catch (err) {
      console.error(err);
      addLog("SENTINEL_REPORT_ERROR", "CRITICAL");
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <header className="border-l-2 border-emerald-500 pl-6 mb-8">
          <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Sentinel_Report</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Regional_Civic_Ingress</p>
        </header>
        <Card className="bg-[#040408] border-slate-900 rounded-3xl">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Incident_Title</Label>
                <Input 
                  {...form.register("title")} 
                  placeholder="e.g. INFRASTRUCTURE_FAILURE"
                  className="bg-slate-900 border-slate-800 text-slate-200 font-mono text-xs h-11"
                />
                {form.formState.errors.title && <p className="text-[9px] text-rose-500 uppercase font-mono">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Location_Context</Label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3.5 size-4 text-slate-600" />
                   <Input 
                    {...form.register("street")} 
                    placeholder="Intersection or Street Address"
                    className="bg-slate-900 border-slate-800 text-slate-200 font-mono text-xs h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tags (comma separated)</Label>
                <div className="relative">
                   <Tag className="absolute left-3 top-3.5 size-4 text-slate-600" />
                   <Input 
                    {...form.register("tags")} 
                    placeholder="Safety, Power, Roadway"
                    className="bg-slate-900 border-slate-800 text-slate-200 font-mono text-xs h-11 pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-widest gap-2">
                <Send className="size-4" /> Commit_to_Outbox
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Recent_Submissions_Registry</h2>
          <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Clock className="size-4 text-slate-600" />
          </div>
        </div>
        <div className="space-y-4">
          {recentReports.map(report => (
            <div key={report.id} className="p-4 rounded-2xl bg-[#040408] border border-slate-900 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
              <div className="flex gap-4">
                 <div className={cn(
                   "size-10 rounded-xl flex items-center justify-center shrink-0",
                   report.status === ReportStatus.SENT ? "bg-emerald-500/10 text-emerald-500" :
                   report.status === ReportStatus.FAILED ? "bg-rose-500/10 text-rose-500" :
                   "bg-sky-500/10 text-sky-500"
                 )}>
                    {report.status === ReportStatus.SENT ? <CheckCircle2 className="size-5" /> : 
                     report.status === ReportStatus.FAILED ? <XCircle className="size-5" /> :
                     <Info className="size-5" />}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-mono font-bold text-slate-200 uppercase">{report.title}</span>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-[9px] font-mono text-slate-500 uppercase">{report.street}</span>
                     <span className="text-slate-700">•</span>
                     <span className="text-[9px] font-mono text-sky-500 font-bold">GASH:{report.geohash}</span>
                   </div>
                 </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border",
                   report.status === ReportStatus.SENT ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" :
                   report.status === ReportStatus.FAILED ? "bg-rose-500/5 text-rose-500 border-rose-500/20" :
                   "bg-sky-500/5 text-sky-500 border-sky-500/20"
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
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Empty_Registry_No_Reports_Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}