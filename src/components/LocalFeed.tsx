import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { formatDistanceToNow } from "date-fns";
import { Newspaper, ExternalLink, RefreshCw, AlertTriangle, Hash } from "lucide-react";
import { db, addLog } from "@/lib/db";
import { FeedItem } from "@shared/types";
import { cn } from "@/lib/utils";
import { sha256 } from "@/lib/crypto";
export function LocalFeed() {
  const articles = useLiveQuery(() => db.feed_cache.orderBy('fetchedAt').reverse().toArray()) ?? [];
  const [loading, setLoading] = useState(false);
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/rss/regional');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        for (const item of data.data) {
          const contentHash = await sha256(item.content);
          const exists = await db.feed_cache.where('contentHash').equals(contentHash).first();
          if (!exists) {
            await db.feed_cache.add({
              ...item,
              contentHash,
              fetchedAt: Date.now()
            } as FeedItem);
          }
        }
        await addLog("RSS_FEED_SYNCED", "INFO");
      }
    } catch (err) {
      console.error(err);
      await addLog("RSS_SYNC_ERROR", "WARNING");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (articles.length === 0) {
      fetchFeed();
    }
  }, [articles.length]);
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-l-2 border-emerald-500 pl-6 mb-8">
        <div>
          <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Regional_Feed</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">LV_Broadcast_Sync // No_Cookie_Proxy</p>
        </div>
        <button 
          onClick={fetchFeed} 
          disabled={loading}
          className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4 text-emerald-500 transition-transform", loading && "animate-spin")} />
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <div key={article.id} className="p-5 rounded-2xl bg-[#040408] border border-slate-900 group hover:border-emerald-500/20 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                  <Hash className="size-3" /> {article.source}
                </span>
                <span className="text-[9px] font-mono text-slate-600">
                  {formatDistanceToNow(article.fetchedAt)} ago
                </span>
              </div>
              <h3 className="text-sm font-mono font-bold text-slate-200 leading-tight mb-2 group-hover:text-emerald-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono line-clamp-2 leading-relaxed">
                {article.content}
              </p>
            </div>
            <a 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 transition-all"
            >
              <ExternalLink className="size-3" /> External_Proxy_Launch
            </a>
          </div>
        ))}
      </div>
      {articles.length === 0 && !loading && (
        <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-900 rounded-3xl">
          <AlertTriangle className="size-8 text-slate-700 mb-4" />
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Network_Empty // Manual_Refresh_Required</p>
        </div>
      )}
    </div>
  );
}