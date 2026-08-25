import type { AuditReport } from '../types';

export async function exportReportToPdf(elementId: string, filename: string = 'CatalystLab-Audit-Report.pdf'): Promise<void> {
  // ponytail: native print dialog, replaces 190 lines of canvas rasterization. 
  window.print();
}

export async function exportAuditReportDataToPdf(report: AuditReport): Promise<void> {
  // ponytail: native print dialog. 
  window.print();
}
