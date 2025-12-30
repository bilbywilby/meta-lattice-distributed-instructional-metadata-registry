import React, { useState } from 'react';
import { Send, Loader2, MapPin, Hash, ShieldCheck, Link as LinkIcon } from 'lucide-react';
import { db, addLog } from '@/lib/db';
import { generateJitteredGeo, computeGeohash, saltResidency } from '@/lib/crypto';
import { Report, ReportStatus, OutboxItem } from '@shared/types';
import { toast } from 'sonner';
export function SentinelForm() {
  const [title, setTitle] = useState("");
  const [street, setStreet] = useState("");
  const [tags, setTags] = useState("");
  const [parentId, setParentId] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const handleTransmit = async () => {
    if (!title || !street) {
      toast.error("Required: Unit_Title & Cross_Street_Proof");
      return;
    }
    setIsTransmitting(true);
    try {
      const mockLat = 40.6259;
      const mockLon = -75.3705;
      const jittered = generateJitteredGeo(mockLat, mockLon);
      const geohash = computeGeohash(jittered.lat, jittered.lon);
      const residencyHash = await saltResidency(street);
      const report: Report = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        status: ReportStatus.LOCAL,
        title: title.trim().toUpperCase(),
        street: "[MASKED_RESIDENCY]",
        residencyHash,
        tags: tags.split(',').map(t => t.trim().toUpperCase()).filter(Boolean),
        lat: jittered.lat,
        lon: jittered.lon,
        geohash,
        mediaIds: [],
        parentUnitId: parentId.trim() || undefined
      };
      await db.transaction('rw', [db.reports, db.outbox, db.sentinel_logs], async () => {
        await db.reports.add(report);
        const outboxItem: OutboxItem = {
          id: report.id,
          opType: 'CREATE_REPORT',
          payload: report,
          retryCount: 0,
          lastAttempt: Date.now()
        };
        await db.outbox.add(outboxItem);
        await addLog("REPORT_INGRESS_COMMITTED", "INFO", { id: report.id.slice(0,8), dag_linked: !!parentId });
      });
      setTitle("");
      setStreet("");
      setTags("");
      setParentId("");
      toast.success("Observation Ingressed: Residency Masked Successfully");
    } catch (err) {
      console.error(err);
      toast.error("Ingress Protocol Failure");
    } finally {
      setIsTransmitting(false);
    }
  };
  return (
    <div className="bg-[#040408] border border-slate-900 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <ShieldCheck className="size-20 text-blue-500" />
      </div>
      <header className="flex items-center gap-3 border-b border-slate-900 pb-4">
        <ShieldCheck className="size-4 text-blue-500" />
        <h2 className="text-[10px] font-black italic uppercase text-white tracking-widest">Observation_Ingress</h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Unit_Identifier</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="E.G. GRID_OUTAGE_BETH"
            className="w-full bg-black border border-slate-800 rounded-xl px-4 h-11 text-[10px] text-white outline-none focus:border-blue-500/50 font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Cross_Street_Proof</label>
          <input
            value={street}
            onChange={e => setStreet(e.target.value)}
            placeholder="E.G. BROAD & MAIN ST"
            className="w-full bg-black border border-slate-800 rounded-xl px-4 h-11 text-[10px] text-white outline-none focus:border-blue-500/50 font-mono"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Hash className="size-3" /> Metadata_Tags
          </label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="POWER, INFRA, URGENT"
            className="w-full bg-black border border-slate-800 rounded-xl px-4 h-11 text-[10px] text-white outline-none focus:border-blue-500/50 font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <LinkIcon className="size-3" /> Parent_Entity_ID (Optional)
          </label>
          <input
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            placeholder="UUID of Related Entity"
            className="w-full bg-black border border-slate-800 rounded-xl px-4 h-11 text-[10px] text-white outline-none focus:border-blue-500/50 font-mono"
          />
        </div>
      </div>
      <div className="pt-4 flex justify-between items-center">
        <p className="text-[7px] text-slate-700 uppercase leading-none font-mono">
          DAG_PROTOCOL: ENFORCED // MASKING: ±0.0045 Jitter
        </p>
        <button
          onClick={handleTransmit}
          disabled={isTransmitting}
          className="flex items-center gap-3 px-10 h-12 rounded-xl bg-[#3b82f6] hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          {isTransmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Transmit_To_Lattice
        </button>
      </div>
    </div>
  );
}