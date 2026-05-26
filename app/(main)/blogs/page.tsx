'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../../../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../components/AuthProvider';
import Markdown from 'react-markdown';
import { PenTool, Eye, Send, Loader2, Search, Save, User, Bold, Italic, List, Link as LinkIcon, FileText } from 'lucide-react';
import BlogCard from '../../../components/BlogCard';
import BlogTemplatesModal from '../../../components/BlogTemplatesModal';
import CreateTemplateModal from '../../../components/CreateTemplateModal';

export default function BlogsPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [posting, setPosting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'drafts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Drafts subscription offline or error:", error);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user || (!title.trim() && !content.trim())) return;
      try {
        if (activeDraftId) {
             await updateDoc(doc(db, 'drafts', activeDraftId), {
                title,
                content,
                createdAt: serverTimestamp() // Updating as last save
             });
        } else {
             const docRef = await addDoc(collection(db, 'drafts'), {
                authorId: user.uid,
                title,
                content,
                createdAt: serverTimestamp(),
              });
              setActiveDraftId(docRef.id);
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user, title, content, activeDraftId]);

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn("Blogs subscription offline or error:", error);
    });
    return unsubscribe;
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [blogs, searchQuery]);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setWordCount(content.trim().split(/\s+/).filter(Boolean).length);
  }, [content]);

  const handlePost = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'blogs'), {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL,
        title,
        content,
        tags,
        reactions: {like: 0, dislike: 0, insightful: 0, sad: 0, angry: 0, confused: 0, brainstorming: 0},
        favouriteCount: 0,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setTags([]);
      setIsPreview(false);
    } catch (err) {
      console.error('Error posting blog:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user || (!title.trim() && !content.trim())) return;
    setSavingDraft(true);
    try {
      if (activeDraftId) {
        await updateDoc(doc(db, 'drafts', activeDraftId), {
           title,
           content,
           createdAt: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'drafts'), {
          authorId: user.uid,
          title,
          content,
          createdAt: serverTimestamp(),
        });
        setActiveDraftId(docRef.id);
      }
      alert('Draft saved!');
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  const insertMarkdown = (syntax: string, wrapper = '') => {
    if (!contentRef.current) return;
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + `${syntax}${selected}${wrapper || syntax}` + text.substring(end);
    setContent(newText);
    textarea.focus();
    setTimeout(() => {
        textarea.selectionStart = start + syntax.length;
        textarea.selectionEnd = end + syntax.length;
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <h1 className="text-3xl font-bold text-[#253D2C]">Academic Blog</h1>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-[#68BA7F]" />
        <input 
          type="text"
          placeholder="Filter blogs by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#68BA7F]/20 focus:outline-none focus:ring-1 focus:ring-[#2E6F40]"
        />
      </div>
      
      {/* Editor Card */}
      <div className="bg-white p-6 rounded-[2rem] border border-[#68BA7F]/20 shadow-sm">
        <input 
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl font-bold text-[#253D2C] mb-4 p-2 border-b border-[#68BA7F]/30 focus:outline-none"
        />
        
        <input 
          type="text"
          placeholder="Add tags (comma separated)..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (tagInput.trim()) setTags([...tags, tagInput.trim()]);
                setTagInput('');
            }
          }}
          className="w-full text-sm text-[#2E6F40] mb-4 p-2 border border-[#68BA7F]/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E6F40]"
        />
        
        <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-[#F4F9F5] text-[#2E6F40] text-xs font-bold rounded-lg flex items-center gap-1">
                    {tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-[#68BA7F] hover:text-[#2E6F40]">×</button>
                </span>
            ))}
        </div>
        
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
           <div className="flex gap-2">
             <button 
               onClick={() => setIsPreview(false)}
               className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${!isPreview ? 'bg-[#2E6F40] text-white' : 'bg-[#F4F9F5] text-[#2E6F40]'}`}
             >
               <PenTool className="w-4 h-4" /> Write
             </button>
             <button 
               onClick={() => setIsPreview(true)}
               className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${isPreview ? 'bg-[#2E6F40] text-white' : 'bg-[#F4F9F5] text-[#2E6F40]'}`}
             >
               <Eye className="w-4 h-4" /> Preview
             </button>
           </div>
           
           <div className="flex gap-2">
             <div className="flex gap-1 p-1 bg-[#F4F9F5] rounded-xl border border-[#68BA7F]/20">
               <button onClick={() => insertMarkdown('**')} type="button" title="Bold" className="p-2 rounded-lg hover:bg-white text-[#253D2C]"><Bold size={16}/></button>
               <button onClick={() => insertMarkdown('*')} type="button" title="Italic" className="p-2 rounded-lg hover:bg-white text-[#253D2C]"><Italic size={16}/></button>
               <button onClick={() => insertMarkdown('\n- ')} type="button" title="List" className="p-2 rounded-lg hover:bg-white text-[#253D2C]"><List size={16}/></button>
               <button onClick={() => insertMarkdown('[', '](https://)')} type="button" title="Link" className="p-2 rounded-lg hover:bg-white text-[#253D2C]"><LinkIcon size={16}/></button>
             </div>
             
             <button 
               onClick={() => setIsDraftsOpen(true)}
               className="px-4 py-2 bg-[#F4F9F5] text-[#2E6F40] text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#CFFFDC] transition-colors"
             >
               <FileText className="w-4 h-4" /> Manage Drafts
             </button>
             <button
               onClick={() => setIsTemplatesOpen(true)}
               className="px-4 py-2 bg-[#F4F9F5] text-[#2E6F40] text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#CFFFDC] transition-colors"
             >
               <FileText className="w-4 h-4" /> Templates
             </button>
           </div>
        </div>

        {isPreview ? (
          <div className="prose prose-sm max-w-none p-4 rounded-xl border border-[#68BA7F]/20 bg-[#F4F9F5]/50 min-h-[300px]">
             <Markdown>{content || '*Preview will appear here...*'}</Markdown>
          </div>
        ) : (
          <textarea
            ref={contentRef}
            placeholder="Write your blog post in markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[300px] p-4 rounded-xl border border-[#68BA7F]/30 focus:outline-none focus:ring-1 focus:ring-[#2E6F40] resize-none"
          />
        )}
        <div className="text-xs text-[#9CA3AF] mt-2 text-right">{wordCount} words</div>

        <div className="flex flex-wrap gap-4 mt-4">
          <button 
            onClick={handlePost}
            disabled={posting || !title.trim() || !content.trim()}
            className="px-6 py-2 bg-[#2E6F40] hover:bg-[#253D2C] text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Blog
          </button>
          <button 
            onClick={handleSaveDraft}
            disabled={savingDraft || (!title.trim() && !content.trim())}
            className="px-6 py-2 bg-[#F4F9F5] text-[#2E6F40] font-bold rounded-xl flex items-center gap-2 hover:bg-[#CFFFDC] transition-colors"
          >
            {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save as Draft
          </button>
        </div>
      </div>

      {/* Blogs Display */}
      <div className="space-y-6">
        {filteredBlogs.map(blog => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        {isDraftsOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
             <div className="bg-white p-6 rounded-3xl w-full max-w-lg shadow-xl shadow-black/20">
                <h2 className="text-xl font-bold mb-4">Saved Drafts</h2>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                   {drafts.map(draft => (
                      <button key={draft.id} onClick={() => {
                          setTitle(draft.title);
                          setContent(draft.content);
                          setActiveDraftId(draft.id);
                          setIsDraftsOpen(false);
                      }} className="w-full text-left p-3 rounded-xl hover:bg-[#F4F9F5] border border-gray-100 hover:border-[#68BA7F]/30 transition-all">
                        <p className="font-bold text-[#253D2C]">{draft.title || 'Untitled Draft'}</p>
                        <p className="text-xs text-gray-500">{draft.createdAt?.toDate().toLocaleDateString()}</p>
                      </button>
                   ))}
                   {drafts.length === 0 && <p className="text-gray-500 text-center py-4">No drafts yet.</p>}
                </div>
                <button onClick={() => setIsDraftsOpen(false)} className="mt-6 w-full p-3 rounded-xl bg-[#F4F9F5] text-[#2E6F40] font-bold">Close</button>
             </div>
          </div>
        )}
        <BlogTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} onSelect={(c) => { setContent(c); setIsTemplatesOpen(false); }} />
        <CreateTemplateModal isOpen={isCreateTemplateOpen} onClose={() => setIsCreateTemplateOpen(false)} />

      </div>
    </div>
  );
}
