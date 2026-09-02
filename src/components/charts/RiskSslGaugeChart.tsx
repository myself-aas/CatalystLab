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

  // Extract / resolve data from props or raw output
  const resolvedData = useMemo(() => {
    let risk: SpoofingRiskLevel = spoofingRisk || 'Low Risk';
    let spf: ProtectionStatus = spfStatus || 'Configured';
    let dmarc: ProtectionStatus = dmarcStatus || 'Configured';
    let ssl: SslStatusInfo = sslStatus || {
      is_expired: false,
      days_until_expiration: 84,
      encryption_algorithm: 'TLS_AES_256_GCM_SHA384 (TLSv1.3)',
      validation_alert: 'Secure',
      issuer: "Let's Encrypt / Cloudflare Edge TLS",
      protocol: 'TLSv1.3'
    };

    if (rawOutput) {
      try {
        // Try parsing CATALYST_METRICS block if present
        if (rawOutput.includes('---CATALYST_METRICS---')) {
          const jsonPart = rawOutput.split('---CATALYST_METRICS---')[1]?.trim();
          if (jsonPart) {
            const parsed = JSON.parse(jsonPart);
            if (parsed.spoofing_risk_level) risk = parsed.spoofing_risk_level;
            if (parsed.spf_status) spf = parsed.spf_status;
            if (parsed.dmarc_status) dmarc = parsed.dmarc_status;
            if (parsed.ssl_status) ssl = { ...ssl, ...parsed.ssl_status };
          }
        }
      } catch (e) {
        // Text-based fallback heuristic
      }

      if (!spoofingRisk) {
        if (rawOutput.includes('High Risk') || rawOutput.includes('HIGH RISK') || rawOutput.includes('STATUS: HIGH LIABILITY')) {
          risk = 'High Risk';
        } else if (rawOutput.includes('Medium Risk') || rawOutput.includes('MEDIUM RISK') || rawOutput.includes('STATUS: WARNING')) {
          risk = 'Medium Risk';
        } else {
          risk = 'Low Risk';
        }
      }

      if (!spfStatus) {
        spf = rawOutput.includes('SPF: Missing') || rawOutput.includes('FAIL: Missing SPF') ? 'Missing Protection' : 'Configured';
      }

      if (!dmarcStatus) {
        dmarc = rawOutput.includes('DMARC: Missing') || rawOutput.includes('FAIL: Missing DMARC') ? 'Missing Protection' : 'Configured';
      }

      if (!sslStatus && rawOutput.includes('days_until_expiration')) {
        const match = rawOutput.match(/days_until_expiration["']?:\s*(\d+)/i);
        if (match) {
          const days = parseInt(match[1], 10);
          ssl = {
            ...ssl,
            days_until_expiration: days,
            is_expired: days <= 0,
            validation_alert: days > 30 ? 'Secure' : days > 0 ? 'Warning: Expiring Soon' : 'Critical: Expired/Missing'
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

    // Numerical value for risk: Low = 0.18, Medium = 0.52, High = 0.88
    let riskFraction = 0.18;
    let riskColor = '#10b981'; // Green
    if (resolvedData.risk === 'Medium Risk') {
      riskFraction = 0.52;
      riskColor = '#fbbf24'; // Amber
    } else if (resolvedData.risk === 'High Risk') {
      riskFraction = 0.88;
      riskColor = '#f43f5e'; // Rose
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
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // Segments: Low (0 - 33%), Medium (33% - 66%), High (66% - 100%)
    const segments = [
      { start: minAngle, end: minAngle + (maxAngle - minAngle) * 0.33, color: '#10b981', label: 'LOW' },
      { start: minAngle + (maxAngle - minAngle) * 0.33, end: minAngle + (maxAngle - minAngle) * 0.66, color: '#fbbf24', label: 'MED' },
      { start: minAngle + (maxAngle - minAngle) * 0.66, end: maxAngle, color: '#f43f5e', label: 'HIGH' }
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
      .attr('stroke', '#ffffff')
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
      { angle: minAngle, label: 'Low', color: '#10b981' },
      { angle: 0, label: 'Med', color: '#fbbf24' },
      { angle: maxAngle, label: 'High', color: '#f43f5e' }
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

    // Max scale represents 90 days (standard Let's Encrypt / modern CA cycle)
    const days = Math.max(0, resolvedData.ssl.days_until_expiration);
    const maxDays = 90;
    const dayFraction = Math.min(1, Math.max(0, days / maxDays));

    let sslColor = '#10b981'; // Green
    if (resolvedData.ssl.is_expired || days <= 0) {
      sslColor = '#f43f5e'; // Rose / Expired
    } else if (days <= 30) {
      sslColor = '#fbbf24'; // Amber / Expiring Soon
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
      .attr('stroke', '#cbd5e1')
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
      .attr('fill', '#fbbf24')
      .attr('opacity', 0.2);

    const safeArc = d3
      .arc()
      .innerRadius(radius - (compact ? 11 : 14))
      .outerRadius(radius - 1)
      .startAngle(warningEnd)
      .endAngle(maxAngle);

    g.append('path')
      .attr('d', safeArc as any)
      .attr('fill', '#10b981')
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
      .attr('stroke', '#ffffff')
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
      { angle: minAngle, label: '0d', color: '#f43f5e' },
      { angle: minAngle + (maxAngle - minAngle) * (30 / maxDays), label: '30d', color: '#fbbf24' },
      { angle: maxAngle, label: '90d+', color: '#10b981' }
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
      .text(resolvedData.ssl.is_expired ? 'EXPIRED' : `${resolvedData.ssl.days_until_expiration} Days Left`);
  }, [resolvedData.ssl, compact]);

  return (
    <div
      id="compliance-risk-d3-gauges"
      className={`rounded-2xl border border-border bg-background p-4 sm:p-5 text-foreground shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/25 pb-3 mb-4">
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
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border bg-accent text-foreground">
            D3 v7.9 Engine
          </span>
          <span
            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
              resolvedData.risk === 'Low Risk'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : resolvedData.risk === 'Medium Risk'
                ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
            }`}
          >
            {resolvedData.risk}
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
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                resolvedData.risk === 'Low Risk'
                  ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10'
                  : resolvedData.risk === 'Medium Risk'
                  ? 'text-amber-700 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-600 border-rose-500/30 bg-rose-500/10'
              }`}
            >
              {resolvedData.risk}
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
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700'
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
              <span className="text-[10px] font-semibold">{resolvedData.spf}</span>
            </div>

            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                resolvedData.dmarc === 'Configured'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700'
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
              <span className="text-[10px] font-semibold">{resolvedData.dmarc}</span>
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
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                resolvedData.ssl.validation_alert === 'Secure'
                  ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10'
                  : resolvedData.ssl.validation_alert === 'Warning: Expiring Soon'
                  ? 'text-amber-700 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-600 border-rose-500/30 bg-rose-500/10'
              }`}
            >
              {resolvedData.ssl.validation_alert}
            </span>
          </div>

          <div className="flex justify-center items-center my-1">
            <svg
              ref={sslSvgRef}
              className="w-full max-w-[230px] h-auto overflow-visible select-none"
            />
          </div>

          {/* SSL Metadata Details */}
          <div className="mt-2 space-y-1.5 text-[11px] font-mono bg-background p-2 rounded-lg border border-black/25">
            <div className="flex items-center justify-between text-foreground">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Key className="h-3 w-3 text-foreground" />
                <span>Cipher:</span>
              </span>
              <span className="text-foreground font-bold truncate max-w-[140px]" title={resolvedData.ssl.encryption_algorithm}>
                {resolvedData.ssl.encryption_algorithm}
              </span>
            </div>
            <div className="flex items-center justify-between text-foreground">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3 text-emerald-600" />
                <span>Days Remaining:</span>
              </span>
              <span
                className={`font-bold ${
                  resolvedData.ssl.is_expired
                    ? 'text-rose-600'
                    : resolvedData.ssl.days_until_expiration > 30
                    ? 'text-emerald-600'
                    : 'text-amber-700'
                }`}
              >
                {resolvedData.ssl.is_expired ? '0 (Expired)' : `${resolvedData.ssl.days_until_expiration} Days`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RiskSslGaugeChart;
