export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  institution: string | null;
  department: string | null;
  position: string | null;
  website: string | null;
  google_scholar_url: string | null;
  orcid: string | null;
  github_username: string | null;
  twitter_handle: string | null;
  research_interests: string[] | null;
  skills: string[] | null;
  tools: string[] | null;
  research_mode: boolean;
  reputation_score: number;
  h_index: number | null;
  posts_count: number;
  papers_shared_count: number;
  annotations_count: number;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  dna_tallies?: Record<string, number>;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  doi: string | null;
  url: string | null;
  pdf_url: string | null;
  citation_count: number;
  reference_count: number;
  source: string | null;
  external_ids: any | null;
  fields_of_study: string[] | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  tldr: string | null;
  credibility_score: number | null;
  cached_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  rich_content: any | null;
  post_type: 'thought' | 'paper_share' | 'question' | 'research_problem' | 'dataset_share' | 'insight' | 'poll' | 'collaboration_request' | 'research_thread' | 'milestone';
  paper_id: string | null;
  community_id: string | null;
  parent_id: string | null;
  repost_id: string | null;
  thread_structure: any | null;
  poll_options: any | null;
  poll_ends_at: string | null;
  tags: string[] | null;
  idea_version: number;
  idea_parent_id: string | null;
  credibility_score: number | null;
  quality_score: number | null;
  ai_enhanced: boolean;
  likes_count: number;
  replies_count: number;
  reposts_count: number;
  bookmarks_count: number;
  views_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  paper?: Paper;
}

export interface Annotation {
  id: string;
  user_id: string;
  paper_id: string;
  highlighted_text: string | null;
  note: string;
  annotation_type: 'note' | 'question' | 'critique' | 'insight' | 'method_note' | 'result_note';
  section_reference: string | null;
  line_reference: string | null;
  is_public: boolean;
  likes_count: number;
  created_at: string;
  user?: Profile;
}

export interface ReadingList {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  cover_emoji: string;
  is_public: boolean;
  is_collaborative: boolean;
  followers_count: number;
  papers_count: number;
  tags: string[] | null;
  community_id: string | null;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  problem_statement: string;
  cover_emoji: string;
  cover_url: string | null;
  tags: string[] | null;
  members_count: number;
  posts_count: number;
  is_ai_created: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: string;
  resource_type: string | null;
  resource_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface Dataset {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  doi: string | null;
  url: string | null;
  tags: string[] | null;
  version: string | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  author_id: string;
  title: string;
  description: string;
  status: 'draft' | 'developing' | 'published' | 'completed';
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: 'created_post' | 'shared_paper' | 'added_dataset' | 'annotated' | 'created_list' | 'created_idea' | 'gained_follower' | 'reputation_change';
  target_id: string | null;
  target_type: string | null;
  description: string;
  points_change: number;
  created_at: string;
}
