import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Box, ExternalLink, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MetadataEntity, ApiResponse } from "@shared/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntitySchema, EntityFormValues } from "@/lib/schemas";
import { useNavigate } from "react-router-dom";
export function RegistryPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: entitiesResponse, isLoading } = useQuery<ApiResponse<MetadataEntity[]>>({
    queryKey: ["registry-entities"],
    queryFn: () => fetch("/api/registry/entities").then(res => res.json()),
  });
  const createMutation = useMutation({
    mutationFn: (values: EntityFormValues) =>
      fetch("/api/registry/entities", {
        method: "POST",
        body: JSON.stringify(values),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry-entities"] });
      queryClient.invalidateQueries({ queryKey: ["registry-stats"] });
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
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EntityFormValues>({
    resolver: zodResolver(EntitySchema),
    defaultValues: { type: 'resource', dependencies: [], content: {} }
  });
  const allEntities = entitiesResponse?.data ?? [];
  const filteredEntities = allEntities.filter(e => 
    e.id.toLowerCase().includes(search.toLowerCase()) || 
    e.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Metadata Ledger</h2>
            <p className="text-muted-foreground">Browse and manage registered instructional entities.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter lattice..." 
                className="pl-8 w-64 h-9 bg-background" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white">
                  <Plus className="mr-2 size-4" /> Register Node
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Register Metadata Node</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">Unique ID</Label>
                    <Input id="id" {...register("id")} placeholder="RES-001" />
                    {errors.id && <p className="text-xs text-destructive">{errors.id.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" {...register("name")} placeholder="Intro to Algorithms" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Entity Type</Label>
                    <select
                      {...register("type")}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="resource">Resource</option>
                      <option value="module">Module</option>
                      <option value="assessment">Assessment</option>
                      <option value="competency">Competency</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Hashing..." : "Commit to Lattice"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="border rounded-md bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Syncing with Registry...</TableCell></TableRow>
              ) : filteredEntities.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No entities matching criteria.</TableCell></TableRow>
              ) : filteredEntities.map((entity) => (
                <TableRow key={entity.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/registry/${entity.id}`)}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-2xs font-mono">{entity.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{entity.id}</TableCell>
                  <TableCell className="font-medium text-sm">{entity.name}</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{entity.hash}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-8"
                      onClick={(e) => { e.stopPropagation(); navigate(`/registry/${entity.id}`); }}
                    >
                      <ExternalLink className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(entity.id); }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
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