'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, 
  Users, 
  Globe, 
  Lock, 
  ChevronRight, 
  FileText, 
  ExternalLink, 
  Download, 
  Share2, 
  Bookmark, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Plus,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CitationGraph } from './CitationGraph';
import { ExportModal } from '@/components/search/ExportModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaperDetailProps {
  paperId: string;
  initialData: any;
}

import { generateTLDR, assessCredibility } from '@/lib/gemini';

export function PaperDetail({ paperId, initialData }: PaperDetailProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Fetch full paper data if not in cache
  const { data: paper, isLoading: isPaperLoading } = useQuery({
    queryKey: ['paper-full', paperId],
    queryFn: async () => {
      if (initialData) return initialData;

      // Fetch from Semantic Scholar API
      const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=title,authors,year,abstract,citationCount,referenceCount,externalIds,openAccessPdf,url,fieldsOfStudy,journal,publicationTypes`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const formatted = {
        id: data.paperId,
        title: data.title,
        authors: data.authors?.map((a: any) => a.name) || [],
        year: data.year,
        abstract: data.abstract,
        doi: data.externalIds?.DOI,
        url: data.url,
        pdf_url: data.openAccessPdf?.url,
        citation_count: data.citationCount,
        reference_count: data.referenceCount,
        source: 'Semantic Scholar',
        fields_of_study: data.fieldsOfStudy,
        journal: data.journal?.name,
      };

      // Cache in Firestore
      try {
        await setDoc(doc(db, 'papers', formatted.id), {
          ...formatted,
          updated_at: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error caching paper:', error);
      }

      return formatted;
    },
    initialData,
  });

  // Fetch TLDR
  const { data: tldr, isLoading: isTldrLoading } = useQuery({
    queryKey: ['paper-tldr', paperId],
    queryFn: async () => {
      if (paper?.tldr) return paper.tldr;
      const data = await generateTLDR(paper?.abstract);
      return data.tldr;
    },
    enabled: !!paper?.abstract,
  });

  // Fetch Credibility
  const { data: credibility, isLoading: isCredLoading } = useQuery({
    queryKey: ['paper-credibility', paperId],
    queryFn: async () => {
      if (paper?.credibility_score) return { score: paper.credibility_score };
      return await assessCredibility(paper);
    },
    enabled: !!paper,
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error('Please sign in to bookmark papers');
        return;
      }
      try {
        const path = 'post_bookmarks';
        await addDoc(collection(db, path), { 
          user_id: user.uid, 
          post_id: paperId,
          created_at: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'post_bookmarks');
      }
    },
    onSuccess: () => {
      toast.success('Paper saved to bookmarks');
    },
  });

  if (isPaperLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!paper) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 uppercase tracking-widest text-[10px] font-black">
            {paper.source}
          </Badge>
          <Badge className="bg-white/5 text-slate-400 border-white/10 uppercase tracking-widest text-[10px] font-black">
            {paper.year}
          </Badge>
          {paper.journal && (
            <Badge className="bg-white/5 text-slate-400 border-white/10 uppercase tracking-widest text-[10px] font-black">
              {paper.journal}
            </Badge>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6">
          {paper.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-400 text-sm font-medium mb-10">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {paper.authors.join(', ')}
          </div>
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4" />
            {paper.citation_count} Citations
          </div>
          {paper.doi && (
            <div className="flex items-center gap-2">
              <span className="font-black uppercase tracking-widest text-[10px]">DOI:</span>
              {paper.doi}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 py-6 h-auto font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-2" /> Save to List
          </Button>
          <Button 
            variant="outline" 
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl px-6 py-6 h-auto font-black uppercase tracking-widest text-xs"
            onClick={() => setIsExportOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" /> Cite
          </Button>
          {paper.pdf_url && (
            <Button asChild variant="outline" className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 rounded-xl px-6 py-6 h-auto font-black uppercase tracking-widest text-xs">
              <a href={paper.pdf_url} target="_blank" rel="noreferrer">
                <FileText className="w-4 h-4 mr-2" /> View PDF
              </a>
            </Button>
          )}
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl w-14 h-14 p-0">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl w-14 h-14 p-0"
            onClick={() => bookmarkMutation.mutate()}
          >
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-12">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-auto">
          <TabsTrigger value="overview" className="rounded-xl px-8 py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[11px]">Overview</TabsTrigger>
          <TabsTrigger value="citations" className="rounded-xl px-8 py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[11px]">Citations</TabsTrigger>
          <TabsTrigger value="annotations" className="rounded-xl px-8 py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[11px]">Annotations</TabsTrigger>
          <TabsTrigger value="discussions" className="rounded-xl px-8 py-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[11px]">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-12 mt-0">
          {/* TLDR */}
          <Card className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/20 rounded-[32px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">AI TL;DR</span>
            </div>
            <p className="text-xl font-medium italic leading-relaxed text-white">
              {isTldrLoading ? (
                <span className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating summary...
                </span>
              ) : tldr || 'Summary not available.'}
            </p>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Abstract</h2>
                <p className="text-slate-300 text-lg leading-relaxed font-medium">
                  {paper.abstract || 'No abstract available.'}
                </p>
              </section>

              {paper.fields_of_study && (
                <section>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Fields of Study</h2>
                  <div className="flex flex-wrap gap-2">
                    {paper.fields_of_study.map((field: string, i: number) => (
                      <Badge key={i} className="bg-white/5 text-slate-400 border-white/10 px-4 py-2 rounded-xl text-xs font-bold">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-8">
              {/* Credibility */}
              <Card className="p-8 bg-[var(--bg-surface)] border-[var(--border)] rounded-[32px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">AI Credibility</h3>
                  <ShieldCheck className={cn(
                    "w-5 h-5",
                    credibility?.score > 0.8 ? "text-emerald-400" : "text-amber-400"
                  )} />
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black">{Math.round((credibility?.score || 0) * 100)}%</span>
                  <span className="text-slate-500 text-xs font-bold mb-1">Score</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {credibility?.summary || 'Assessing credibility...'}
                </p>
              </Card>

              {/* Bibliographic Info */}
              <Card className="p-8 bg-[var(--bg-surface)] border-[var(--border)] rounded-[32px] space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Bibliographic Info</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Publisher', value: paper.publisher },
                    { label: 'Journal', value: paper.journal },
                    { label: 'Volume', value: paper.volume },
                    { label: 'Issue', value: paper.issue },
                    { label: 'Pages', value: paper.pages },
                  ].filter(i => i.value).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">{item.label}</span>
                      <span className="text-slate-300 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="citations" className="mt-0">
          <div className="h-[600px] bg-[var(--bg-surface)] border-[var(--border)] rounded-[40px] overflow-hidden relative">
            <CitationGraph paperId={paperId} />
          </div>
        </TabsContent>

        <TabsContent value="annotations" className="mt-0">
          <div className="max-w-3xl mx-auto py-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No annotations yet</h3>
            <p className="text-slate-500 mb-8">Be the first to annotate this paper and share your insights.</p>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-8 py-4 h-auto font-black uppercase tracking-widest text-xs">
              Add First Annotation
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="discussions" className="mt-0">
          <div className="max-w-3xl mx-auto py-12 text-center">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No discussions yet</h3>
            <p className="text-slate-500 mb-8">Start a conversation about this paper on the feed.</p>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-8 py-4 h-auto font-black uppercase tracking-widest text-xs">
              Post to Feed
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        papers={[paper]} 
      />
    </div>
  );
}
