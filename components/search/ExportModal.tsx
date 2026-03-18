'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ExportModal({ isOpen, onClose, papers }: { isOpen: boolean; onClose: () => void; papers: any[] }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--bg-elevated)] border-[var(--border)] rounded-[32px] p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Export Citations</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-slate-400 text-sm">
          Export {papers.length} paper(s) to BibTeX or RIS format.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl">Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
