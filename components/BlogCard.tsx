'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import Markdown from 'react-markdown';
import { User, ThumbsUp, Heart, Share2, MessageSquare, Trash2, Send } from 'lucide-react';

export default function BlogCard({ blog }: { blog: any }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'blogs', blog.id, 'comments'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Comments subscription offline or error:", error);
    });
  }, [blog.id]);

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return;
    await addDoc(collection(db, 'blogs', blog.id, 'comments'), {
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      content: commentText,
      createdAt: serverTimestamp(),
    });
    setCommentText('');
  };

  const handleReaction = async (type: string) => {
    if (!user) return;
    const blogRef = doc(db, 'blogs', blog.id);
    await updateDoc(blogRef, {
        [`reactions.${type}`]: increment(1)
    });
  };

  const handleToggleFavourite = async () => {
      if (!user) return;
      const blogRef = doc(db, 'blogs', blog.id);
      // Simplified: just increment count. For real, track who favourited.
      await updateDoc(blogRef, { favouriteCount: increment(1) });
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#68BA7F]/20 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {blog.authorAvatar ? (
            <img src={blog.authorAvatar} alt={blog.authorName} className="w-10 h-10 rounded-full" />
        ) : (
            <div className="w-10 h-10 rounded-full bg-[#F4F9F5] flex items-center justify-center text-[#2E6F40] font-bold"><User size={20} /></div>
        )}
        <span className="font-bold text-[#253D2C]">{blog.authorName}</span>
      </div>
      <h2 className="text-xl font-bold text-[#253D2C] mb-2">{blog.title}</h2>
      {blog.tags && (
        <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-[#F4F9F5] text-[#2E6F40] text-xs font-bold rounded-lg">{tag}</span>
            ))}
        </div>
      )}
      <div className="prose prose-sm max-w-none text-[#4B5563]">
        <Markdown>{blog.content}</Markdown>
      </div>
      <p className="text-xs text-[#9CA3AF] mt-4">{blog.createdAt?.toDate().toLocaleDateString()}</p>
      
      <div className="flex gap-4 mt-6 pt-4 border-t border-[#68BA7F]/10">
         <button onClick={() => handleReaction('like')} className="flex items-center gap-1 text-sm text-[#2E6F40]"><ThumbsUp size={16}/> {blog.reactions?.like || 0}</button>
         <button onClick={handleToggleFavourite} className="flex items-center gap-1 text-sm text-[#2E6F40]"><Heart size={16}/> {blog.favouriteCount || 0}</button>
         <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-sm text-[#2E6F40]"><MessageSquare size={16}/> {comments.length}</button>
         <button className="flex items-center gap-1 text-sm text-[#2E6F40]" onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 size={16}/> Share</button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#68BA7F]/10 space-y-4">
           {comments.map(comment => (
             <div key={comment.id} className="flex gap-2">
                <span className="font-bold text-xs text-[#2E6F40]">{comment.authorName}:</span>
                <span className="text-sm">{comment.content}</span>
                {comment.authorId === user?.uid && (
                    <button onClick={() => deleteDoc(doc(db, 'blogs', blog.id, 'comments', comment.id))} className="text-red-500 hover:text-red-700 ml-auto"><Trash2 size={14}/></button>
                )}
             </div>
           ))}
           <div className="flex gap-2">
               <input value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1 p-2 rounded-xl border border-[#68BA7F]/30 text-sm" placeholder="Add a comment..." />
               <button onClick={handleAddComment} className="bg-[#2E6F40] p-2 rounded-xl text-white"><Send size={16}/></button>
           </div>
        </div>
      )}
    </div>
  );
}
