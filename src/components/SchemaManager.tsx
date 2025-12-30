import React, { useState, useMemo } from 'react';
import { Plus, Shield, Trash2, Code, Info, CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addLog } from '@/lib/db';
import { RegistrySchema, SchemaField } from '@shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
export function SchemaManager() {
  const schemas = useLiveQuery(() => db.registry_schemas.toArray()) ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSchema, setNewSchema] = useState<Partial<RegistrySchema>>({
    name: 'New_Schema',
    description: 'Registry description...',
    version: '1.0.0',
    fields: [{ name: 'title', type: 'string', required: true }]
  });
  const handleAddField = () => {
    setNewSchema(prev => ({
      ...prev,
      fields: [...(prev.fields || []), { name: `field_${prev.fields?.length}`, type: 'string', required: false }]
    }));
  };
  const handleRemoveField = (index: number) => {
    setNewSchema(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index)
    }));
  };
  const handleSave = async () => {
    const schema: RegistrySchema = {
      id: editingId || crypto.randomUUID(),
      name: newSchema.name || 'Untitled',
      description: newSchema.description || '',
      version: newSchema.version || '1.0.0',
      fields: newSchema.fields || []
    };
    await db.registry_schemas.put(schema);
    await addLog(`SCHEMA_COMMITTED: ${schema.name}`, 'INFO', { version: schema.version });
    setEditingId(null);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <aside className="space-y-4">
        <header className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Active_Schemas</h3>
          <Button variant="ghost" size="icon" onClick={() => { setEditingId(null); setNewSchema({ name: 'New_Schema', fields: [] }); }} className="size-6 bg-slate-900 border border-slate-800">
            <Plus className="size-3 text-emerald-500" />
          </Button>
        </header>
        <div className="space-y-2">
          {schemas.map(s => (
            <button 
              key={s.id} 
              onClick={() => { setEditingId(s.id); setNewSchema(s); }}
              className={cn(
                "w-full p-4 rounded-2xl border text-left transition-all",
                editingId === s.id ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20" : "bg-[#040408] border-slate-900 hover:border-slate-800"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-tighter">{s.name}</span>
                <span className="text-[8px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">v{s.version}</span>
              </div>
              <p className="text-[9px] font-mono text-slate-500 uppercase line-clamp-1">{s.description}</p>
            </button>
          ))}
        </div>
      </aside>
      <main className="lg:col-span-2 space-y-6">
        <div className="p-8 rounded-3xl bg-[#040408] border border-slate-900 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-mono font-bold text-slate-500 uppercase">Schema_Identifier</label>
              <input 
                value={newSchema.name} 
                onChange={e => setNewSchema(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 h-10 text-xs font-mono text-white outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-mono font-bold text-slate-500 uppercase">Version_Tag</label>
              <input 
                value={newSchema.version} 
                onChange={e => setNewSchema(p => ({ ...p, version: e.target.value }))}
                className="w-full bg-black border border-slate-800 rounded-xl px-4 h-10 text-xs font-mono text-white outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
          <div className="space-y-4">
            <header className="flex items-center justify-between pb-2 border-b border-slate-900">
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Code className="size-3 text-emerald-500" /> Structural_Fields
              </span>
              <Button variant="ghost" size="sm" onClick={handleAddField} className="text-[9px] font-mono uppercase text-emerald-500">Add_Field</Button>
            </header>
            <div className="space-y-3">
              {newSchema.fields?.map((field, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-black border border-slate-900">
                  <div className="col-span-5">
                    <input 
                      value={field.name} 
                      onChange={e => {
                        const fields = [...(newSchema.fields || [])];
                        fields[idx].name = e.target.value;
                        setNewSchema(p => ({ ...p, fields }));
                      }}
                      className="w-full bg-slate-900 border-none rounded-lg h-8 text-[10px] font-mono text-slate-200 px-3"
                    />
                  </div>
                  <div className="col-span-3">
                    <select 
                      value={field.type}
                      onChange={e => {
                        const fields = [...(newSchema.fields || [])];
                        fields[idx].type = e.target.value as any;
                        setNewSchema(p => ({ ...p, fields }));
                      }}
                      className="w-full bg-slate-900 border-none rounded-lg h-8 text-[10px] font-mono text-slate-400 px-2"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="enum">Enum</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <span className="text-[8px] font-mono text-slate-600 uppercase">Req</span>
                    <Switch 
                      checked={field.required}
                      onCheckedChange={checked => {
                        const fields = [...(newSchema.fields || [])];
                        fields[idx].required = checked;
                        setNewSchema(p => ({ ...p, fields }));
                      }}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button onClick={() => handleRemoveField(idx)} className="text-slate-700 hover:text-rose-500 transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-slate-900">
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
              <Info className="size-3" />
              <span>Generates Zod validation logic on edge nodes</span>
            </div>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-xl px-8 h-10 shadow-lg shadow-emerald-500/10">
              Commit_Schema
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}