import React from 'react';
import { ChevronRight, ChevronDown, FileText, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIKI_PAGES } from '@/lib/wiki-content';
interface WikiTreeProps {
  activeId: string;
  onSelect: (id: string) => void;
}
export function WikiTree({ activeId, onSelect }: WikiTreeProps) {
  const categories = Array.from(new Set(WIKI_PAGES.map(p => p.category)));
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(
    Object.fromEntries(categories.map(c => [c, true]))
  );
  const toggle = (cat: string) => {
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
  };
  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat} className="space-y-1">
          <button
            onClick={() => toggle(cat)}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-900/50 rounded-lg group transition-colors"
          >
            {expanded[cat] ? (
              <ChevronDown className="size-3 text-slate-600" />
            ) : (
              <ChevronRight className="size-3 text-slate-600" />
            )}
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300">
              {cat}
            </span>
          </button>
          {expanded[cat] && (
            <div className="ml-4 space-y-1 border-l border-slate-900 pl-2">
              {WIKI_PAGES.filter(p => p.category === cat).map(page => (
                <button
                  key={page.id}
                  onClick={() => onSelect(page.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono text-left transition-all",
                    activeId === page.id 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/30"
                  )}
                >
                  <FileText className="size-3 shrink-0" />
                  <span className="truncate">{page.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}