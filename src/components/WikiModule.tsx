import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, BookOpen, ChevronRight, Save, FileText, ChevronDown, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addTrace } from '@/lib/db';
import { WikiPage } from '@shared/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ErrorBoundary } from '@/components/ErrorBoundary';
const DEFAULT_PAGES: WikiPage[] = [
  { id: '1', slug: 'overview', title: 'System_Overview', category: 'CORE', content: '# System Overview\nWelcome to The Valley Aggregator v1.1.', lastModified: Date.now() },
  { id: '2', slug: 'protocols', title: 'Network_Protocols', category: 'TECH', content: '# Network Protocols\nDetailing P2P and Mesh signaling.', lastModified: Date.now() },
];
export function WikiModule() {
  const livePages = useLiveQuery(() => db.wiki_pages.toArray());
  const pages = useMemo(() => livePages ?? [], [livePages]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<'READ' | 'EDIT' | 'HISTORY'>('READ');
  const [search, setSearch] = useState("");
  const [editContent, setEditContent] = useState("");
  useEffect(() => {
    if (pages.length === 0) {
      DEFAULT_PAGES.forEach(p => db.wiki_pages.add(p));
    }
    if (!activeId && pages.length > 0) setActiveId(pages[0].id);
  }, [pages, activeId]);
  const activePage = useMemo(() => pages.find(p => p.id === activeId) || pages[0], [pages, activeId]);
  const liveRevisions = useLiveQuery(() => db.wiki_revisions.where('pageId').equals(activeId || '').reverse().sortBy('timestamp'), [activeId]);
  const revisions = useMemo(() => liveRevisions ?? [], [liveRevisions]);
  const handleEdit = () => {
    setEditContent(activePage?.content || "");
    setMode('EDIT');
  };
  const handleSave = async () => {
    if (!activeId || !activePage) return;
    const title = editContent.split('\n')[0].replace('#', '').trim() || activePage.title;
    await db.wiki_pages.update(activeId, { content: editContent, title, lastModified: Date.now() });
    await db.wiki_revisions.add({
      id: crypto.randomUUID(),
      pageId: activeId,
      author: 'Node_Admin',
      timestamp: Date.now(),
      content: editContent,
      summary: 'Manual Edit via WebUI'
    });
    await addTrace(`Wiki_Commit: Updated ${title}`, "blue");
    setMode('READ');
  };
  const categories = useMemo(() => Array.from(new Set(pages.map(p => p.category))), [pages]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[calc(100vh-200px)] animate-fade-in">
      <aside className="md:col-span-1 flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-3.5 text-slate-600" />
          <Input placeholder="Search_Docs..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[#040408] border-slate-900 h-9 pl-9 font-mono text-[10px] uppercase" />
        </div>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat} className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <ChevronDown className="size-3 text-slate-600" />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{cat}</span>
                </div>
                <div className="ml-4 space-y-1 border-l border-slate-900 pl-2">
                  {pages.filter(p => p.category === cat).map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setActiveId(p.id); setMode('READ'); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono text-left transition-all",
                        activeId === p.id ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <FileText className="size-3 shrink-0" />
                      <span className="truncate">{p.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <button className="w-full h-10 border border-dashed border-slate-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 hover:text-white transition-colors">
          <Plus className="size-3" /> New_Page_Draft
        </button>
      </aside>
      <main className="md:col-span-3 flex flex-col bg-[#040408] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <header className="h-12 border-b border-slate-900 px-6 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <BookOpen className="size-3 text-blue-500" />
            <span>{activePage?.category}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-300 font-bold italic">{activePage?.title}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('READ')} className={cn("px-3 py-1 rounded-md text-[9px] font-mono uppercase font-bold transition-all", mode === 'READ' ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-400")}>Read</button>
            <button onClick={handleEdit} className={cn("px-3 py-1 rounded-md text-[9px] font-mono uppercase font-bold transition-all", mode === 'EDIT' ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-400")}>Edit</button>
            <button onClick={() => setMode('HISTORY')} className={cn("px-3 py-1 rounded-md text-[9px] font-mono uppercase font-bold transition-all", mode === 'HISTORY' ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-400")}>History</button>
          </div>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-10 max-w-none">
            {mode === 'READ' && (
              <div className="prose prose-invert prose-slate max-w-none prose-headings:font-mono prose-headings:uppercase prose-headings:italic prose-p:text-slate-400 prose-code:text-blue-400">
                <ErrorBoundary>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{activePage?.content || ""}</ReactMarkdown>
                </ErrorBoundary>
              </div>
            )}
            {mode === 'EDIT' && (
              <div className="space-y-6">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[400px] bg-black border border-slate-800 rounded-2xl p-6 font-mono text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <div className="flex justify-end gap-4">
                  <button onClick={() => setMode('READ')} className="px-6 py-2 rounded-xl bg-slate-900 text-slate-500 text-[10px] font-mono uppercase font-bold">Cancel</button>
                  <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-mono uppercase font-bold"><Save className="size-3" /> Commit_Changes</button>
                </div>
              </div>
            )}
            {mode === 'HISTORY' && (
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">Revision_Log</h3>
                {revisions.map(rev => (
                  <div key={rev.id} className="p-4 rounded-xl bg-black border border-slate-900 flex items-center justify-between group hover:border-slate-700 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-slate-300">{rev.author} • {format(rev.timestamp, 'MMM dd HH:mm')}</span>
                      <span className="text-[9px] font-mono text-slate-600 uppercase">{rev.summary}</span>
                    </div>
                    <button className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[9px] font-mono uppercase font-bold text-slate-500 hover:text-white transition-all">Revert</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}