'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Filter, 
  ChevronDown, 
  MoreVertical,
  ThumbsUp,
  Reply,
  Flag,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Annotation {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    position: string;
  };
  type: 'insight' | 'question' | 'critique' | 'method_note';
  section: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: string;
}

const MOCK_ANNOTATIONS: Annotation[] = [
  {
    id: '1',
    user: {
      name: 'Dr. Elena Vance',
      username: 'evance',
      avatar: 'https://picsum.photos/seed/elena/100/100',
      position: 'Senior Researcher'
    },
    type: 'insight',
    section: 'Methods',
    content: 'The use of stratified sampling here is particularly effective for the agricultural dataset, as it accounts for soil variance across different regions.',
    likes: 12,
    replies: 3,
    createdAt: '2h ago'
  },
  {
    id: '2',
    user: {
      name: 'Marcus Thorne',
      username: 'mthorne',
      avatar: 'https://picsum.photos/seed/marcus/100/100',
      position: 'PhD Student'
    },
    type: 'question',
    section: 'Results',
    content: 'How does the model handle outliers in the yield data? The paper mentions filtering but doesn\'t specify the threshold.',
    likes: 5,
    replies: 8,
    createdAt: '5h ago'
  }
];

export function AnnotationPanel() {
  const [annotations, setAnnotations] = useState(MOCK_ANNOTATIONS);
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedType, setSelectedType] = useState<Annotation['type']>('insight');
  const [selectedSection, setSelectedSection] = useState('Abstract');

  const typeColors: Record<Annotation['type'], string> = {
    insight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    question: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critique: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    method_note: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  };

  const handleAdd = () => {
    if (!newAnnotation.trim()) return;
    
    const annotation: Annotation = {
      id: Math.random().toString(),
      user: {
        name: 'Current User',
        username: 'shuvo',
        avatar: 'https://picsum.photos/seed/shuvo/100/100',
        position: 'Researcher'
      },
      type: selectedType,
      section: selectedSection,
      content: newAnnotation,
      likes: 0,
      replies: 0,
      createdAt: 'Just now'
    };

    setAnnotations([annotation, ...annotations]);
    setNewAnnotation('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-black text-[var(--text-primary)]">Annotations</h2>
          <span className="px-2 py-0.5 bg-[var(--bg-surface3)] rounded-full text-[12px] font-bold text-[var(--text-tertiary)]">
            {annotations.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Annotate
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-[var(--bg-surface2)] border border-indigo-500/30 rounded-2xl p-4 space-y-4 shadow-xl shadow-indigo-500/10"
          >
            <div className="flex flex-wrap gap-2">
              {['insight', 'question', 'critique', 'method_note'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all",
                    selectedType === type 
                      ? typeColors[type as Annotation['type']]
                      : "bg-[var(--bg-surface3)] border-[var(--border)] text-[var(--text-tertiary)] hover:border-indigo-500/20"
                  )}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Section:</span>
              <select 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-[var(--bg-surface3)] border border-[var(--border)] rounded-lg px-2 py-1 text-[12px] text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500"
              >
                {['Abstract', 'Introduction', 'Methods', 'Results', 'Discussion', 'Conclusion'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <textarea 
              value={newAnnotation}
              onChange={(e) => setNewAnnotation(e.target.value)}
              placeholder="Write your annotation... Use markdown for formatting."
              className="w-full min-h-[100px] bg-[var(--bg-surface3)] border border-[var(--border)] rounded-xl p-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-indigo-500 transition-all resize-none"
            />

            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                <Sparkles className="w-4 h-4" />
                AI Enhance
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-[13px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!newAnnotation.trim()}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-600 disabled:opacity-50 transition-all"
                >
                  Post Annotation
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {annotations.map((annotation) => (
          <motion.div 
            key={annotation.id}
            layout
            className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded-2xl p-4 space-y-4 group hover:border-indigo-500/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={annotation.user.avatar} alt={annotation.user.name} className="w-10 h-10 rounded-full border border-[var(--border)]" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[var(--text-primary)]">{annotation.user.name}</span>
                    <span className="text-[12px] text-[var(--text-tertiary)]">@{annotation.user.username}</span>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-medium uppercase tracking-wider">{annotation.user.position}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--text-tertiary)]">{annotation.createdAt}</span>
                <button className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  typeColors[annotation.type]
                )}>
                  {annotation.type.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                  in {annotation.section}
                </span>
              </div>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                {annotation.content}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-tertiary)] hover:text-indigo-400 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                {annotation.likes}
              </button>
              <button className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-tertiary)] hover:text-indigo-400 transition-colors">
                <Reply className="w-4 h-4" />
                {annotation.replies}
              </button>
              <button className="ml-auto text-[var(--text-tertiary)] hover:text-rose-400 transition-colors">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
