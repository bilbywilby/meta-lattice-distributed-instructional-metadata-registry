import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, Filter, Copy, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MetadataEntity, ApiResponse, EntityType } from "@shared/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntitySchema, EntityFormValues } from "@/lib/schemas";
import { useNavigate } from "react-router-dom";
export function RegistryPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { data: entitiesResponse, isLoading } = useQuery<ApiResponse<MetadataEntity[]>>({
    queryKey: ["registry-entities"],
    queryFn: () => fetch("/api/registry/entities").then(res => res.json()),
  });
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EntityFormValues>({
    resolver: zodResolver(EntitySchema),
    defaultValues: { type: 'resource', dependencies: [], content: {} }
  });
  const createMutation = useMutation({
    mutationFn: (values: EntityFormValues) =>
      fetch("/api/registry/entities", {
        method: "POST",
        body: JSON.stringify(values),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry-entities"] });
      setOpen(false);
      reset();
      toast.success("Entity registered successfully");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/registry/entities/${id}`, { method: "DELETE" }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry-entities"] });
      toast.success("Entity removed");
    },
  });
  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.info("ID copied to clipboard");
  };
  const allEntities = entitiesResponse?.data ?? [];
  const filteredEntities = allEntities
    .filter(e => {
      const matchesSearch = e.id.toLowerCase().includes(search.toLowerCase()) || e.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || e.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Metadata Ledger</h2>
            <p className="text-sm text-muted-foreground font-mono">NODE_COUNT: {filteredEntities.length}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lattice..."
                className="pl-8 w-48 h-9 bg-secondary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-9 px-3 rounded-md border border-input bg-secondary text-xs font-mono"
            >
              <option value="all">ALL TYPES</option>
              <option value="resource">RESOURCE</option>
              <option value="module">MODULE</option>
              <option value="assessment">ASSESSMENT</option>
              <option value="competency">COMPETENCY</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => setSortOrder(s => s === "asc" ? "desc" : "asc")} className="h-9 font-mono text-[10px]">
              <ArrowUpDown className="mr-2 size-3" /> {sortOrder.toUpperCase()}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                  <Plus className="mr-2 size-4" /> REGISTER NODE
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register Metadata Node</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">Unique ID</Label>
                    <Input id="id" {...register("id")} placeholder="RES-001" className="bg-secondary" />
                    {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" {...register("name")} placeholder="Intro to Algorithms" className="bg-secondary" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Entity Type</Label>
                    <select
                      {...register("type")}
                      className="w-full h-10 px-3 rounded-md border border-input bg-secondary text-sm"
                    >
                      <option value="resource">Resource</option>
                      <option value="module">Module</option>
                      <option value="assessment">Assessment</option>
                      <option value="competency">Competency</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-500" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Hashing..." : "Commit to Lattice"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="border border-border rounded-lg bg-card/50 backdrop-blur overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 border-b">
              <TableRow>
                <TableHead className="w-[100px] font-mono text-2xs uppercase">Type</TableHead>
                <TableHead className="font-mono text-2xs uppercase">Identifier</TableHead>
                <TableHead className="font-mono text-2xs uppercase">Name</TableHead>
                <TableHead className="font-mono text-2xs uppercase">Version Hash</TableHead>
                <TableHead className="text-right font-mono text-2xs uppercase">Ops</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 font-mono text-xs animate-pulse">SYNCHRONIZING_WITH_EDGE...</TableCell></TableRow>
              ) : filteredEntities.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-mono text-xs">NO_ENTITIES_FOUND_IN_NAMESPACE</TableCell></TableRow>
              ) : filteredEntities.map((entity) => (
                <TableRow 
                  key={entity.id} 
                  className="hover:bg-accent/50 group cursor-pointer border-b" 
                  onClick={() => navigate(`/registry/${entity.id}`)}
                >
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px] font-mono bg-background">{entity.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    <span className="flex items-center gap-2">
                      {entity.id}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-5 opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(entity.id); }}
                      >
                        <Copy className="size-2.5" />
                      </Button>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{entity.name}</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    <span className="bg-muted px-1.5 py-0.5 rounded border border-border">0x{entity.hash}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); if(confirm('Purge entity from lattice?')) deleteMutation.mutate(entity.id); }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
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