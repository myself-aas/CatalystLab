'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { 
  Hash, 
  Search, 
  Filter, 
  Loader2,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topic = decodeURIComponent(params.topic as string);
  const [posts, setPosts] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');

  const fetchTopicData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch posts with this topic tag
      const postsRef = collection(db, 'posts');
      const pq = query(
        postsRef,
        where('tags', 'array-contains', topic),
        orderBy('created_at', 'desc'),
        limit(20)
      );
      const postsSnapshot = await getDocs(pq);
      
      const postsData = await Promise.all(postsSnapshot.docs.map(async (docSnap) => {
        const post = { id: docSnap.id, ...docSnap.data() } as any;
        
        // Fetch author profile
        const authorRef = doc(db, 'users', post.uid);
        const authorSnap = await getDoc(authorRef);
        if (authorSnap.exists()) {
          post.author = authorSnap.data();
        }

        // Fetch paper if exists
        if (post.paper_id) {
          const paperRef = doc(db, 'papers', post.paper_id);
          const paperSnap = await getDoc(paperRef);
          if (paperSnap.exists()) {
            post.paper = paperSnap.data();
          }
        }

        return post;
      }));

      setPosts(postsData || []);

      // Fetch papers related to this topic
      const papersRef = collection(db, 'papers');
      const papQ = query(
        papersRef,
        where('fields_of_study', 'array-contains', topic),
        orderBy('citation_count', 'desc'),
        limit(10)
      );
      const papersSnapshot = await getDocs(papQ);
      setPapers(papersSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (error) {
      console.error('Error fetching topic data:', error);
    } finally {
      setLoading(false);
    }
  }, [topic]);

  useEffect(() => {
    if (topic) {
      fetchTopicData();
    }
  }, [topic, fetchTopicData]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)]">
      <Sidebar />
      <main className="flex-1 md:ml-[220px] transition-all duration-300 pb-20 md:pb-0">
        <TopBar title={`#${topic}`} />
        
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <header className="mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[var(--bg-sunken)] rounded-2xl flex items-center justify-center border border-[var(--border-subtle)]">
                <Hash className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">#{topic}</h1>
                <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5" /> {posts.length}+ Posts
                  </span>
                  <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" /> {papers.length}+ Papers
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="px-6 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-full hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent-glow)]/20">
                Follow Topic
              </button>
              <button className="px-6 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-bold rounded-full hover:bg-[var(--bg-hover)] transition-all">
                Share Topic
              </button>
            </div>
          </header>

          <div className="flex border-b border-[var(--border-faint)] mb-8">
            {['Posts', 'Papers', 'Communities'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab 
                    ? "border-[var(--accent)] text-[var(--text-primary)]" 
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'Posts' && (
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="py-20 text-center text-[var(--text-tertiary)]">
                      <p>No posts found for this topic yet.</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div 
                        key={post.id}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-5 hover:border-[var(--border-default)] transition-all"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <Link href={`/profile/${post.author?.username}`} className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex-shrink-0">
                            {post.author?.avatar_url ? (
                              <Image 
                                src={post.author.avatar_url} 
                                alt="Avatar" 
                                fill
                                className="object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                                {post.author?.username?.[0] || 'U'}
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 overflow-hidden">
                            <Link href={`/profile/${post.author?.username}`} className="font-bold text-[var(--text-primary)] hover:underline truncate block">
                              {post.author?.full_name || post.author?.username}
                            </Link>
                            <p className="text-[12px] text-[var(--text-tertiary)]">
                              @{post.author?.username} · {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-[14px] text-[var(--text-secondary)] mb-4">{post.content}</p>
                        <div className="flex items-center gap-4 text-[12px] text-[var(--text-tertiary)] pt-4 border-t border-[var(--border-faint)]">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" /> {post.replies_count || 0}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> {post.likes_count || 0}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'Papers' && (
                <div className="space-y-4">
                  {papers.length === 0 ? (
                    <div className="py-20 text-center text-[var(--text-tertiary)]">
                      <p>No papers found for this topic yet.</p>
                    </div>
                  ) : (
                    papers.map((paper) => (
                      <Link 
                        key={paper.id}
                        href={`/paper/${paper.id}`}
                        className="block bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-6 hover:border-[var(--border-default)] transition-all"
                      >
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">{paper.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{paper.authors?.join(', ')}</p>
                        <div className="flex items-center gap-4 text-[12px] text-[var(--text-tertiary)]">
                          <span className="px-2 py-0.5 bg-[var(--bg-sunken)] rounded-full border border-[var(--border-subtle)]">{paper.journal || paper.source}</span>
                          <span>{paper.year}</span>
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> {paper.citation_count} citations
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'Communities' && (
                <div className="py-20 text-center text-[var(--text-tertiary)]">
                  <p>No communities found for this topic yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
