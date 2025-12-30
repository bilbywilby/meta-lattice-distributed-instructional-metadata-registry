import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database, Brackets, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MetadataSchema, ApiResponse } from "@shared/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MetadataSchemaDefinition, SchemaFormValues } from "@/lib/schemas";
import { format } from "date-fns";
export function SchemaPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: schemasRes, isLoading } = useQuery<ApiResponse<MetadataSchema[]>>({
    queryKey: ["registry-schemas"],
    queryFn: () => fetch("/api/registry/schemas").then(res => res.json()),
  });
  const { register, handleSubmit, formState: { errors } } = useForm<SchemaFormValues>({
    resolver: zodResolver(MetadataSchemaDefinition),
  });
  const createMutation = useMutation({
    mutationFn: (values: SchemaFormValues) =>
      fetch("/api/registry/schemas", {
        method: "POST",
        body: JSON.stringify(values),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry-schemas"] });
      setOpen(false);
      toast.success("Schema snapshot created");
    },
  });
  const schemas = schemasRes?.data ?? [];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Schema Definitions</h2>
            <p className="text-sm text-muted-foreground">Enforcement rules for lattice metadata nodes.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sky-600 hover:bg-sky-500">
                <Plus className="mr-2 size-4" /> NEW_SCHEMA
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Commit Structural Schema</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Schema ID</Label>
                  <Input id="id" {...register("id")} placeholder="v1.res.core" className="bg-secondary" />
                  {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Friendly Name</Label>
                  <Input id="name" {...register("name")} placeholder="Standard Learning Object" className="bg-secondary" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-600">
                  <AlertTriangle className="size-4 shrink-0" />
                  Note: Schemas are versioned and immutable once published to the lattice.
                </div>
                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-500" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Validating..." : "Publish Schema"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center animate-pulse font-mono text-xs">FETCHING_SCHEMAS...</div>
          ) : schemas.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl font-mono text-xs">
              NO_SCHEMAS_FOUND_IN_NAMESPACE
            </div>
          ) : schemas.map((schema) => (
            <div key={schema.id} className="group border border-border bg-card/50 backdrop-blur rounded-xl p-5 hover:border-sky-500/50 transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                  <Database className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-sky-500/30 text-sky-600 bg-sky-500/5">V{schema.version}</Badge>
              </div>
              <h3 className="font-bold text-lg mb-1 leading-tight">{schema.name}</h3>
              <p className="text-[11px] font-mono text-muted-foreground mb-6 uppercase tracking-wider">{schema.id}</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                  <Brackets className="size-3" /> Property Model
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[9px] font-mono py-0 h-4">id</Badge>
                  <Badge variant="secondary" className="text-[9px] font-mono py-0 h-4">type</Badge>
                  <Badge variant="secondary" className="text-[9px] font-mono py-0 h-4">content</Badge>
                  <Badge variant="secondary" className="text-[9px] font-mono py-0 h-4">deps</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-4 border-t border-border">
                <span>{schema.entityCount} NODES</span>
                <span>{format(new Date(schema.createdAt), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}