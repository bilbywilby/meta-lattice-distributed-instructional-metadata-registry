import React, { useState, useEffect } from "react";
import { db, pruneLogs } from "@/lib/db";
import { PrivacyInitializer } from "@/components/PrivacyInitializer";
import { PrivacyUI } from "@/components/PrivacyUI";
import { Toaster } from "@/components/ui/sonner";
import { Identity } from "@shared/types";
export default function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadIdentity() {
      const stored = await db.identity.toArray();
      if (stored.length > 0) {
        setIdentity(stored[0]);
      }
      setLoading(false);
    }
    loadIdentity();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      pruneLogs().catch(console.error);
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center font-mono text-slate-500 uppercase text-[10px] tracking-widest">
        Syncing_Valley_State...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#020205] text-slate-300 selection:bg-sky-500/30">
      {!identity ? (
        <PrivacyInitializer onComplete={setIdentity} />
      ) : (
        <PrivacyUI identity={identity} />
      )}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}