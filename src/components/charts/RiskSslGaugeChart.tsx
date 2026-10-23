import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { ShieldCheck, ShieldAlert, Lock, AlertTriangle, Key, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { SpoofingRiskLevel, ProtectionStatus, SslStatusInfo } from '../../types';

export interface RiskSslGaugeProps {
  spoofingRisk?: SpoofingRiskLevel;
  spfStatus?: ProtectionStatus;
  dmarcStatus?: ProtectionStatus;
  sslStatus?: SslStatusInfo;
  rawOutput?: string;
  className?: string;
  compact?: boolean;
}

export const RiskSslGaugeChart: React.FC<RiskSslGaugeProps> = React.memo(({
  spoofingRisk,
  spfStatus,
  dmarcStatus,
  sslStatus,
  rawOutput = '',
  className = '',
  compact = false
}) => {
  const spoofingSvgRef = useRef<SVGSVGElement | null>(null);
  const sslSvgRef = useRef<SVGSVGElement | null>(null);

  // Extract / resolve data from props or raw output. Nothing is defaulted: a
  // missing reading stays null and the gauge says "Not measured".
  const resolvedData = useMemo(() => {
    let risk: SpoofingRiskLevel | null = spoofingRisk ?? null;
    let spf: ProtectionStatus | null = spfStatus ?? null;
    let dmarc: ProtectionStatus | null = dmarcStatus ?? null;
    let ssl: SslStatusInfo | null = sslStatus ?? null;

    if (rawOutput) {
      try {
        if (rawOutput.includes('---CATALYST_METRICS---')) {
          const jsonPart = rawOutput.split('---CATALYST_METRICS---')[1]?.trim();
          if (jsonPart) {
            const parsed = JSON.parse(jsonPart);
            if (!spoofingRisk && parsed.spoofing_risk_level) risk = parsed.spoofing_risk_level;
            if (!spfStatus && parsed.spf_status) spf = parsed.spf_status;
            if (!dmarcStatus && parsed.dmarc_status) dmarc = parsed.dmarc_status;
            if (!sslStatus && parsed.ssl_status) ssl = parsed.ssl_status;
          }
        }
      } catch {
        // Unreadable metrics block: keep the props.
      }

      if (!risk) {
        if (/Spoofing Risk Rating:\s*High Risk/i.test(rawOutput)) risk = 'High Risk';
        else if (/Spoofing Risk Rating:\s*Medium Risk/i.test(rawOutput)) risk = 'Medium Risk';
        else if (/Spoofing Risk Rating:\s*Low Risk/i.test(rawOutput)) risk = 'Low Risk';
      }

      if (!spf) {
        if (/\+\] PASS: SPF Structural Record validated/i.test(rawOutput)) spf = 'Configured';
        else if (/Missing SPF record/i.test(rawOutput)) spf = 'Missing Protection';
      }

      if (!dmarc) {
        if (/\+\] PASS: DMARC Policy validated/i.test(rawOutput)) dmarc = 'Configured';
        else if (/Missing DMARC policy/i.test(rawOutput)) dmarc = 'Missing Protection';
      }

      if (!ssl) {
        const daysMatch = rawOutput.match(/Days Until Expiration:\s*(\d+)/i);
        const statusMatch = rawOutput.match(/Expiration Status:\s*(EXPIRED|VALID)/i);
        const cipherMatch = rawOutput.match(/Cipher & Protocol:\s*([^\n\r]+)/i);
        if (daysMatch || statusMatch || cipherMatch) {
          ssl = {
            measured: true,
            is_expired: statusMatch ? statusMatch[1].toUpperCase() === 'EXPIRED' : null,
            days_until_expiration: daysMatch ? Number(daysMatch[1]) : null,
            encryption_algorithm: cipherMatch ? cipherMatch[1].trim() : null,
            validation_alert: null,
          };
        }
      }
    }

    return { risk, spf, dmarc, ssl };
  }, [spoofingRisk, spfStatus, dmarcStatus, sslStatus, rawOutput]);

  // 1. D3 Spoofing Risk Gauge Render
  useEffect(() => {
    if (!spoofingSvgRef.current) return;

    const svg = d3.select(spoofingSvgRef.current);
    svg.selectAll('*').remove();

    const width = compact ? 190 : 230;
    const height = compact ? 130 : 155;
    const margin = { top: 12, right: 12, bottom: 12, left: 12 };
    const radius = Math.min(width, height * 1.5) / 2 - 12;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height - 18})`);

    // Angles from -pi/2 to pi/2 (180 degree semi-circle)
    const minAngle = -Math.PI / 2;
    const maxAngle = Math.PI / 2;

    if (!resolvedData.risk) {
      g.append('text')
        .attr('x', 0)
        .attr('y', -radius / 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', compact ? '11px' : '13px')
        .attr('fill', 'var(--app-muted-foreground, currentColor)')
        .text('Not measured');
      return;
    }

    // Numerical value for risk: Low = 0.18, Medium = 0.52, High = 0.88
    let riskFraction = 0.18;
    let riskColor = 'var(--color-cream)'; // Green
    if (resolvedData.risk === 'Medium Risk') {
      riskFraction = 0.52;
      riskColor = 'var(--color-cream)'; // Amber
    } else if (resolvedData.risk === 'High Risk') {
      riskFraction = 0.88;
      riskColor = 'white'; // Rose
    }

    const currentAngle = minAngle + riskFraction * (maxAngle - minAngle);

    // Background track arc
    const arcBg = d3
      .arc()
      .innerRadius(radius - (compact ? 12 : 16))
      .outerRadius(radius)
      .startAngle(minAngle)
      .endAngle(maxAngle)
      .cornerRadius(4);

    g.append('path')
      .attr('d', arcBg as any)
      .attr('fill', 'var(--app-muted)')
      .attr('stroke', 'rgba(240,250,255,0.6)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // Segments: Low (0 - 33%), Medium (33% - 66%), High (66% - 100%)
    const segments = [
      { start: minAngle, end: minAngle + (maxAngle - minAngle) * 0.33, color: 'var(--color-cream)', label: 'LOW' },
      { start: minAngle + (maxAngle - minAngle) * 0.33, end: minAngle + (maxAngle - minAngle) * 0.66, color: 'var(--color-cream)', label: 'MED' },
      { start: minAngle + (maxAngle - minAngle) * 0.66, end: maxAngle, color: 'white', label: 'HIGH' }
    ];

    segments.forEach((seg, i) => {
      const segArc = d3
        .arc()
        .innerRadius(radius - (compact ? 11 : 14))
        .outerRadius(radius - 1)
        .startAngle(seg.start)
        .endAngle(seg.end);

      g.append('path')
        .attr('d', segArc as any)
        .attr('fill', seg.color)
        .attr('opacity', 0.25);
    });

    // Active Value Arc
    const valueArc = d3
      .arc()
      .innerRadius(radius - (compact ? 12 : 16))
      .outerRadius(radius)
      .startAngle(minAngle)
      .cornerRadius(4);

    const activePath = g
      .append('path')
      .datum({ endAngle: minAngle })
      .attr('fill', riskColor);

    activePath
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (d: any) {
        const interpolate = d3.interpolate(d.endAngle, currentAngle);
        return function (t: number) {
          d.endAngle = interpolate(t);
          return valueArc(d) || '';
        };
      });

    // Needle pivot center
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', compact ? 5 : 7)
      .attr('fill', 'var(--app-foreground)')
      .attr('stroke', 'var(--app-background, var(--color-ink-navy))')
      .attr('stroke-width', 2);

    // Needle Line
    const needleLength = radius - 8;
    const needleGroup = g.append('g');

    const needlePath = d3.path();
    needlePath.moveTo(0, 0);
    needlePath.lineTo(0, -needleLength);

    const needle = needleGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -needleLength)
      .attr('stroke', 'var(--app-foreground)')
      .attr('stroke-width', compact ? 2 : 2.5)
      .attr('stroke-linecap', 'round');

    needleGroup
      .attr('transform', `rotate(${(minAngle * 180) / Math.PI})`)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('transform', `rotate(${(currentAngle * 180) / Math.PI})`);

    // Ticks & Labels
    const ticks = [
      { angle: minAngle, label: 'Low', color: 'var(--color-cream)' },
      { angle: 0, label: 'Med', color: 'var(--color-cream)' },
      { angle: maxAngle, label: 'High', color: 'white' }
    ];

    ticks.forEach((t) => {
      const rTick = radius + 6;
      const x = rTick * Math.sin(t.angle);
      const y = -rTick * Math.cos(t.angle);

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', t.angle < -0.1 ? 'end' : t.angle > 0.1 ? 'start' : 'middle')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', t.color)
        .text(t.label);
    });

    // Center Risk Badge
    g.append('text')
      .attr('x', 0)
      .attr('y', -radius / 3)
      .attr('text-anchor', 'middle')
      .attr('font-size', compact ? '11px' : '13px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('font-weight', 'bold')
      .attr('fill', riskColor)
      .text(resolvedData.risk);
  }, [resolvedData.risk, compact]);

  // 2. D3 SSL Expiration Gauge Render
  useEffect(() => {
    if (!sslSvgRef.current) return;

    const svg = d3.select(sslSvgRef.current);
    svg.selectAll('*').remove();

    const width = compact ? 190 : 230;
    const height = compact ? 130 : 155;
    const radius = Math.min(width, height * 1.5) / 2 - 12;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height - 18})`);

    const minAngle = -Math.PI / 2;
    const maxAngle = Math.PI / 2;

    const days = resolvedData.ssl?.days_until_expiration ?? null;
    if (!resolvedData.ssl?.measured || days === null) {
      g.append('text')
        .attr('x', 0)
        .attr('y', -radius / 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', compact ? '11px' : '13px')
        .attr('fill', 'var(--app-muted-foreground, currentColor)')
        .text('Not measured');
      return;
    }

    // Max scale represents 90 days (standard Let's Encrypt / modern CA cycle)
    const maxDays = 90;
    const dayFraction = Math.min(1, Math.max(0, days / maxDays));

    let sslColor = 'var(--color-cream)'; // Green
    if (resolvedData.ssl.is_expired || days <= 0) {
      sslColor = 'white'; // Rose / Expired
    } else if (days <= 30) {
      sslColor = 'var(--color-cream)'; // Amber / Expiring Soon
    }

    const currentAngle = minAngle + dayFraction * (maxAngle - minAngle);

    // Track
    const arcBg = d3
      .arc()
      .innerRadius(radius - (compact ? 12 : 16))
      .outerRadius(radius)
      .startAngle(minAngle)
      .endAngle(maxAngle)
      .cornerRadius(4);

    g.append('path')
      .attr('d', arcBg as any)
      .attr('fill', 'var(--app-muted)')
      .attr('stroke', 'rgba(240,250,255,0.6)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // Threshold zones
    const criticalEnd = minAngle + (maxAngle - minAngle) * 0.1;
    const warningEnd = minAngle + (maxAngle - minAngle) * (30 / maxDays);

    const warnArc = d3
      .arc()
      .innerRadius(radius - (compact ? 11 : 14))
      .outerRadius(radius - 1)
      .startAngle(minAngle)
      .endAngle(warningEnd);

    g.append('path')
      .attr('d', warnArc as any)
      .attr('fill', 'var(--color-cream)')
      .attr('opacity', 0.2);

    const safeArc = d3
      .arc()
      .innerRadius(radius - (compact ? 11 : 14))
      .outerRadius(radius - 1)
      .startAngle(warningEnd)
      .endAngle(maxAngle);

    g.append('path')
      .attr('d', safeArc as any)
      .attr('fill', 'var(--color-cream)')
      .attr('opacity', 0.2);

    // Active Day Arc
    const valueArc = d3
      .arc()
      .innerRadius(radius - (compact ? 12 : 16))
      .outerRadius(radius)
      .startAngle(minAngle)
      .cornerRadius(4);

    const activePath = g
      .append('path')
      .datum({ endAngle: minAngle })
      .attr('fill', sslColor);

    activePath
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (d: any) {
        const interpolate = d3.interpolate(d.endAngle, currentAngle);
        return function (t: number) {
          d.endAngle = interpolate(t);
          return valueArc(d) || '';
        };
      });

    // Needle pivot
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', compact ? 5 : 7)
      .attr('fill', 'var(--app-foreground)')
      .attr('stroke', 'var(--app-background, var(--color-ink-navy))')
      .attr('stroke-width', 2);

    // Needle
    const needleLength = radius - 8;
    const needleGroup = g.append('g');

    needleGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -needleLength)
      .attr('stroke', 'var(--app-foreground)')
      .attr('stroke-width', compact ? 2 : 2.5)
      .attr('stroke-linecap', 'round');

    needleGroup
      .attr('transform', `rotate(${(minAngle * 180) / Math.PI})`)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('transform', `rotate(${(currentAngle * 180) / Math.PI})`);

    // Ticks & Labels
    const ticks = [
      { angle: minAngle, label: '0d', color: 'white' },
      { angle: minAngle + (maxAngle - minAngle) * (30 / maxDays), label: '30d', color: 'var(--color-cream)' },
      { angle: maxAngle, label: '90d+', color: 'var(--color-cream)' }
    ];

    ticks.forEach((t) => {
      const rTick = radius + 6;
      const x = rTick * Math.sin(t.angle);
      const y = -rTick * Math.cos(t.angle);

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', t.angle < -0.1 ? 'end' : t.angle > 0.1 ? 'start' : 'middle')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', t.color)
        .text(t.label);
    });

    // Center Days Readout
    g.append('text')
      .attr('x', 0)
      .attr('y', -radius / 3)
      .attr('text-anchor', 'middle')
      .attr('font-size', compact ? '11px' : '13px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('font-weight', 'bold')
      .attr('fill', sslColor)
      .text(resolvedData.ssl.is_expired ? 'EXPIRED' : `${days} Days Left`);
  }, [resolvedData.ssl, compact]);

  return (
    <div
      id="compliance-risk-d3-gauges"
      className={`rounded-2xl border border-border bg-background p-4 sm:p-5 text-foreground shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-background/25 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-foreground/5 border border-border text-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono tracking-wider text-foreground uppercase">
              D3.js Security Diagnostic Gauges
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Live Spoofing Vulnerability & SSL/TLS Telemetry Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-border bg-accent text-foreground">
            D3 v7.9 Engine
          </span>
          <span
            className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border ${
              resolvedData.risk === 'Low Risk'
                ? 'bg-cream/10 text-emerald-600 border-emerald-500/30'
                : resolvedData.risk === 'Medium Risk'
                ? 'bg-cream/10 text-amber-700 border-amber-500/30'
                : resolvedData.risk === 'High Risk'
                ? 'bg-white/10 text-rose-600 border-rose-500/30'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {resolvedData.risk ?? 'Not measured'}
          </span>
        </div>
      </div>

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Spoofing Risk Gauge Card */}
        <div className="rounded-xl border border-border bg-muted p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              <span>Email Spoofing Risk Level</span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                resolvedData.risk === 'Low Risk'
                  ? 'text-emerald-600 border-emerald-500/30 bg-cream/10'
                  : resolvedData.risk === 'Medium Risk'
                  ? 'text-amber-700 border-amber-500/30 bg-cream/10'
                  : resolvedData.risk === 'High Risk'
                  ? 'text-rose-600 border-rose-500/30 bg-white/10'
                  : 'text-muted-foreground border-border bg-muted'
              }`}
            >
              {resolvedData.risk ?? 'Not measured'}
            </span>
          </div>

          <div className="flex justify-center items-center my-1">
            <svg
              ref={spoofingSvgRef}
              className="w-full max-w-[230px] h-auto overflow-visible select-none"
            />
          </div>

          {/* SPF / DMARC Vector Badges */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                resolvedData.spf === 'Configured'
                  ? 'bg-cream/10 border-emerald-500/30 text-emerald-700'
                  : resolvedData.spf === 'Missing Protection'
                  ? 'bg-white/10 border-rose-500/30 text-rose-700'
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1">
                {resolvedData.spf === 'Configured' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-rose-600" />
                )}
                <span>SPF</span>
              </div>
              <span className="text-[11px] font-semibold">{resolvedData.spf ?? 'Not measured'}</span>
            </div>

            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                resolvedData.dmarc === 'Configured'
                  ? 'bg-cream/10 border-emerald-500/30 text-emerald-700'
                  : resolvedData.dmarc === 'Missing Protection'
                  ? 'bg-white/10 border-rose-500/30 text-rose-700'
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1">
                {resolvedData.dmarc === 'Configured' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-rose-600" />
                )}
                <span>DMARC</span>
              </div>
              <span className="text-[11px] font-semibold">{resolvedData.dmarc ?? 'Not measured'}</span>
            </div>
          </div>
        </div>

        {/* 2. SSL Expiration & TLS Suite Card */}
        <div className="rounded-xl border border-border bg-muted p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Lock className="h-3.5 w-3.5 text-foreground" />
              <span>SSL Expiration & TLS Validity</span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                resolvedData.ssl?.measured
                  ? 'text-foreground border-border bg-muted'
                  : 'text-muted-foreground border-border bg-muted'
              }`}
            >
              {resolvedData.ssl?.measured ? 'Measured' : 'Not measured'}
            </span>
          </div>

          <div className="flex justify-center items-center my-1">
            <svg
              ref={sslSvgRef}
              className="w-full max-w-[230px] h-auto overflow-visible select-none"
            />
          </div>

          {/* SSL Metadata Details */}
          <div className="mt-2 space-y-1.5 text-[11px] font-mono bg-background p-2 rounded-lg border border-background/25">
            <div className="flex items-center justify-between text-foreground">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Key className="h-3 w-3 text-foreground" />
                <span>Cipher:</span>
              </span>
              <span className="text-foreground font-bold truncate max-w-[140px]" title={resolvedData.ssl?.encryption_algorithm ?? undefined}>
                {resolvedData.ssl?.encryption_algorithm ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-foreground">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3 text-emerald-600" />
                <span>Days Remaining:</span>
              </span>
              <span
                className="font-bold text-foreground"
              >
                {resolvedData.ssl?.days_until_expiration != null
                  ? resolvedData.ssl.is_expired
                    ? '0 (Expired)'
                    : `${resolvedData.ssl.days_until_expiration} Days`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RiskSslGaugeChart;
