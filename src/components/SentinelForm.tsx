import React, { useState } from 'react';
import { Send, Loader2, MapPin, Hash } from 'lucide-react';
import { db, addLog } from '@/lib/db';
import { generateJitteredGeo, computeGeohash } from '@/lib/crypto';
import { Report, ReportStatus, OutboxItem } from '@shared/types';
import { toast } from 'sonner';
export function SentinelForm() {
  const [title, setTitle] = useState("");
  const [street, setStreet] = useState("");
  const [tags, setTags] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const handleTransmit = async () => {
    if (!title || !street) {
      toast.error("Fields 'Title' and 'Street' are mandatory.");
      return;
    }
    setIsTransmitting(true);
    try {
      // Simulation of browser geolocation
      const mockLat = 40.6259;
      const mockLon = -75.3705;
      const jittered = generateJitteredGeo(mockLat, mockLon);
      const geohash = computeGeohash(jittered.lat, jittered.lon);
      const report: Report = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        status: ReportStatus.LOCAL,
        title: title.trim(),
        street: street.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        lat: jittered.lat,
        lon: jittered.lon,
        geohash,
        mediaIds: []
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
        await addLog("REPORT_QUEUED_LOCAL", "INFO", { geohash });
      });
      setTitle("");
      setStreet("");
      setTags("");
      toast.success("Observation Ingressed Successfully");
    } catch (err) {
      console.error(err);
      toast.error("Ingress Protocol Failure");
      await addLog("INGRESS_FATAL", "CRITICAL", { error: String(err) });
    } finally {
      setIsTransmitting(false);
    }
  };
  return (
    <div className="bg-[#040408] border border-slate-900 rounded-3xl p-8 space-y-6">
      <header className="flex items-center gap-3 border-b border-slate-900 pb-4">
        <MapPin className="size-4 text-blue-500" />
        <h2 className="text-xs font-black italic uppercase text-white">Ingress_Observation</h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-slate-600 uppercase">Observation_Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="E.G. GRID_OUTAGE_BETHLEHEM"
            className="w-full bg-black border border-slate-800 rounded-xl px-4 h-11 text-[10px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-slate-600 uppercase">Cross_Street_Proof</label>
          <input
            value={street}
            onChange={e => setStreet(e.target.value)}
            placeholder="E.G. BROAD & MAIN ST"
            className="w-full bg-black border border-slate-800 rounded-xl px-4 h-11 text-[10px] text-white outline-none focus:border-blue-500/50"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[9px] font-bold text-slate-600 uppercase flex items-center gap-2">
          <Hash className="size-3" /> Metadata_Tags (Comma_Separated)
        </label>
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="INFRASTRUCTURE, POWER, URGENT"
          className="w-full bg-black border border-slate-800 rounded-xl px-4 h-11 text-[10px] text-white outline-none focus:border-blue-500/50"
        />
      </div>
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleTransmit}
          disabled={isTransmitting}
          className="flex items-center gap-3 px-10 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
        >
          {isTransmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Transmit_Protocol
        </button>
      </div>
    </div>
  );
}