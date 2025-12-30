import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { WikiTree } from './WikiTree';
import { WIKI_PAGES } from '@/lib/wiki-content';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
export function WikiModule() {
  const [activeId, setActiveId] = useState(WIKI_PAGES[0].id);
  const [search, setSearch] = useState("");
  const activePage = useMemo(() => 
    WIKI_PAGES.find(p => p.id === activeId) ?? WIKI_PAGES[0],
  [activeId]);
  const filteredPages = useMemo(() => {
    const term = search.toLowerCase();
    return WIKI_PAGES.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.category.toLowerCase().includes(term)
    );
  }, [search]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[calc(100vh-160px)] animate-fade-in">
      {/* Sidebar Navigation */}
      <aside className="md:col-span-1 space-y-6 flex flex-col">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-3.5 text-slate-600" />
          <Input 
            placeholder="Search_Docs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#040408] border-slate-900 h-9 pl-9 font-mono text-[10px] uppercase focus:border-blue-500/40"
          />
        </div>
        <ScrollArea className="flex-1 pr-4">
          <WikiTree activeId={activeId} onSelect={setActiveId} />
        </ScrollArea>
      </aside>
      {/* Main Content Pane */}
      <main className="md:col-span-3 flex flex-col bg-[#040408] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
        <header className="h-12 border-b border-slate-900 px-6 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <BookOpen className="size-3 text-blue-500" />
            <span>{activePage.category}</span>
            <ChevronRight className="size-3" />
            <span className="text-slate-300 font-bold italic">{activePage.title}</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600">
            <span className="flex items-center gap-1"><Clock className="size-3" /> REV_0.8.2</span>
          </div>
        </header>
        <ScrollArea className="flex-1">
          <div className="p-10 prose prose-invert prose-slate max-w-none 
            prose-headings:font-mono prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter
            prose-p:text-[13px] prose-p:font-mono prose-p:text-slate-400 prose-p:leading-relaxed
            prose-code:text-blue-400 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded
            prose-pre:bg-[#020205] prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-2xl
            prose-li:text-[12px] prose-li:font-mono prose-li:text-slate-500
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activePage.content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}