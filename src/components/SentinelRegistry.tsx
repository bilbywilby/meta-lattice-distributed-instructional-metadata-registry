import React, { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ReportStatus } from "@shared/types";
import { format } from "date-fns";
import { Search, Download, Trash2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export function SentinelRegistry() {
  const rawReports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray());
  const reports = useMemo(() => rawReports ?? [], [rawReports]);
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
    a.download = `registry_export.json`;
    a.click();
    toast.success("Registry Exported");
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-l-2 border-emerald-500 pl-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Registry_Browser</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Local_Ledger_Management</p>
        </div>
        <Button variant="outline" size="sm" onClick={bulkExport} className="bg-slate-900 border-slate-800 text-[10px] font-mono uppercase gap-2">
          <Download className="size-3" /> Export_JSON
        </Button>
      </header>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input placeholder="Search_Ledger..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[#040408] border-slate-900 font-mono text-xs w-full" />
      </div>
      <div className="rounded-2xl border border-slate-900 bg-[#040408] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/30">
            <TableRow className="border-slate-900">
              <TableHead className="text-[9px] font-mono uppercase">Timestamp</TableHead>
              <TableHead className="text-[9px] font-mono uppercase">Title</TableHead>
              <TableHead className="text-[9px] font-mono uppercase">Status</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((report) => (
              <TableRow key={report.id} className="border-slate-900 hover:bg-slate-900/10">
                <TableCell className="font-mono text-[10px]">{format(report.createdAt, "yyyy-MM-dd HH:mm")}</TableCell>
                <TableCell className="font-mono text-[11px] font-bold uppercase">{report.title}</TableCell>
                <TableCell className="font-mono text-[9px] uppercase">{report.status}</TableCell>
                <TableCell className="text-right">
                  <button onClick={() => db.reports.delete(report.id)} className="p-2 text-slate-600 hover:text-rose-500"><Trash2 className="size-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}