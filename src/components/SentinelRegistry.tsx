import React, { useState, useMemo, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ReportStatus, Report } from "@shared/types";
import { format } from "date-fns";
import { Search, Download, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export function SentinelRegistry() {
  const liveReports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray());
  const [registryMode, setRegistryMode] = useState<'LOCAL' | 'GLOBAL'>('LOCAL');
  const [globalReports, setGlobalReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const reports = useMemo(() => {
    const local = liveReports ?? [];
    return registryMode === 'LOCAL' ? local : globalReports;
  }, [registryMode, liveReports, globalReports]);
  useEffect(() => {
    if (registryMode === 'GLOBAL') {
      fetchGlobalRegistry();
    }
  }, [registryMode]);
  const fetchGlobalRegistry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports');
      const json = await res.json();
      if (json.success) {
        setGlobalReports(json.data);
      }
    } catch (err) {
      toast.error("Global registry unreachable");
    } finally {
      setLoading(false);
    }
  };
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
    a.download = `sentinel_${registryMode.toLowerCase()}_export.json`;
    a.click();
    toast.success("Registry Ledger Exported");
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-l-2 border-emerald-500 pl-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold italic text-white uppercase tracking-tighter">Registry_Browser</h1>
          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-0.5">
            {registryMode === 'LOCAL' ? 'Local_Node_Ledger' : 'Regional_Distributed_Mesh'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#040408] border border-slate-900 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setRegistryMode('LOCAL')}
              className={cn("px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all", registryMode === 'LOCAL' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-slate-300")}
            >
              Local
            </button>
            <button
              onClick={() => setRegistryMode('GLOBAL')}
              className={cn("px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all", registryMode === 'GLOBAL' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-slate-500 hover:text-slate-300")}
            >
              Global
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={bulkExport} className="bg-slate-900 border-slate-800 text-[10px] font-mono uppercase gap-2 h-9">
            <Download className="size-3" /> Export
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3 top-3 size-4 text-slate-600" />
          <Input 
            placeholder="Search_Metadata_Context..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="bg-[#040408] border-slate-900 font-mono text-[11px] pl-10 h-10 focus:border-blue-500/40 transition-colors" 
          />
        </div>
        <div className="sm:col-span-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-[#040408] border-slate-900 font-mono text-[11px] h-10">
              <SelectValue placeholder="Filter_Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#040408] border-slate-900">
              <SelectItem value="ALL">ALL_NODES</SelectItem>
              <SelectItem value={ReportStatus.LOCAL}>LOCAL_ONLY</SelectItem>
              <SelectItem value={ReportStatus.SENT}>SENT_TO_MESH</SelectItem>
              <SelectItem value={ReportStatus.FAILED}>SYNC_FAILED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-900 bg-[#040408] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-900/40">
            <TableRow className="border-slate-900 hover:bg-transparent">
              <TableHead className="text-[9px] font-mono uppercase text-slate-500 px-6">Timestamp</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-slate-500">Incident_Type / Entity_ID</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-slate-500">Status</TableHead>
              <TableHead className="text-[9px] font-mono uppercase text-slate-500 text-right px-6">Audit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 font-mono text-[10px] animate-pulse text-blue-500 uppercase">Indexing_Distributed_Ledger...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-20 font-mono text-[10px] text-slate-700 uppercase">No_Observations_Found</TableCell></TableRow>
            ) : filtered.map((report) => (
              <TableRow key={report.id} className="border-slate-900 hover:bg-slate-900/20 group transition-colors">
                <TableCell className="font-mono text-[10px] text-slate-500 px-6">{format(report.createdAt, "yyyy-MM-dd HH:mm")}</TableCell>
                <TableCell className="font-mono text-[11px] font-bold uppercase text-slate-300">
                  <div className="flex flex-col">
                    <span>{report.title}</span>
                    <span className="text-[8px] font-normal text-slate-600 tracking-tight">{report.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "font-mono text-[9px] uppercase px-2 py-0.5 rounded-md border",
                    report.status === ReportStatus.SENT ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-blue-500/5 text-blue-500 border-blue-500/20"
                  )}>
                    {report.status}
                  </span>
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="p-2 text-slate-600 hover:text-blue-500 transition-colors"><Eye className="size-4" /></button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#040408] border-slate-900 text-slate-300 max-w-2xl shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-mono uppercase text-sm italic border-l-2 border-blue-500 pl-3">Entity_Inspector: {report.id.slice(0, 8)}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <InspectorSpec label="RESIDENCY_COMMIT" value={report.residencyCommitment ?? 'N/A'} />
                            <InspectorSpec label="GEOHASH_MASK" value={report.geohash} />
                            <InspectorSpec label="LAT_COORD" value={report.lat.toFixed(5)} />
                            <InspectorSpec label="LON_COORD" value={report.lon.toFixed(5)} />
                          </div>
                          <div className="bg-[#020205] p-5 rounded-2xl border border-slate-900 font-mono text-[10px] overflow-auto max-h-[400px] shadow-inner text-blue-400">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(report, null, 2)}</pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {registryMode === 'LOCAL' && (
                      <button onClick={() => db.reports.delete(report.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 className="size-4" /></button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
function InspectorSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm">
      <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[10px] font-mono text-blue-400 font-bold truncate tracking-tighter">{value}</p>
    </div>
  );
}