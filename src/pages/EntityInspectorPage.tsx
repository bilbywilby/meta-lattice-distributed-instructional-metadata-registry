import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, History, Code, Share2, GitBranch, ShieldCheck, RotateCcw, Box } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MetadataEntity, EntityHistory, ApiResponse } from "@shared/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
export function EntityInspectorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: entityRes, isLoading: entityLoading } = useQuery<ApiResponse<MetadataEntity>>({
    queryKey: ["entity", id],
    queryFn: () => fetch(`/api/registry/entities/${id}`).then(res => res.json()),
  });
  const { data: historyRes } = useQuery<ApiResponse<EntityHistory[]>>({
    queryKey: ["history", id],
    queryFn: () => fetch(`/api/registry/entities/${id}/history`).then(res => res.json()),
  });
  const rollbackMutation = useMutation({
    mutationFn: (historyItem: EntityHistory) => 
      fetch(`/api/registry/entities/${id}`, {
        method: "PUT",
        body: JSON.stringify({ content: historyItem.content, changeNote: `Rollback to v${historyItem.version}` }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity", id] });
      queryClient.invalidateQueries({ queryKey: ["history", id] });
      toast.success("State successfully rolled back");
    }
  });
  const entity = entityRes?.data;
  const history = [...(historyRes?.data ?? [])].reverse();
  if (entityLoading) return <div className="p-12 text-center animate-pulse font-mono text-xs uppercase">LOCKING_NODE_CONTEXT...</div>;
  if (!entity) return <div className="p-12 text-center font-mono text-xs uppercase">NODE_NOT_FOUND_IN_NAMESPACE</div>;
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
      <div className="border-b bg-background/50 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/registry")}>
            <ChevronLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-bold text-foreground">{entity.id}</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-mono py-0 h-4 border-sky-500/50 text-sky-600">{entity.type}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-tighter">{entity.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono">
            <Share2 className="mr-2 size-3" /> EXPORT_JSON
          </Button>
          <Button size="sm" className="h-8 text-xs font-mono bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-500/20">
            <ShieldCheck className="mr-2 size-3" /> VERIFY_HASH
          </Button>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col border-r bg-slate-950">
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500 flex items-center gap-2">
                <Code className="size-3" /> NODE_STATE_OBJECT
              </span>
              <span className="text-[9px] font-mono text-slate-500">HASH: 0x{entity.hash}</span>
            </div>
            <ScrollArea className="flex-1 p-4 font-mono text-xs leading-relaxed">
              <pre className="text-sky-400">
                <span className="text-slate-500">{`// v${entity.version} snapshot`}</span><br/>
                {JSON.stringify(entity.content, null, 2)}
              </pre>
            </ScrollArea>
            <div className="h-64 border-t border-slate-800 bg-slate-900/30 flex flex-col">
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <History className="size-3" /> VERSION_CHRONOLOGY
              </div>
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-1.5">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-700">
                      <div className="size-6 shrink-0 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {h.version}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-mono text-sky-500 truncate">0x{h.hash}</p>
                          <span className="text-[9px] font-mono text-slate-500">{format(new Date(h.updatedAt), 'HH:mm:ss')}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">{h.changeNote ?? "MODIFIED_LATTICE_NODE"}</p>
                      </div>
                      {h.version !== entity.version && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-6 text-amber-500 opacity-0 group-hover:opacity-100"
                          onClick={() => { if(confirm('Rollback state to this version?')) rollbackMutation.mutate(h); }}
                          disabled={rollbackMutation.isPending}
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border" />
        <ResizablePanel defaultSize={60}>
          <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
            <div className="p-3 border-b bg-muted/30 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <GitBranch className="size-3" /> TOPOLOGY_MAPPING
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
              <div className="grid grid-cols-1 gap-16 text-center w-full max-w-sm">
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="border-sky-500 border-2 bg-sky-500/5 shadow-2xl shadow-sky-500/10">
                      <CardContent className="p-6">
                        <Box className="size-8 text-sky-600 mx-auto mb-3" />
                        <h4 className="text-sm font-mono font-bold">{entity.id}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">PRIMARY_NODE</p>
                      </CardContent>
                    </Card>
                    {entity.dependencies.length > 0 ? (
                      <div className="relative mt-16 space-y-6">
                        {/* Technical Blueprint Line */}
                        <div className="absolute left-1/2 -top-16 w-0.5 h-16 bg-gradient-to-b from-sky-500 to-slate-400 -translate-x-1/2" />
                        {entity.dependencies.map((dep, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative"
                          >
                            <Card className="bg-background/80 backdrop-blur border-slate-300 dark:border-slate-800">
                              <CardContent className="p-3 font-mono text-xs flex items-center gap-3">
                                <div className="size-2 rounded-full bg-slate-400" />
                                {dep}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-16 text-[10px] font-mono text-muted-foreground italic bg-background/50 border rounded-lg p-4">
                        NO_UPSTREAM_DEPENDENCIES_DETECTED
                      </div>
                    )}
                 </motion.div>
              </div>
              <div className="absolute bottom-6 right-6 text-[9px] font-mono text-muted-foreground bg-background/90 backdrop-blur border border-border px-3 py-1.5 rounded-full shadow-sm">
                SYSTEM.RENDER.TOPOLOGY_v3.1.2
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}