import type { AuditReport } from '../types';
import { ENGINES_MAP } from '../data/engines';

/**
 * Lazily loads jsPDF library on demand
 */
async function loadJsPDF() {
  const mod = await import('jspdf');
  return mod.default || mod.jsPDF;
}

/**
 * Lazily loads html2canvas library on demand
 */
async function loadHtml2Canvas() {
  const mod = await import('html2canvas');
  return mod.default;
}

/**
 * Safely convert any modern CSS color expression (oklch, oklab, lch, lab, color-mix)
 * to standard sRGB / #hex using a 1x1 canvas context so html2canvas never fails.
 */
function sanitizeColorValues(cssText: string): string {
  if (!cssText || (!cssText.includes('oklch') && !cssText.includes('oklab') && !cssText.includes('color-mix') && !cssText.includes('lch('))) {
    return cssText;
  }

  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;

  try {
    canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    ctx = canvas.getContext('2d');
  } catch (e) { console.error("Ignored error:", e); }

  const resolveColor = (colorExpr: string, fallback: string = '#38bdf8'): string => {
    if (!ctx) return fallback;
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = colorExpr;
      const computed = ctx.fillStyle;
      if (computed && !computed.includes('oklch') && !computed.includes('oklab')) {
        return computed;
      }
    } catch (e) { console.error("Ignored error:", e); }
    return fallback;
  };

  return cssText
    .replace(/oklch\([^)]+\)/gi, (match) => resolveColor(match, '#38bdf8'))
    .replace(/oklab\([^)]+\)/gi, (match) => resolveColor(match, '#38bdf8'))
    .replace(/lch\([^)]+\)/gi, (match) => resolveColor(match, '#38bdf8'))
    .replace(/color-mix\([^)]+\)/gi, (match) => resolveColor(match, '#38bdf8'));
}

/**
 * Sanitizes all stylesheets and inline styles in the cloned document for html2canvas
 */
function sanitizeClonedDocumentStyles(clonedDoc: Document): void {
  try {
    // 1. Sanitize all <style> tags
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent && (styleTag.textContent.includes('oklch') || styleTag.textContent.includes('oklab') || styleTag.textContent.includes('lch('))) {
        styleTag.textContent = sanitizeColorValues(styleTag.textContent);
      }
    });

    // 2. Sanitize all inline styles on all elements
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((node) => {
      const el = node as HTMLElement;
      const inlineStyle = el.getAttribute('style');
      if (inlineStyle && (inlineStyle.includes('oklch') || inlineStyle.includes('oklab') || inlineStyle.includes('lch('))) {
        el.setAttribute('style', sanitizeColorValues(inlineStyle));
      }
    });
  } catch (err) {
    console.warn('[PDF Sanitizer] Style sanitization warning:', err);
  }
}

/**
 * Direct jsPDF programmatic generator fallback if DOM canvas rasterization is blocked
 */
async function generateDirectTextPdf(element: HTMLElement, filename: string): Promise<void> {
  try {
    const JsPdfClass = await loadJsPDF();
    const pdf = new JsPdfClass('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;

    pdf.setFillColor(2, 6, 23); // #020617 dark background
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setTextColor(56, 189, 248); // #38bdf8 cyan
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('CatalystLab Multi-Dimensional Telemetry Dossier', margin, 20);

    pdf.setTextColor(148, 163, 184); // #94a3b8
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toISOString()} • Enterprise Telemetry Audit`, margin, 26);

    pdf.setDrawColor(30, 41, 59); // #1e293b
    pdf.line(margin, 30, pageWidth - margin, 30);

    // Extract text content cleanly
    const rawText = element.innerText || element.textContent || 'No report telemetry content.';
    const lines = pdf.splitTextToSize(rawText, maxLineWidth);

    pdf.setTextColor(248, 250, 252);
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);

    let yPosition = 36;
    const lineHeight = 4.2;

    for (let i = 0; i < lines.length; i++) {
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage();
        pdf.setFillColor(2, 6, 23);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        yPosition = margin;
      }
      pdf.text(lines[i], margin, yPosition);
      yPosition += lineHeight;
    }

    pdf.save(filename);
  } catch (directErr) {
    console.error('[PDF Export] Direct PDF fallback error:', directErr);
    window.print();
  }
}

export async function exportReportToPdf(elementId: string, filename: string = 'CatalystLab-Audit-Report.pdf'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found.`);
  }

  try {
    const html2canvas = await loadHtml2Canvas();
    const JsPdfClass = await loadJsPDF();

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#020617',
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth || 1200,
      windowHeight: element.scrollHeight || 1600,
      onclone: (clonedDoc) => {
        sanitizeClonedDocumentStyles(clonedDoc);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new JsPdfClass('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.warn('[PDF Export] Canvas rasterization failed, using direct PDF document engine:', error);
    await generateDirectTextPdf(element, filename);
  }
}

/**
 * Generate standalone PDF directly from AuditReport data structure using browser canvas
 */
export async function exportAuditReportDataToPdf(report: AuditReport): Promise<void> {
  const meta = ENGINES_MAP[report.engine] || { name: report.engine, icon: 'bolt' };
  const dateStr = report.createdAt ? new Date(report.createdAt).toLocaleString() : new Date().toLocaleString();
  
  let domain = report.url;
  try {
    domain = new URL(report.url.startsWith('http') ? report.url : `https://${report.url}`).hostname;
  } catch (e) { console.error("Ignored error:", e); }

  // Create an off-screen container styled for high-resolution PDF rendering with explicit hex colors
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#020617';
  container.style.color = '#f8fafc';
  container.style.fontFamily = "'JetBrains Mono', 'Courier New', monospace";
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';

  container.innerHTML = `
    <div style="border-bottom: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 24px; background-color: #020617;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 20px; font-weight: bold; color: #f97316;">
          &gt;_ CatalystLab Telemetry Dossier
        </div>
        <div style="font-size: 12px; color: #94a3b8;">
          ID: ${report.id || 'N/A'}
        </div>
      </div>
      <div style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 8px;">
        [${meta.name}] — ${domain}
      </div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
        Target: ${report.url} | Timestamp: ${dateStr}
      </div>
    </div>
    <div style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; font-size: 11px; line-height: 1.5; white-space: pre-wrap; color: #cbd5e1;">
      ${(report.output || 'No output recorded.').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>
    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #1e293b; font-size: 10px; color: #64748b; text-align: center;">
      Verified Telemetry Dossier • Generated by CatalystLab Enterprise Health Engine • https://www.catalystlab.tech
    </div>
  `;

  document.body.appendChild(container);

  const safeDomain = domain.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `CatalystLab-${safeDomain}-${report.engine}.pdf`;

  try {
    const html2canvas = await loadHtml2Canvas();
    const JsPdfClass = await loadJsPDF();

    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#020617',
      useCORS: true,
      onclone: (clonedDoc) => {
        sanitizeClonedDocumentStyles(clonedDoc);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new JsPdfClass('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.warn('[PDF Export] HTML canvas render failed, using direct PDF fallback:', err);
    await generateDirectTextPdf(container, filename);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
