import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database, Code2, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const createMutation = useMutation({
    mutationFn: (values: SchemaFormValues) =>
      fetch("/api/registry/schemas", {
        method: "POST",
        body: JSON.stringify(values),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry-schemas"] });
      setOpen(false);
      toast.success("Schema definition committed");
    },
  });
  const { register, handleSubmit, formState: { errors } } = useForm<SchemaFormValues>({
    resolver: zodResolver(MetadataSchemaDefinition),
  });
  const schemas = schemasRes?.data ?? [];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Schema Registry</h2>
            <p className="text-muted-foreground">Define structural constraints for lattice metadata.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sky-600 hover:bg-sky-500">
                <Plus className="mr-2 size-4" /> Create Schema
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Define New Metadata Schema</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Schema Identifier</Label>
                  <Input id="id" {...register("id")} placeholder="v1.resource.core" />
                  {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Friendly Name</Label>
                  <Input id="name" {...register("name")} placeholder="Standard Learning Object" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground flex gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  Schemas once committed are immutable versioned snapshots.
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Validating..." : "Commit Schema"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center animate-pulse">Syncing schemas...</div>
          ) : schemas.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              No schemas defined.
            </div>
          ) : schemas.map((schema) => (
            <div key={schema.id} className="group border rounded-xl p-5 bg-card hover:border-sky-500/50 transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <Database className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">v{schema.version}</Badge>
              </div>
              <h3 className="font-bold text-lg mb-1">{schema.name}</h3>
              <p className="text-xs font-mono text-muted-foreground mb-4">{schema.id}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                <span>{schema.entityCount} Entities</span>
                <span>{format(new Date(schema.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}