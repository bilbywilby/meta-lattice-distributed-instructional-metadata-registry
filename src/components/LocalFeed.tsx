import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Hash, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { FeedItem } from "@shared/types";
import { cn } from "@/lib/utils";
import { sha256 } from "@/lib/crypto";
export function LocalFeed() {
  const liveArticles = useLiveQuery(() => db.news_cache.orderBy('fetchedAt').reverse().toArray());
  const articles = useMemo(() => (liveArticles as FeedItem[]) ?? [], [liveArticles]);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);
  const fetchFeed = React.useCallback(async (manual = false) => {
    if (isFetching.current) return;
    const now = Date.now();
    const lastFetch = articles[0]?.fetchedAt ?? 0;
    if (!manual && articles.length > 0 && now - lastFetch < 30 * 60 * 1000) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const response = await fetch('/api/v1/rss/regional');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        for (const item of data.data) {
          const contentHash = await sha256(item.content);
          const exists = await db.news_cache.where('contentHash').equals(contentHash).first();
          if (!exists) {
            await db.news_cache.add({
              ...item,
              id: item.id || crypto.randomUUID(),
              contentHash,
              fetchedAt: Date.now()
            } as FeedItem);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [articles]);
  useEffect(() => {
    fetchFeed(false);
  }, [fetchFeed]);
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-l-2 border-emerald-500 pl-6 mb-8">
        <div>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Live_Feed</h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Valley_Uplink // Aggregated</p>
        </div>
        <button
          onClick={() => fetchFeed(true)}
          disabled={loading}
          className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4 text-emerald-500 transition-transform", loading && "animate-spin")} />
        </button>
      </header>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map(article => (
            <div key={article.id} className="p-5 rounded-3xl bg-[#040408] border border-slate-900 group hover:border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                  <Hash className="size-3" /> {article.source}
                </span>
                <span className="text-[9px] font-mono text-slate-600">
                  {formatDistanceToNow(article.fetchedAt)} ago
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 leading-tight mb-2 group-hover:text-emerald-400 transition-colors">{article.title}</h3>
              <p className="text-[11px] text-slate-500 font-mono line-clamp-2 leading-relaxed mb-4">{article.content}</p>
              {article.link && (
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-400 uppercase hover:bg-emerald-500/10 hover:text-emerald-500 transition-all"
                >
                  <ExternalLink className="size-3" /> Launch_Proxy
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-slate-900 rounded-3xl">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">No_Live_Intelligence_Available</p>
        </div>
      )}
    </div>
  );
}