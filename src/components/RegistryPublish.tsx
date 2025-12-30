import React, { useState } from 'react';
import { Send, ShieldCheck, Code, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db, addLog } from '@/lib/db';
import { InstructionalUnit, LatticeStatus } from '@shared/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function RegistryPublish() {
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const handlePublish = async () => {
    if (!title || !content) {
      toast.error("Required fields: Title, Content");
      return;
    }
    setIsPublishing(true);
    setValidationError(null);
    const unit: InstructionalUnit = {
      id: crypto.randomUUID(),
      type: 'InstructionalUnit',
      title: title.trim(),
      summary: content.slice(0, 100) + "...",
      version: version.trim(),
      status: LatticeStatus.PUBLISHED,
      author: "did:lattice:local-node",
      content: {
        format: 'MARKDOWN',
        value: content
      },
      tags: ["CORE"],
      schemaVersion: "1.0.0"
    };
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unit)
      });
      const result = await response.json();
      if (!response.ok) {
        setValidationError(result.detail || result.error);
        throw new Error(result.error);
      }
      await db.reports.add({
        id: unit.id,
        title: unit.title,
        street: "Lattice_Registry",
        createdAt: Date.now(),
        status: 'SYNCED' as any,
        tags: unit.tags,
        lat: 0, lon: 0, geohash: "LATTICE", mediaIds: []
      } as any);
      await addLog("UNIT_PUBLISHED_GLOBAL", "INFO", { id: unit.id });
      toast.success("Unit Published to Meta-Lattice Registry");
      setTitle("");
      setContent("");
    } catch (err) {
      toast.error("Registry Ingress Failure");
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      <header className="border-l-2 border-emerald-500 pl-6 space-y-2">
        <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Publish_Unit</h2>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Instructional_Metadata_Ingress // AJV_ENFORCED</p>
      </header>
      <div className="bg-[#040408] border border-slate-900 rounded-4xl p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Unit_Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.G. Distributed_Systems_101"
              className="w-full bg-black border border-slate-800 rounded-2xl px-6 h-14 text-[11px] text-white outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">SemVer_Tag</label>
            <input
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full bg-black border border-slate-800 rounded-2xl px-6 h-14 text-[11px] text-white outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <Code className="size-3" /> Instruction_Body (Markdown)
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="# Learning Objectives..."
            className="w-full h-48 bg-black border border-slate-800 rounded-3xl p-6 text-[11px] text-slate-300 outline-none focus:border-emerald-500/50 resize-none font-mono"
          />
        </div>
        {validationError && (
          <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex gap-4 items-start animate-pulse">
            <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-rose-500 uppercase">AJV_Validation_Error</p>
              <p className="text-[10px] text-rose-300/60 font-mono leading-relaxed">{validationError}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-6 border-t border-slate-900">
           <div className="flex items-center gap-3 text-slate-600">
             <ShieldCheck className="size-5" />
             <span className="text-[9px] uppercase tracking-tighter">Payload will be signed via Node_P256_Keys</span>
           </div>
           <button
             onClick={handlePublish}
             disabled={isPublishing}
             className="flex items-center gap-3 px-10 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-emerald-600/20"
           >
             {isPublishing ? "Transmitting..." : "Sign_&_Publish"}
             <Send className="size-4" />
           </button>
        </div>
      </div>
    </div>
  );
}