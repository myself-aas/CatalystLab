import React, { useState } from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { Save, Eye } from 'lucide-react';

export const BlogEditorPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <SEOHead title="Blog Editor - CatalystLab" />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">New Post</h1>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-accent text-muted-foreground rounded-lg"><Eye className="w-4 h-4"/> Preview</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"><Save className="w-4 h-4"/> Publish</button>
          </div>
        </div>
        
        <input type="text" placeholder="Post Title..." className="w-full text-4xl font-bold border-none outline-none mb-8 placeholder-muted-foreground" />
        <textarea placeholder="Write your post here..." className="w-full h-96 resize-none outline-none text-lg text-muted-foreground placeholder-muted-foreground"></textarea>
      </div>
    </div>
  );
};
