import React, { useState } from 'react';
import { Users, MapPin, Hash, Plus, Send, Zap, MessageSquare, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addTrace } from '@/lib/db';
import { LoopPost } from '@shared/types';
const INITIAL_LOOP: LoopPost[] = [
  { id: '1', userId: 'usr_01', user: 'Orbital_Fixer', avatar: 'OF', action: 'Shared an Update', location: 'Steel St, Bethlehem', time: '10m ago', content: 'Found a loose neural conduit near the old blast furnace. Patched and relayed to the mesh. #GRID_MAINT', likes: 12, tags: ['GRID'] },
  { id: '2', userId: 'usr_02', user: 'Data_Ghost', avatar: 'DG', action: 'Relayed Signal', location: 'Hamilton St, Allentown', time: '45m ago', content: 'New community fiber terminal going live in 5 mins. Bring your tokens for prioritized bandwidth.', likes: 24, tags: ['FIBER', 'UPLINK'] },
];
export function LoopModule() {
  const [posts, setPosts] = useState<LoopPost[]>(INITIAL_LOOP);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const handlePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    const post: LoopPost = {
      id: crypto.randomUUID(),
      userId: 'current_user',
      user: 'Node_Admin',
      avatar: 'NA',
      action: 'Broadcasting',
      location: 'Local Node',
      time: 'Just now',
      content: newPost,
      likes: 0,
      tags: ['LOCAL']
    };
    // Optimistic Update
    setPosts([post, ...posts]);
    setNewPost("");
    await addTrace("TagFlow_Broadcast: Ingressing local status update", "purple");
    await addTrace("Orchestrator: Routing loop packet to regional peers", "blue");
    setTimeout(() => setIsPosting(false), 800);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <header className="flex items-center justify-between border-l-2 border-purple-500 pl-6 mb-10">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">The_Loop</h2>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">P2P_Status_Network // No_Tracking</p>
        </div>
        <Users className="size-8 text-purple-500/20" />
      </header>
      {/* Post Composer */}
      <div className="p-6 rounded-3xl bg-[#040408] border border-slate-900 space-y-4">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share something with the valley..."
          className="w-full h-24 bg-transparent border-none text-slate-200 placeholder:text-slate-700 focus:ring-0 resize-none text-sm font-mono"
        />
        <div className="flex items-center justify-between pt-2 border-t border-slate-900/50">
          <div className="flex gap-4">
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-purple-400 transition-colors"><MapPin className="size-4" /></button>
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition-colors"><Hash className="size-4" /></button>
          </div>
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || isPosting}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white text-black font-mono font-bold text-[10px] uppercase hover:bg-slate-200 disabled:opacity-50 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {isPosting ? "Routing..." : "Broadcast"} <Send className="size-3" />
          </button>
        </div>
      </div>
      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-[#040408] border border-slate-900 space-y-4 group hover:border-purple-500/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-purple-400">{post.avatar}</div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-200 uppercase">{post.user}</span>
                      <span className="text-[9px] font-mono text-slate-600 uppercase italic">/ {post.action}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                      <MapPin className="size-2.5" /> {post.location} • {post.time}
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-600 hover:text-white"><Share2 className="size-4" /></button>
                </div>
              </div>
              <p className="text-sm text-slate-400 font-mono leading-relaxed pl-1">{post.content}</p>
              <div className="flex items-center gap-6 pt-4 border-t border-slate-900/50">
                <button className="flex items-center gap-2 text-[9px] font-mono font-bold text-slate-500 uppercase hover:text-purple-400 transition-colors">
                  <Zap className="size-3.5" /> {post.likes} Zaps
                </button>
                <button className="flex items-center gap-2 text-[9px] font-mono font-bold text-slate-500 uppercase hover:text-blue-400 transition-colors">
                  <MessageSquare className="size-3.5" /> Reply
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}