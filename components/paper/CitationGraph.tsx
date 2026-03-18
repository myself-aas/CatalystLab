'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CitationGraphProps {
  paperId: string;
}

export function CitationGraph({ paperId }: CitationGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch references and citations from Semantic Scholar
        const [refsRes, citesRes] = await Promise.all([
          fetch(`https://api.semanticscholar.org/graph/v1/paper/${paperId}/references?fields=title,year,citationCount,authors&limit=20`),
          fetch(`https://api.semanticscholar.org/graph/v1/paper/${paperId}/citations?fields=title,year,citationCount,authors&limit=20`)
        ]);

        const refs = await refsRes.json();
        const cites = await citesRes.json();

        const nodes = [
          { id: paperId, title: 'Current Paper', type: 'main', size: 20 }
        ];
        const links: any[] = [];

        refs.data?.forEach((ref: any) => {
          if (ref.citedPaper) {
            nodes.push({ 
              id: ref.citedPaper.paperId, 
              title: ref.citedPaper.title, 
              type: 'reference',
              size: Math.min(15, 5 + (ref.citedPaper.citationCount / 100))
            });
            links.push({ source: paperId, target: ref.citedPaper.paperId });
          }
        });

        cites.data?.forEach((cite: any) => {
          if (cite.citingPaper) {
            nodes.push({ 
              id: cite.citingPaper.paperId, 
              title: cite.citingPaper.title, 
              type: 'citation',
              size: Math.min(15, 5 + (cite.citingPaper.citationCount / 100))
            });
            links.push({ source: cite.citingPaper.paperId, target: paperId });
          }
        });

        setData({ nodes, links });
      } catch (e) {
        console.error('Error fetching graph data:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [paperId]);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 10));

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#2d2d4a')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    const node = g.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', (d: any) => d.size)
      .attr('fill', (d: any) => {
        if (d.type === 'main') return '#818cf8';
        if (d.type === 'reference') return '#34d399';
        return '#f87171';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('title')
      .text((d: any) => d.title);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => { simulation.stop(); };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <div className="flex items-center gap-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400" /> Current
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" /> References
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-400" /> Citations
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="icon" className="bg-black/50 border-white/10 text-white rounded-xl w-10 h-10">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-black/50 border-white/10 text-white rounded-xl w-10 h-10">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-black/50 border-white/10 text-white rounded-xl w-10 h-10">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
