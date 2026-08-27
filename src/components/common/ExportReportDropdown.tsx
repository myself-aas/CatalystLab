import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Shield, Code, Table, Printer, ChevronDown, Check } from 'lucide-react';
import type { AuditReport } from '../../types';
import {
  exportReportToPdf,
  exportAuditReportToJson,
  exportAuditReportToSarif,
  exportAuditReportToCycloneDx,
  exportAuditReportToCsv
} from '../../utils/pdfExport';

interface ExportReportDropdownProps {
  report: AuditReport;
  buttonLabel?: string;
  variant?: 'primary' | 'secondary' | 'compact';
  className?: string;
}

export const ExportReportDropdown: React.FC<ExportReportDropdownProps> = ({
  report,
  buttonLabel = 'Export Dossier',
  variant = 'secondary',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'pdf' | 'sarif' | 'cyclonedx' | 'csv' | 'json') => {
    setLastExported(format);
    setTimeout(() => setLastExported(null), 2500);
    setIsOpen(false);

    switch (format) {
      case 'pdf':
        exportReportToPdf('master-telemetry-container', `CatalystLab-Audit-${Date.now()}.pdf`);
        break;
      case 'sarif':
        exportAuditReportToSarif(report);
        break;
      case 'cyclonedx':
        exportAuditReportToCycloneDx(report);
        break;
      case 'csv':
        exportAuditReportToCsv(report);
        break;
      case 'json':
        exportAuditReportToJson(report);
        break;
    }
  };

  const buttonStyle =
    variant === 'primary'
      ? 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/20'
      : variant === 'compact'
      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 py-1.5 px-3 text-xs font-semibold'
      : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 py-2 px-4 text-xs font-semibold';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Export report in multiple compliance and telemetry formats"
        className={`inline-flex items-center gap-2 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${buttonStyle}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{buttonLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
            Export Format Specification
          </div>

          <div className="py-1 space-y-0.5">
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold">Executive PDF Dossier</div>
                  <div className="text-[10px] text-slate-400">Native high-res print stylesheet</div>
                </div>
              </div>
              {lastExported === 'pdf' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => handleExport('sarif')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold">OASIS SARIF v2.1.0</div>
                  <div className="text-[10px] text-slate-400">GitHub & GitLab Code Scanning</div>
                </div>
              </div>
              {lastExported === 'sarif' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => handleExport('cyclonedx')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold">CycloneDX v1.5 SBOM</div>
                  <div className="text-[10px] text-slate-400">Security & dependency standard</div>
                </div>
              </div>
              {lastExported === 'cyclonedx' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Table className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold">Tabular CSV Metrics</div>
                  <div className="text-[10px] text-slate-400">Excel / Google Sheets breakdown</div>
                </div>
              </div>
              {lastExported === 'csv' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Code className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold">Raw Machine JSON</div>
                  <div className="text-[10px] text-slate-400">Complete raw telemetry payload</div>
                </div>
              </div>
              {lastExported === 'json' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
