import synthshiftImg from '../assets/images/synthshift_migration_1787420135413.jpg';
import gitlygaseImg from '../assets/images/gitlygase_repo_1787420147890.jpg';
import ecoholoImg from '../assets/images/ecoholo_eco_1787420162544.jpg';
import vitalzymeImg from '../assets/images/vitalzyme_health_1787420174357.jpg';
import edgevmaxImg from '../assets/images/edgevmax_latency_1787420187566.jpg';
import riskproteaseImg from '../assets/images/riskprotease_compliance_1787420200307.jpg';
import llmKinaseImg from '../assets/images/llm_kinase_ai_1787420214376.jpg';
import allostersearchImg from '../assets/images/allostersearch_llmo_1787420226857.jpg';
import dnaServersImg from '../assets/images/dna_servers_1787216887436.jpg';
import coreTelemetryImg from '../assets/images/core_engine_telemetry_1787218799043.jpg';
import aboutHeroImg from '../assets/images/about_us_hero_1787216854874.jpg';
import type { BlogPost } from '../types';

export function getBlogCoverImage(post: Partial<BlogPost>): string {
  if (post.coverImage && (post.coverImage.startsWith('http') || post.coverImage.startsWith('data:') || post.coverImage.startsWith('/'))) {
    return post.coverImage;
  }

  const category = (post.category || '').toLowerCase();
  const slug = (post.slug || '').toLowerCase();
  const title = (post.title || '').toLowerCase();
  const tags = (post.tags || []).map(t => t.toLowerCase()).join(' ');
  const combined = `${category} ${slug} ${title} ${tags}`;

  if (combined.includes('ai') || combined.includes('llm') || combined.includes('llmo') || combined.includes('searchgpt') || combined.includes('perplexity') || combined.includes('rag')) {
    return allostersearchImg;
  }

  if (combined.includes('dom') || combined.includes('health') || combined.includes('lcp') || combined.includes('inp') || combined.includes('cls') || combined.includes('vital') || combined.includes('performance')) {
    return vitalzymeImg;
  }

  if (combined.includes('latency') || combined.includes('ttfb') || combined.includes('edge') || combined.includes('worker') || combined.includes('pop') || combined.includes('speed')) {
    return edgevmaxImg;
  }

  if (combined.includes('repo') || combined.includes('git') || combined.includes('ci/cd') || combined.includes('pipeline') || combined.includes('github') || combined.includes('hygiene')) {
    return gitlygaseImg;
  }

  if (combined.includes('security') || combined.includes('secops') || combined.includes('owasp') || combined.includes('csp') || combined.includes('hsts') || combined.includes('gdpr') || combined.includes('compliance')) {
    return riskproteaseImg;
  }

  if (combined.includes('eco') || combined.includes('carbon') || combined.includes('green') || combined.includes('sustainability') || combined.includes('sustainable')) {
    return ecoholoImg;
  }

  if (combined.includes('migration') || combined.includes('synth') || combined.includes('301') || combined.includes('architecture') || combined.includes('redirect')) {
    return synthshiftImg;
  }

  if (combined.includes('server') || combined.includes('cluster') || combined.includes('infra') || combined.includes('cloud')) {
    return dnaServersImg;
  }

  return coreTelemetryImg;
}
