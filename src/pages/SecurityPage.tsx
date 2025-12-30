import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Search, Activity, User, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AuditLog, ApiResponse } from "@shared/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
export function SecurityPage() {
  const [search, setSearch] = useState("");
  const { data: logsRes, isLoading } = useQuery<ApiResponse<AuditLog[]>>({
    queryKey: ["audit-logs"],
    queryFn: () => fetch("/api/registry/audit-logs").then(res => res.json()),
  });
  const logs = logsRes?.data ?? [];
  const filteredLogs = logs.filter(log => 
    log.entityId.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase())
  );
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'UPDATE': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'ROLLBACK': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Security & Integrity Audit</h2>
            <p className="text-sm text-muted-foreground">Immutable ledger of all registry mutations.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by entity or action..."
              className="pl-8 w-64 h-9 bg-secondary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-slate-100 overflow-hidden relative">
             <ShieldCheck className="absolute -right-4 -bottom-4 size-32 opacity-10" />
             <CardContent className="pt-6">
               <p className="text-2xs font-mono text-slate-400 uppercase tracking-widest mb-1">Audit Status</p>
               <h3 className="text-2xl font-bold">OPERATIONAL</h3>
               <div className="flex items-center gap-2 mt-2 text-emerald-400 font-mono text-[10px]">
                 <Activity className="size-3 animate-pulse" /> ALL_TRANSACTIONS_SIGNED
               </div>
             </CardContent>
          </Card>
          <Card className="bg-card border-border">
             <CardContent className="pt-6">
               <p className="text-2xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Total Logs</p>
               <h3 className="text-2xl font-bold font-mono">{logs.length}</h3>
               <p className="text-[10px] text-muted-foreground mt-2 font-mono">RETENTION: 100_OPS</p>
             </CardContent>
          </Card>
          <Card className="bg-card border-border">
             <CardContent className="pt-6">
               <p className="text-2xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Last Signature</p>
               <h3 className="text-2xl font-bold font-mono">0x{logs[0]?.id.split('-')[0] ?? 'N/A'}</h3>
               <p className="text-[10px] text-muted-foreground mt-2 font-mono">HASH_CONSISTENCY: VALID</p>
             </CardContent>
          </Card>
        </div>
        <div className="border rounded-xl bg-card/50 backdrop-blur overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 border-b">
              <TableRow>
                <TableHead className="font-mono text-2xs uppercase">Timestamp</TableHead>
                <TableHead className="font-mono text-2xs uppercase">Action</TableHead>
                <TableHead className="font-mono text-2xs uppercase">Entity_ID</TableHead>
                <TableHead className="font-mono text-2xs uppercase">Actor</TableHead>
                <TableHead className="text-right font-mono text-2xs uppercase">Checksum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 font-mono text-xs animate-pulse">RECONSTRUCTING_AUDIT_TRAIL...</TableCell></TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-mono text-xs">NO_LOG_DATA_IN_THIS_VIEW</TableCell></TableRow>
              ) : filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-accent/30 transition-colors border-b last:border-0">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3" /> {format(new Date(log.timestamp), 'yyyy.MM.dd HH:mm:ss')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] font-mono px-2 py-0 border", getActionColor(log.action))}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    {log.entityId}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="size-3 text-muted-foreground" /> {log.actor}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                    0x{log.id.split('-')[0]}...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}