'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { X, FileText, Search, Star } from 'lucide-react';
import Markdown from 'react-markdown';

export default function BlogTemplatesModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (content: string, templateId: string) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, 'templates'), orderBy('usageCount', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Templates subscription offline or error:", error);
    });
  }, [isOpen]);

  const filteredTemplates = templates.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-3xl w-full max-w-4xl shadow-xl shadow-black/20 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#253D2C]">Select a Template</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X /></button>
        </div>
        
        <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#68BA7F]" />
            <input 
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#68BA7F]/20 focus:outline-none"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
           <div className="md:col-span-1 overflow-y-auto pr-2 space-y-2">
           {filteredTemplates.map((template) => (
              <button key={template.id} onClick={() => setPreviewContent(template.content)} className="w-full text-left p-4 rounded-xl bg-[#F4F9F5] hover:bg-[#CFFFDC] border border-[#68BA7F]/20 transition-all group">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <FileText className="text-[#2E6F40]" size={20}/>
                        <p className="font-bold text-[#253D2C] group-hover:text-[#2E6F40]">{template.title}</p>
                    </div>
                    {template.usageCount > 5 && <Star className="text-yellow-500" size={16} fill="currentColor"/>}
                </div>
                <p className="text-xs text-gray-600">{template.description}</p>
              </button>
           ))}
           </div>
           
           <div className="md:col-span-2 bg-[#F4F9F5] p-6 rounded-2xl border border-[#68BA7F]/20 overflow-y-auto">
                {previewContent ? (
                    <div className="space-y-4">
                        <div className="prose prose-sm max-w-none"><Markdown>{previewContent}</Markdown></div>
                        <button onClick={() => {
                            const template = templates.find(t => t.content === previewContent);
                            if (template) {
                                updateDoc(doc(db, 'templates', template.id), { usageCount: increment(1) });
                                onSelect(previewContent, template.id);
                            }
                            onClose();
                        }} className="w-full p-3 bg-[#2E6F40] text-white font-bold rounded-xl">Use this template</button>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-20">Select a template to preview</p>
                )}
           </div>
        </div>
      </div>
    </div>
  );
}
