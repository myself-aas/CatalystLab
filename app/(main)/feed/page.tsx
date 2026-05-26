'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot, limit } from 'firebase/firestore';
import { MessageSquare, ImageIcon, FileText, Database, Send, Loader2, UserCircle, ExternalLink, X } from 'lucide-react';
import Markdown from 'react-markdown';

interface Attachment {
  type: 'image' | 'article' | 'dataset';
  name: string;
  dataUrl?: string;
  size?: number;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  attachments?: Attachment[];
  createdAt: any;
  likes: number;
  commentsCount: number;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [posting, setPosting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'article' | 'dataset'>('image');

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching feed:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePost = async () => {
    if (!user || (!newPostContent.trim() && attachments.length === 0)) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous Researcher',
        authorPhoto: user.photoURL || null,
        content: newPostContent,
        attachments: attachments,
        createdAt: serverTimestamp(),
        likes: 0,
        commentsCount: 0
      });
      setNewPostContent('');
      setAttachments([]);
    } catch (err) {
      console.error('Failed to post:', err);
      alert('Failed to create post.');
    } finally {
      setPosting(false);
    }
  };

  const handleFileClick = (type: 'image' | 'article' | 'dataset') => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadType === 'image') {
      if (file.size > 500 * 1024) {
        alert('Image must be smaller than 500KB to attach.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, {
          type: 'image',
          name: file.name,
          size: file.size,
          dataUrl: ev.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    } else {
      // Simulate article/dataset upload (metadata only)
      setAttachments(prev => [...prev, {
        type: uploadType,
        name: file.name,
        size: file.size
      }]);
    }
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#253D2C] tracking-tight flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#2E6F40]" />
          Community Feed
        </h1>
        <p className="text-[#2E6F40]/80 mt-1 text-sm">Share insights, papers, datasets, and collaborate with other researchers globally.</p>
      </div>

      {/* Composer */}
      <div className="bg-white border border-[#68BA7F]/30 rounded-[1.5rem] p-5 shadow-lg">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#CFFFDC] border border-[#68BA7F]/40 flex items-center justify-center shrink-0 overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="w-5 h-5 text-[#2E6F40]/70" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              className="w-full bg-transparent border-none outline-none resize-none text-[#253D2C] placeholder-slate-400 text-sm leading-relaxed min-h-[80px]"
              placeholder="What are you working on? Share a finding, paper, or dataset..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3 mb-4">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative group bg-[#F4F9F5] border border-[#68BA7F]/30 rounded-[1rem] p-2.5 pr-8 flex items-center gap-3 max-w-[200px]">
                    {att.type === 'image' && <ImageIcon className="w-5 h-5 text-[#68BA7F] shrink-0" />}
                    {att.type === 'article' && <FileText className="w-5 h-5 text-[#68BA7F] shrink-0" />}
                    {att.type === 'dataset' && <Database className="w-5 h-5 text-[#68BA7F] shrink-0" />}
                    <span className="text-xs text-[#253D2C]/80 truncate">{att.name}</span>
                    <button 
                      onClick={() => removeAttachment(idx)}
                      className="absolute right-2 text-[#2E6F40]/60 hover:text-[#253D2C]/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#68BA7F]/20 mt-2">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleFileClick('image')}
                  className="p-2 text-[#2E6F40]/70 hover:text-[#2E6F40] hover:bg-[#CFFFDC]/40 rounded-[1rem] transition-colors flex items-center gap-2 text-xs font-medium"
                >
                  <ImageIcon className="w-4 h-4" /> <span className="hidden sm:inline">Image</span>
                </button>
                <button 
                  onClick={() => handleFileClick('article')}
                  className="p-2 text-[#2E6F40]/70 hover:text-[#2E6F40] hover:bg-[#CFFFDC]/40 rounded-[1rem] transition-colors flex items-center gap-2 text-xs font-medium"
                >
                  <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Article</span>
                </button>
                <button 
                  onClick={() => handleFileClick('dataset')}
                  className="p-2 text-[#2E6F40]/70 hover:text-[#2E6F40] hover:bg-[#CFFFDC]/40 rounded-[1rem] transition-colors flex items-center gap-2 text-xs font-medium"
                >
                  <Database className="w-4 h-4" /> <span className="hidden sm:inline">Dataset</span>
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept={uploadType === 'image' ? 'image/*' : '*/*'}
                onChange={handleFileChange}
              />

              <button
                onClick={handlePost}
                disabled={posting || (!newPostContent.trim() && attachments.length === 0)}
                className="bg-[#2E6F40] hover:bg-[#68BA7F] text-white px-5 py-2 rounded-[1.25rem] text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#68BA7F] gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-mono tracking-wider">Loading feed...</span>
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="bg-white border border-[#68BA7F]/30 rounded-[1.5rem] p-5 sm:max-w-[760px] mx-auto xl:mx-0 shadow-lg transition-all hover:border-[#68BA7F]/40 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#CFFFDC] flex items-center justify-center overflow-hidden shrink-0">
                    {post.authorPhoto ? (
                      <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserCircle className="w-6 h-6 text-[#2E6F40]/60" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#253D2C] capitalize">{post.authorName}</h4>
                    <p className="text-xs text-[#2E6F40]/70 font-mono">
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-indigo max-w-none prose-sm sm:prose-base prose-p:leading-relaxed text-[#253D2C]/80">
                <Markdown>{post.content}</Markdown>
              </div>

              {/* Attached files */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="mt-5 space-y-3">
                  {post.attachments.map((att, idx) => (
                    <div key={idx}>
                      {att.type === 'image' && att.dataUrl ? (
                         <div className="w-full aspect-video md:aspect-[16/6] bg-[#CFFFDC]/60 rounded-[1.25rem] overflow-hidden border border-[#68BA7F]/30 relative">
                           <img src={att.dataUrl} alt="Attached" className="object-contain w-full h-full" />
                         </div>
                      ) : (
                        <div className="flex items-center justify-between bg-[#F4F9F5] border border-[#68BA7F]/30 p-4 rounded-[1.25rem] group hover:border-[#68BA7F]/40 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-[1rem] ${att.type === 'dataset' ? 'bg-[#CFFFDC] text-[#2E6F40]' : 'bg-[#CFFFDC] text-[#2E6F40]'}`}>
                              {att.type === 'dataset' ? <Database className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#253D2C]/90 line-clamp-1">{att.name || 'Untitled document'}</p>
                              <p className="text-xs text-[#2E6F40]/70 uppercase tracking-widest mt-0.5">
                                {att.type} • {att.size ? (att.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <button className="text-[#2E6F40]/60 hover:text-[#253D2C]/80 transition-colors bg-white p-2 border border-[#68BA7F]/30 rounded-[1rem] group-hover:border-[#68BA7F]/40 shadow-lg">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-[#2E6F40]/70 italic space-y-4">
             <MessageSquare className="w-12 h-12 text-[#2E6F40]/30" />
             <p>No posts yet. Be the first to share something with the community!</p>
          </div>
        )}
      </div>
    </div>
  );
}
