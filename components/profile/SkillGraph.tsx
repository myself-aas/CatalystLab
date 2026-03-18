'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Skill {
  axis: string;
  value: number;
}

interface SkillGraphProps {
  skills: Skill[];
}

export function SkillGraph({ skills }: SkillGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || skills.length === 0) return;

    const width = 300;
    const height = 300;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    const levels = 5;
    const total = skills.length;
    const angleSlice = (Math.PI * 2) / total;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', '100%');

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Circular grid
    for (let j = 0; j < levels; j++) {
      const levelRadius = (radius / levels) * (j + 1);
      g.append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', 'var(--border)')
        .attr('stroke-dasharray', '2,2')
        .attr('stroke-opacity', 0.5);
    }

    // Axes
    const axis = g.selectAll('.axis')
      .data(skills)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1);

    axis.append('text')
      .attr('x', (d, i) => (radius + 20) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => (radius + 20) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.axis)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--text-tertiary)')
      .attr('font-size', '9px')
      .attr('font-weight', 'black')
      .attr('text-transform', 'uppercase')
      .attr('letter-spacing', '0.05em');

    // Radar area
    const radarLine = d3.lineRadial<Skill>()
      .radius(d => (d.value / 100) * radius)
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(skills)
      .attr('d', radarLine)
      .attr('fill', '#818cf8')
      .attr('fill-opacity', 0.2)
      .attr('stroke', '#818cf8')
      .attr('stroke-width', 2);

    // Data points
    g.selectAll('.radarCircle')
      .data(skills)
      .enter()
      .append('circle')
      .attr('class', 'radarCircle')
      .attr('r', 4)
      .attr('cx', (d, i) => (d.value / 100) * radius * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => (d.value / 100) * radius * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('fill', '#818cf8')
      .attr('stroke', 'var(--bg-surface)')
      .attr('stroke-width', 2);

  }, [skills]);

  return (
    <div className="bg-[var(--bg-surface2)] border border-[var(--border)] rounded-3xl p-6 space-y-4">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Research DNA</h3>
      <div className="w-full aspect-square flex items-center justify-center">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}
