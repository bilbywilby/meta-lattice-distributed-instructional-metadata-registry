import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ReportStatus } from "@shared/types";
import { format } from "date-fns";
import { Search, Filter, Download, Trash2, ChevronRight, Hash, MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export function SentinelRegistry() {
  const reports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray()) ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                           r.street.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);
  const bulkExport = () => {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lv_hub_registry_${Date.now()}.json`;
    a.click();
    toast.success("Registry Exported Successfully");
  };
  const deleteReport = async (id: string) => {
    await db.reports.delete(id);
    await db.outbox.delete(id);
    toast.info("Report Purged from Local DB");
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-l-2 border-emerald-500 pl-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Registry_Browser</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Local_Ledger_Management // V0.6.1</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={bulkExport}
          className="bg-slate-900 border-slate-800 text-[10px] font-mono text-slate-400 hover:text-emerald-500 uppercase gap-2"
        >
          <Download className="size-3" /> Export_JSON
        </Button>
      </header>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-600" />
          <Input 
            placeholder="Search_Ledger_Entries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#040408] border-slate-900 font-mono text-xs pl-10 h-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "LOCAL", "SENT", "FAILED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-2 rounded-lg font-mono text-[9px] font-bold uppercase border transition-all shrink-0",
                statusFilter === status 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                  : "bg-slate-900/50 border-slate-900 text-slate-600 hover:text-slate-400"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-900 bg-[#040408] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/30">
            <TableRow className="border-slate-900 hover:bg-transparent">
              <TableHead className="text-[9px] font-mono uppercase text-slate-500 tracking-widest w-[180px]">Timestamp</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-slate-500 tracking-widest">Incident_Title</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-slate-500 tracking-widest">Geo_Hash</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-slate-500 tracking-widest">Status</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-slate-500 tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((report) => (
              <TableRow key={report.id} className="border-slate-900 hover:bg-slate-900/10 group">
                <TableCell className="font-mono text-[10px] text-slate-500">
                  {format(report.createdAt, "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-bold text-slate-200 uppercase">{report.title}</span>
                    <span className="text-[9px] font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" /> {report.street}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-sky-500 font-bold">
                  {report.geohash}
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase",
                    report.status === ReportStatus.SENT ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    report.status === ReportStatus.FAILED ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                    "bg-sky-500/10 text-sky-500 border-sky-500/20"
                  )}>
                    {report.status === ReportStatus.SENT ? <CheckCircle2 className="size-3" /> :
                     report.status === ReportStatus.FAILED ? <XCircle className="size-3" /> :
                     <Hash className="size-3" />}
                    {report.status}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <button 
                    onClick={() => deleteReport(report.id)}
                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  No_Entries_Found_In_Registry
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}