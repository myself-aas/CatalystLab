'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ReputationCard } from '@/components/profile/ReputationCard';
import { SkillGraph } from '@/components/profile/SkillGraph';
import { PostCard } from '@/components/feed/PostCard';
import { PaperCard } from '@/components/PaperCard';
import { Profile, Post } from '@/lib/types';
import { Paper } from '@/lib/research-api';
import { 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  BookOpen, 
  Zap, 
  History,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_PROFILE: Profile = {
  id: '1',
  username: 'shuvo',
  full_name: 'Shuvo Ahmed',
  avatar_url: 'https://picsum.photos/seed/shuvo/200/200',
  cover_url: null,
  bio: 'PhD Student in Agricultural AI. Researching deep learning applications for crop disease detection and yield optimization. Open to collaboration on sustainable farming tech.',
  institution: 'Bangladesh Agricultural University',
  department: 'Computer Science',
  position: 'PhD Student',
  website: 'https://shuvo.dev',
  google_scholar_url: null,
  orcid: null,
  github_username: 'shuvo',
  twitter_handle: null,
  research_interests: ['Agricultural AI', 'Deep Learning', 'Computer Vision', 'Sustainable Farming'],
  skills: ['Python', 'PyTorch', 'TensorFlow', 'D3.js', 'PostgreSQL'],
  tools: ['VS Code', 'Docker'],
  research_mode: true,
  reputation_score: 1250,
  h_index: 5,
  posts_count: 42,
  papers_shared_count: 15,
  annotations_count: 89,
  followers_count: 850,
  following_count: 320,
  is_verified: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
};

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author_id: '1',
    content: 'Just published our latest findings on using vision transformers for early blight detection in potato crops. The results show a 15% improvement over standard CNNs.',
    rich_content: null,
    post_type: 'insight',
    paper_id: null,
    community_id: null,
    parent_id: null,
    repost_id: null,
    thread_structure: null,
    poll_options: null,
    poll_ends_at: null,
    tags: ['AI', 'Agriculture'],
    idea_version: 1,
    idea_parent_id: null,
    credibility_score: 0.9,
    quality_score: 0.9,
    ai_enhanced: false,
    likes_count: 24,
    replies_count: 5,
    reposts_count: 2,
    bookmarks_count: 8,
    views_count: 100,
    is_pinned: false,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    author: MOCK_PROFILE
  }
];

const MOCK_PAPERS: Paper[] = [
  {
    id: 'p1',
    title: 'Vision Transformers for Agricultural Disease Detection: A Comparative Study',
    authors: ['Shuvo Ahmed', 'Dr. Elena Vance'],
    year: 2024,
    abstract: 'This paper explores the application of vision transformers...',
    url: 'https://nature.com/articles/s41467-024-12345-6',
    pdfUrl: 'https://nature.com/articles/s41467-024-12345-6.pdf',
    citationCount: 12,
    source: 'ss',
    doi: '10.1038/s41467-024-12345-6',
    journal: 'Nature Communications'
  }
];

export default function ProfilePage() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState<'posts' | 'papers' | 'annotations' | 'lists' | 'ideas' | 'activity'>('posts');

  const tabs = [
    { id: 'posts', name: 'Posts', icon: MessageSquare },
    { id: 'papers', name: 'Papers', icon: FileText },
    { id: 'annotations', name: 'Annotations', icon: ShieldCheck },
    { id: 'lists', name: 'Lists', icon: BookOpen },
    { id: 'ideas', name: 'Ideas', icon: Zap },
    { id: 'activity', name: 'Activity', icon: History },
  ];

  const skills = [
    { axis: 'Deep Learning', value: 95 },
    { axis: 'Computer Vision', value: 90 },
    { axis: 'Agriculture', value: 85 },
    { axis: 'Data Viz', value: 75 },
    { axis: 'Backend', value: 70 },
    { axis: 'Research', value: 92 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-20">
      <ProfileHeader profile={MOCK_PROFILE} isOwnProfile={username === 'shuvo'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ReputationCard score={MOCK_PROFILE.reputation_score} badges={['first_post', 'prolific_reader', 'top_annotator', 'verified_researcher']} />
            <SkillGraph skills={skills} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-[var(--border-faint)] overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-[13px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === tab.id 
                      ? "text-indigo-400" 
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabProfile"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'posts' && (
                <motion.div 
                  key="posts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {MOCK_POSTS.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </motion.div>
              )}

              {activeTab === 'papers' && (
                <motion.div 
                  key="papers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 gap-6"
                >
                  {MOCK_PAPERS.map((paper) => (
                    <PaperCard key={paper.id} paper={paper} />
                  ))}
                </motion.div>
              )}

              {/* Other tabs placeholders */}
              {['annotations', 'lists', 'ideas', 'activity'].includes(activeTab) && (
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-[400px] flex flex-col items-center justify-center text-center gap-4 bg-[var(--bg-surface2)] border border-[var(--border)] rounded-3xl border-dashed"
                >
                  <Loader2 className="w-12 h-12 text-[var(--text-tertiary)] animate-spin" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Coming Soon</h3>
                    <p className="text-[14px] text-[var(--text-tertiary)] max-w-md">
                      We&apos;re currently indexing {activeTab} for this profile. Check back shortly.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
