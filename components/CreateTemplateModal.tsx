'use client';
import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function CreateTemplateModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    setSaving(true);
    await addDoc(collection(db, 'templates'), {
      title,
      description,
      content,
      usageCount: 0,
      authorId: user.uid,
      createdAt: serverTimestamp()
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-3xl w-full max-w-lg shadow-xl">
         <h2 className="text-2xl font-bold mb-4">Create Template</h2>
         <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 mb-2 border rounded-xl" />
         <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 mb-2 border rounded-xl" />
         <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 mb-2 border rounded-xl h-40" />
         <button onClick={handleSave} disabled={saving} className="w-full p-3 bg-[#2E6F40] text-white rounded-xl">Save Template</button>
         <button onClick={onClose} className="w-full mt-2 p-3 text-[#2E6F40] font-bold">Cancel</button>
      </div>
    </div>
  );
}
