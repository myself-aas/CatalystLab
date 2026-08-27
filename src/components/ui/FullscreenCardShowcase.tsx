import React, { useState } from 'react';
import { FullscreenCard } from './FullscreenCard';
import { FullscreenImageCard } from './FullscreenImageCard';
import { TrailCard } from '../cards/TrailCard';
import { TrailCardProps } from '../../types/card';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

const SAMPLE_TRAILS: TrailCardProps[] = [
  {
    id: 'embercrest-ridge',
    title: 'Embercrest Ridge',
    subtitle: 'Silverpine Mountains',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    imageAltText: 'Embercrest Ridge alpine mountain summit view',
    difficulty: 'Moderate',
    metadataSubtext: '1886 by Helen Rowe & Elias Mendez',
    metrics: {
      distanceKm: 14.2,
      elevationMeters: 820,
      durationMinutes: 225,
    },
  },
  {
    id: 'azure-creek-canyon',
    title: 'Azure Creek Canyon',
    subtitle: 'Cascade Wilderness',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    imageAltText: 'Azure Creek Canyon pristine river valley',
    difficulty: 'Easy',
    metadataSubtext: 'Maintained by Cascade Alpine Conservancy',
    metrics: {
      distanceKm: 6.8,
      elevationMeters: 240,
      durationMinutes: 110,
    },
  },
  {
    id: 'obsidian-spire',
    title: 'Obsidian Spire',
    subtitle: 'Blackrock Range',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    imageAltText: 'Obsidian Spire rugged alpine ascent',
    difficulty: 'Expert',
    metadataSubtext: 'First ascent 1924 by Arthur Sterling',
    metrics: {
      distanceKm: 22.4,
      elevationMeters: 1650,
      durationMinutes: 440,
    },
  },
];

export const FullscreenCardShowcase: React.FC = () => {
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);
  const [selectedMapTrail, setSelectedMapTrail] = useState<string | null>(null);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Unified TrailCard Showcase Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono text-cyan-300 mb-3 backdrop-blur-md">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>Unified Modular Card System</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              High-Cohesion Trail & Route Cards
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base mt-2">
              Strict 3-zone visual layout featuring 4:3 high-contrast gradient scrim header, middle context difficulty row, and 3-column split metrics grid.
            </p>
          </div>

          {(selectedTrail || selectedMapTrail) && (
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              {selectedMapTrail ? `Map pin clicked: ${selectedMapTrail}` : `Card selected: ${selectedTrail}`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_TRAILS.map((trail) => (
            <TrailCard
              key={trail.id}
              {...trail}
              onCardPress={(id) => setSelectedTrail(id)}
              onMapIconPress={(id) => setSelectedMapTrail(id)}
            />
          ))}
        </div>
      </div>

      {/* Telemetry Parallax Cards Section */}
      <div className="space-y-8 pt-8 border-t border-slate-800/80">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-mono text-indigo-300 mb-1 backdrop-blur-md">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Diagnostic Engine Cards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Fullscreen 3D Parallax Telemetry Cards
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Interactive full-bleed diagnostic units with multi-layered depth, responsive cursor tilt,
            and WCAG AA high-contrast gradient scrims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FullscreenCard
            imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
            imageAlt="DOM Telemetry"
            badge="Engine 01"
            score="99.4/100"
            subtitle="Structural Performance"
            title="VitalZyme DOM Inspector"
            metric="14ms"
            metricLabel="Latency"
            description="Analyzes total DOM tree depth, mutation recalculations, and layout shifts."
          />

          <FullscreenCard
            imageUrl="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop"
            imageAlt="Network Jitter"
            badge="Engine 02"
            score="98.1/100"
            subtitle="Edge Infrastructure"
            title="EdgeVmax CDN Latency"
            metric="0.4ms"
            metricLabel="Jitter"
            description="Edge compute distributed ping and network jitter telemetry."
          />

          <FullscreenImageCard
            imageUrl="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop"
            imageAlt="Security Protease"
            badge="Engine 03"
            score="A+ Grade"
            subtitle="Vulnerability Scanner"
            title="RiskProtease Security"
          >
            Continuous OWASP Top 10 and SSL/TLS certificate chain integrity auditor.
          </FullscreenImageCard>
        </div>
      </div>
    </section>
  );
};

export default FullscreenCardShowcase;
