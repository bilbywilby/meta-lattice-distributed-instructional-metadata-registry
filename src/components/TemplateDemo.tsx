import React from "react";
import { DemoItem } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
interface TemplateDemoProps {
  items: DemoItem[];
  title?: string;
}
export function TemplateDemo({ items, title = "Template_Mock_Data" }: TemplateDemoProps): JSX.Element {
  return (
    <Card className="bg-[#040408] border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-slate-900 bg-slate-950/50">
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-3">
          <Layers className="size-4 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-black border border-slate-900 group hover:border-blue-500/30 transition-all">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">{item.name}</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">ID: {item.id}</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 font-mono font-black text-xs">
                {item.value}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="py-12 text-center text-slate-700 font-mono text-[9px] uppercase italic tracking-widest">
              No_Mock_Data_Present
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}