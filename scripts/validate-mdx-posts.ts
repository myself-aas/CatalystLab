#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';

const POSTS_DIR = path.resolve(process.cwd(), 'blogs/posts');

async function validatePosts() {
  const files = await fs.readdir(POSTS_DIR);
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  
  console.log(`Found ${mdxFiles.length} MDX files to validate\n`);
  
  let hasErrors = false;
  
  for (const file of mdxFiles) {
    const slug = file.replace('.mdx', '');
    const filePath = path.join(POSTS_DIR, file);
    
    try {
      const source = await fs.readFile(filePath, 'utf-8');
      const { frontmatter } = await compileMDX({
        source,
        options: { parseFrontmatter: true },
      });
      
      // Check required fields
      const required = ['title', 'date', 'excerpt', 'author', 'category'];
      const missing = required.filter(field => !frontmatter[field as keyof typeof frontmatter]);
      
      if (missing.length > 0) {
        console.error(`❌ ${slug}: Missing required fields: ${missing.join(', ')}`);
        hasErrors = true;
      } else {
        console.log(`✅ ${slug}: ${frontmatter.title}`);
      }
    } catch (error) {
      console.error(`❌ ${slug}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.error('\n❌ Validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ All posts validated successfully');
  }
}

validatePosts();