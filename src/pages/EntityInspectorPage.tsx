import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, History, Code, Share2, GitBranch, ShieldCheck } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetadataEntity, EntityHistory, ApiResponse } from "@shared/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
export function EntityInspectorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: entityRes, isLoading: entityLoading } = useQuery<ApiResponse<MetadataEntity>>({
    queryKey: ["entity", id],
    queryFn: () => fetch(`/api/registry/entities/${id}`).then(res => res.json()),
  });
  const { data: historyRes } = useQuery<ApiResponse<EntityHistory[]>>({
    queryKey: ["history", id],
    queryFn: () => fetch(`/api/registry/entities/${id}/history`).then(res => res.json()),
  });
  const entity = entityRes?.data;
  const history = historyRes?.data ?? [];
  if (entityLoading) return <div className="p-12 text-center animate-pulse">Loading lattice node...</div>;
  if (!entity) return <div className="p-12 text-center">Node not found in registry.</div>;
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="border-b bg-background/50 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/registry")}>
            <ChevronLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-bold">{entity.id}</h2>
              <Badge variant="secondary" className="text-[10px] uppercase">{entity.type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{entity.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Share2 className="mr-2 size-3" /> Export
          </Button>
          <Button size="sm" className="h-8 text-xs bg-sky-600 hover:bg-sky-500">
            <ShieldCheck className="mr-2 size-3" /> Verify Hash
          </Button>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col border-r">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Code className="size-3" /> Data Inspection
            </div>
            <ScrollArea className="flex-1 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-sky-400">
              <pre>{JSON.stringify(entity, null, 2)}</pre>
            </ScrollArea>
            <div className="h-48 border-t overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <History className="size-3" /> Version History
              </div>
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={h.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                      <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {h.version}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono font-medium truncate">{h.hash}</p>
                          <span className="text-[10px] text-muted-foreground">{format(new Date(h.updatedAt), 'HH:mm')}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{h.changeNote}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <GitBranch className="size-3" /> Dependency Topology
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
              <div className="grid grid-cols-1 gap-12 text-center w-full max-w-md">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                 >
                    <Card className="border-sky-500/50 bg-sky-500/5">
                      <CardHeader className="p-4">
                        <CardTitle className="text-xs font-mono">{entity.id}</CardTitle>
                      </CardHeader>
                    </Card>
                    {entity.dependencies.length > 0 && (
                      <div className="mt-12 space-y-4">
                        <div className="absolute left-1/2 -bottom-6 w-px h-12 bg-border -translate-x-1/2" />
                        {entity.dependencies.map((dep, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="bg-background">
                              <CardContent className="p-3 text-xs font-mono">
                                {dep}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                 </motion.div>
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground bg-background/80 backdrop-blur border px-2 py-1 rounded">
                DAG Rendering v2.4.0
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}