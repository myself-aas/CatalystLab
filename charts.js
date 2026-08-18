// ============================================================
// CatalystLab — Pure SVG Interactive Radar Chart Engine
// Zero-dependency, responsive, and robust for single & dual audits
// ============================================================

(function () {
  'use strict';

  const CATEGORY_NAMES = {
    seo: 'SEO',
    security: 'Security',
    performance: 'Performance',
    mobile: 'Mobile',
    accessibility: 'Accessibility',
    social: 'Social',
    ethical: 'Ethics',
    web_standards: 'Web Standards',
    ai_readiness: 'AI Readiness',
    ux_ecosystem: 'UX & Ecosystem'
  };

  function getCategoryTitle(key) {
    if (CATEGORY_NAMES[key]) return CATEGORY_NAMES[key];
    return key
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  function getGrade(score) {
    if (score >= 90) return { label: 'A', class: 'score-good', color: '#10b981' };
    if (score >= 80) return { label: 'B', class: 'score-good', color: '#3b82f6' };
    if (score >= 70) return { label: 'C', class: 'score-warn', color: '#f59e0b' };
    if (score >= 60) return { label: 'D', class: 'score-bad', color: '#ef4444' };
    return { label: 'F', class: 'score-bad', color: '#dc2626' };
  }

  function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
    return el;
  }

  // --- Single Report Radar Chart ---
  function renderRadarChart(report) {
    const container = document.getElementById('radarChartContainer');
    if (!container || !report || !report.categories) return;

    container.innerHTML = '';
    container.style.position = 'relative';

    const categories = report.categories;
    const catKeys = Object.keys(categories);
    const totalAxes = catKeys.length;
    if (totalAxes < 3) return;

    const size = 520;
    const cx = size / 2;
    const cy = size / 2 + 10;
    const radius = 165;
    const levels = 5; // 20, 40, 60, 80, 100

    const svg = createSvgElement('svg', {
      viewBox: `0 0 ${size} ${size}`,
      width: '100%',
      height: '100%',
      style: 'display: block; overflow: visible; font-family: inherit;'
    });

    // Defs for Gradients & Filters
    const defs = createSvgElement('defs');
    defs.innerHTML = `
      <linearGradient id="singleRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.65" />
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.3" />
      </linearGradient>
      <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
    svg.appendChild(defs);

    // 1. Concentric Grid Polygons
    const gridGroup = createSvgElement('g', { class: 'radar-grid' });
    for (let l = 1; l <= levels; l++) {
      const levelFactor = l / levels;
      const levelPoints = [];
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
        const x = cx + radius * levelFactor * Math.cos(angle);
        const y = cy + radius * levelFactor * Math.sin(angle);
        levelPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      const polygon = createSvgElement('polygon', {
        points: levelPoints.join(' '),
        fill: l % 2 === 0 ? 'rgba(241, 245, 249, 0.45)' : 'rgba(255, 255, 255, 0.2)',
        stroke: '#e2e8f0',
        'stroke-width': '1',
        'stroke-dasharray': l === levels ? 'none' : '3 3'
      });
      gridGroup.appendChild(polygon);

      // Level percentage labels along top axis
      const topAngle = -Math.PI / 2;
      const labelY = cy + radius * levelFactor * Math.sin(topAngle);
      const textLevel = createSvgElement('text', {
        x: cx + 4,
        y: labelY - 2,
        fill: '#94a3b8',
        'font-size': '10',
        'font-weight': '600',
        'text-anchor': 'start'
      });
      textLevel.textContent = `${l * 20}`;
      gridGroup.appendChild(textLevel);
    }
    svg.appendChild(gridGroup);

    // 2. Radial Axis Spokes & Category Labels
    const axisGroup = createSvgElement('g', { class: 'radar-axes' });
    const labelRadius = radius + 32;

    catKeys.forEach((k, i) => {
      const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
      const endX = cx + radius * Math.cos(angle);
      const endY = cy + radius * Math.sin(angle);

      // Spoke line
      const spoke = createSvgElement('line', {
        x1: cx,
        y1: cy,
        x2: endX,
        y2: endY,
        stroke: '#cbd5e1',
        'stroke-width': '1'
      });
      axisGroup.appendChild(spoke);

      // Label positioning
      const lx = cx + labelRadius * Math.cos(angle);
      const ly = cy + labelRadius * Math.sin(angle);

      let textAnchor = 'middle';
      const cos = Math.cos(angle);
      if (cos > 0.3) textAnchor = 'start';
      else if (cos < -0.3) textAnchor = 'end';

      const labelText = createSvgElement('text', {
        x: lx,
        y: ly,
        fill: '#334155',
        'font-size': '12',
        'font-weight': '700',
        'text-anchor': textAnchor,
        'dominant-baseline': 'central',
        style: 'cursor: default; transition: fill 0.2s;'
      });
      labelText.textContent = getCategoryTitle(k);
      axisGroup.appendChild(labelText);
    });
    svg.appendChild(axisGroup);

    // 3. Data Area Polygon
    const dataPoints = [];
    const pointCoords = [];

    catKeys.forEach((k, i) => {
      const score = Math.max(0, Math.min(100, categories[k]?.score || 0));
      const factor = score / 100;
      const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
      const x = cx + radius * factor * Math.cos(angle);
      const y = cy + radius * factor * Math.sin(angle);
      dataPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      pointCoords.push({ x, y, score, key: k, title: getCategoryTitle(k) });
    });

    const dataPolygon = createSvgElement('polygon', {
      points: dataPoints.join(' '),
      fill: 'url(#singleRadarGrad)',
      stroke: '#4f46e5',
      'stroke-width': '2.5',
      'stroke-linejoin': 'round',
      filter: 'url(#radarGlow)',
      style: 'transition: all 0.3s ease;'
    });
    svg.appendChild(dataPolygon);

    // Tooltip Element Setup
    let tooltip = container.querySelector('.radar-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'radar-tooltip';
      tooltip.style.cssText = `
        position: absolute;
        display: none;
        pointer-events: none;
        background: #0f172a;
        color: #ffffff;
        padding: 0.45rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 50;
        transform: translate(-50%, -120%);
        white-space: nowrap;
        transition: opacity 0.15s ease;
      `;
      container.appendChild(tooltip);
    }

    // 4. Data Vertex Points with Interactive Hover
    const verticesGroup = createSvgElement('g', { class: 'radar-vertices' });
    pointCoords.forEach((pt) => {
      const grade = getGrade(pt.score);
      const circleOuter = createSvgElement('circle', {
        cx: pt.x,
        cy: pt.y,
        r: '7',
        fill: '#ffffff',
        stroke: '#4f46e5',
        'stroke-width': '2.5',
        style: 'cursor: pointer; transition: transform 0.15s ease, r 0.15s ease;'
      });

      circleOuter.addEventListener('mouseenter', () => {
        circleOuter.setAttribute('r', '10');
        circleOuter.setAttribute('fill', '#4f46e5');
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <div style="font-weight:700; color:#cbd5e1; margin-bottom:2px;">${pt.title}</div>
          <div>Health Score: <strong style="color:${grade.color}; font-size:0.95rem;">${pt.score}/100</strong> (Grade ${grade.label})</div>
        `;
        const rect = container.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        const relX = (pt.x / size) * svgRect.width;
        const relY = (pt.y / size) * svgRect.height;
        tooltip.style.left = `${relX}px`;
        tooltip.style.top = `${relY}px`;
      });

      circleOuter.addEventListener('mouseleave', () => {
        circleOuter.setAttribute('r', '7');
        circleOuter.setAttribute('fill', '#ffffff');
        tooltip.style.display = 'none';
      });

      verticesGroup.appendChild(circleOuter);
    });
    svg.appendChild(verticesGroup);

    container.appendChild(svg);
  }

  // --- Dual Comparison Radar Chart ---
  function renderDualRadarChart(reportA, reportB) {
    const container = document.getElementById('compareRadarChartContainer');
    if (!container || !reportA || !reportA.categories || !reportB || !reportB.categories) return;

    container.innerHTML = '';
    container.style.position = 'relative';

    const catKeys = Object.keys(reportA.categories);
    const totalAxes = catKeys.length;
    if (totalAxes < 3) return;

    const size = 540;
    const cx = size / 2;
    const cy = size / 2 + 15;
    const radius = 170;
    const levels = 5;

    const svg = createSvgElement('svg', {
      viewBox: `0 0 ${size} ${size}`,
      width: '100%',
      height: '100%',
      style: 'display: block; overflow: visible; font-family: inherit;'
    });

    // Defs
    const defs = createSvgElement('defs');
    defs.innerHTML = `
      <linearGradient id="dualGradA" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#818cf8" stop-opacity="0.2" />
      </linearGradient>
      <linearGradient id="dualGradB" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#34d399" stop-opacity="0.2" />
      </linearGradient>
    `;
    svg.appendChild(defs);

    // 1. Grid Polygons
    const gridGroup = createSvgElement('g', { class: 'radar-grid' });
    for (let l = 1; l <= levels; l++) {
      const levelFactor = l / levels;
      const levelPoints = [];
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
        const x = cx + radius * levelFactor * Math.cos(angle);
        const y = cy + radius * levelFactor * Math.sin(angle);
        levelPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      const polygon = createSvgElement('polygon', {
        points: levelPoints.join(' '),
        fill: l % 2 === 0 ? 'rgba(241, 245, 249, 0.45)' : 'rgba(255, 255, 255, 0.2)',
        stroke: '#e2e8f0',
        'stroke-width': '1',
        'stroke-dasharray': l === levels ? 'none' : '3 3'
      });
      gridGroup.appendChild(polygon);

      const topAngle = -Math.PI / 2;
      const labelY = cy + radius * levelFactor * Math.sin(topAngle);
      const textLevel = createSvgElement('text', {
        x: cx + 4,
        y: labelY - 2,
        fill: '#94a3b8',
        'font-size': '10',
        'font-weight': '600',
        'text-anchor': 'start'
      });
      textLevel.textContent = `${l * 20}`;
      gridGroup.appendChild(textLevel);
    }
    svg.appendChild(gridGroup);

    // 2. Spokes & Labels
    const axisGroup = createSvgElement('g', { class: 'radar-axes' });
    const labelRadius = radius + 32;

    catKeys.forEach((k, i) => {
      const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
      const endX = cx + radius * Math.cos(angle);
      const endY = cy + radius * Math.sin(angle);

      const spoke = createSvgElement('line', {
        x1: cx,
        y1: cy,
        x2: endX,
        y2: endY,
        stroke: '#cbd5e1',
        'stroke-width': '1'
      });
      axisGroup.appendChild(spoke);

      const lx = cx + labelRadius * Math.cos(angle);
      const ly = cy + labelRadius * Math.sin(angle);

      let textAnchor = 'middle';
      const cos = Math.cos(angle);
      if (cos > 0.3) textAnchor = 'start';
      else if (cos < -0.3) textAnchor = 'end';

      const labelText = createSvgElement('text', {
        x: lx,
        y: ly,
        fill: '#334155',
        'font-size': '12',
        'font-weight': '700',
        'text-anchor': textAnchor,
        'dominant-baseline': 'central'
      });
      labelText.textContent = getCategoryTitle(k);
      axisGroup.appendChild(labelText);
    });
    svg.appendChild(axisGroup);

    // 3. Polygons for Site A & Site B
    const pointsA = [];
    const pointsB = [];
    const coordsA = [];
    const coordsB = [];

    catKeys.forEach((k, i) => {
      const scoreA = Math.max(0, Math.min(100, reportA.categories[k]?.score || 0));
      const scoreB = Math.max(0, Math.min(100, reportB.categories[k]?.score || 0));
      const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;

      const xA = cx + radius * (scoreA / 100) * Math.cos(angle);
      const yA = cy + radius * (scoreA / 100) * Math.sin(angle);
      pointsA.push(`${xA.toFixed(1)},${yA.toFixed(1)}`);
      coordsA.push({ x: xA, y: yA, score: scoreA, key: k, title: getCategoryTitle(k) });

      const xB = cx + radius * (scoreB / 100) * Math.cos(angle);
      const yB = cy + radius * (scoreB / 100) * Math.sin(angle);
      pointsB.push(`${xB.toFixed(1)},${yB.toFixed(1)}`);
      coordsB.push({ x: xB, y: yB, score: scoreB, key: k, title: getCategoryTitle(k) });
    });

    const polyA = createSvgElement('polygon', {
      points: pointsA.join(' '),
      fill: 'url(#dualGradA)',
      stroke: '#4f46e5',
      'stroke-width': '2.5',
      'stroke-linejoin': 'round'
    });
    svg.appendChild(polyA);

    const polyB = createSvgElement('polygon', {
      points: pointsB.join(' '),
      fill: 'url(#dualGradB)',
      stroke: '#10b981',
      'stroke-width': '2.5',
      'stroke-linejoin': 'round'
    });
    svg.appendChild(polyB);

    // Tooltip
    let tooltip = container.querySelector('.radar-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'radar-tooltip';
      tooltip.style.cssText = `
        position: absolute;
        display: none;
        pointer-events: none;
        background: #0f172a;
        color: #ffffff;
        padding: 0.5rem 0.8rem;
        border-radius: 6px;
        font-size: 0.82rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 50;
        transform: translate(-50%, -120%);
        white-space: nowrap;
        transition: opacity 0.15s ease;
      `;
      container.appendChild(tooltip);
    }

    const verticesGroup = createSvgElement('g', { class: 'radar-vertices' });

    // Hostname labels for tooltips
    let hostA = 'Site A';
    let hostB = 'Site B';
    try { if (reportA.url) hostA = new URL(reportA.url).hostname; } catch(e) {}
    try { if (reportB.url) hostB = new URL(reportB.url).hostname; } catch(e) {}

    // Add vertices A
    coordsA.forEach((pt, idx) => {
      const ptB = coordsB[idx];
      const circleA = createSvgElement('circle', {
        cx: pt.x,
        cy: pt.y,
        r: '6',
        fill: '#ffffff',
        stroke: '#4f46e5',
        'stroke-width': '2.5',
        style: 'cursor: pointer;'
      });

      circleA.addEventListener('mouseenter', () => {
        circleA.setAttribute('r', '9');
        circleA.setAttribute('fill', '#4f46e5');
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <div style="font-weight:700; color:#cbd5e1; margin-bottom:3px;">${pt.title}</div>
          <div style="color:#818cf8;">● ${hostA}: <strong>${pt.score}/100</strong></div>
          <div style="color:#34d399;">● ${hostB}: <strong>${ptB.score}/100</strong></div>
        `;
        const svgRect = svg.getBoundingClientRect();
        tooltip.style.left = `${(pt.x / size) * svgRect.width}px`;
        tooltip.style.top = `${(pt.y / size) * svgRect.height}px`;
      });
      circleA.addEventListener('mouseleave', () => {
        circleA.setAttribute('r', '6');
        circleA.setAttribute('fill', '#ffffff');
        tooltip.style.display = 'none';
      });
      verticesGroup.appendChild(circleA);
    });

    // Add vertices B
    coordsB.forEach((pt, idx) => {
      const ptA = coordsA[idx];
      const circleB = createSvgElement('circle', {
        cx: pt.x,
        cy: pt.y,
        r: '6',
        fill: '#ffffff',
        stroke: '#10b981',
        'stroke-width': '2.5',
        style: 'cursor: pointer;'
      });

      circleB.addEventListener('mouseenter', () => {
        circleB.setAttribute('r', '9');
        circleB.setAttribute('fill', '#10b981');
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <div style="font-weight:700; color:#cbd5e1; margin-bottom:3px;">${pt.title}</div>
          <div style="color:#818cf8;">● ${hostA}: <strong>${ptA.score}/100</strong></div>
          <div style="color:#34d399;">● ${hostB}: <strong>${pt.score}/100</strong></div>
        `;
        const svgRect = svg.getBoundingClientRect();
        tooltip.style.left = `${(pt.x / size) * svgRect.width}px`;
        tooltip.style.top = `${(pt.y / size) * svgRect.height}px`;
      });
      circleB.addEventListener('mouseleave', () => {
        circleB.setAttribute('r', '6');
        circleB.setAttribute('fill', '#ffffff');
        tooltip.style.display = 'none';
      });
      verticesGroup.appendChild(circleB);
    });

    svg.appendChild(verticesGroup);

    // 4. Integrated Legend at Top
    const legendGroup = createSvgElement('g', { class: 'radar-legend' });
    legendGroup.innerHTML = `
      <g transform="translate(${cx - 140}, 20)">
        <rect x="0" y="0" width="12" height="12" rx="3" fill="#4f46e5" />
        <text x="18" y="10" fill="#1e293b" font-size="12" font-weight="700">${hostA}</text>
      </g>
      <g transform="translate(${cx + 20}, 20)">
        <rect x="0" y="0" width="12" height="12" rx="3" fill="#10b981" />
        <text x="18" y="10" fill="#1e293b" font-size="12" font-weight="700">${hostB}</text>
      </g>
    `;
    svg.appendChild(legendGroup);

    container.appendChild(svg);
  }

  // Export functions to global window object
  window.renderRadarChartReact = renderRadarChart;
  window.renderRadarChart = renderRadarChart;
  window.renderDualRadarChartReact = renderDualRadarChart;
  window.renderDualRadarChart = renderDualRadarChart;

})();
