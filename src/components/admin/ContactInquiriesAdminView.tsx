import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  Building2, 
  User, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { getContactInquiriesForAdmin } from '../../lib/firebase';
import type { ContactInquiry } from '../../types';
import { logger } from '../../lib/logger';

export const ContactInquiriesAdminView: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await getContactInquiriesForAdmin();
      setInquiries(data);
    } catch (err) {
      logger.error('Failed to load contact inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ['ID', 'Email', 'Name', 'Company', 'Source', 'Message', 'CreatedAt'];
    const rows = inquiries.map(item => [
      `"${item.id || ''}"`,
      `"${item.email}"`,
      `"${item.name || ''}"`,
      `"${item.company || ''}"`,
      `"${item.source || ''}"`,
      `"${(item.message || '').replace(/"/g, '""')}"`,
      `"${new Date(item.createdAt).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalystlab_inquiries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInquiries = inquiries.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.email.toLowerCase().includes(q) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.company && item.company.toLowerCase().includes(q)) ||
      (item.message && item.message.toLowerCase().includes(q)) ||
      (item.source && item.source.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#415a77]" />
            <span>Captured Email Leads &amp; Inquiries</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Collected via the Get in Touch section and Email Capture pop-up modal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={fetchInquiries}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-mono font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            disabled={inquiries.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-[#0b192c] text-white px-3.5 py-2 text-xs font-mono font-bold hover:bg-[#162a45] transition-all disabled:opacity-50 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-mono font-semibold text-gray-500 uppercase">Total Captured</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{inquiries.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-mono font-semibold text-gray-500 uppercase">Latest 24 Hours</div>
          <div className="text-2xl font-black text-[#415a77] mt-1">
            {inquiries.filter(i => Date.now() - i.createdAt < 24 * 60 * 60 * 1000).length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-mono font-semibold text-gray-500 uppercase">Storage Status</div>
          <div className="flex items-center gap-1.5 mt-1 text-sm font-bold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Firestore Synchronized</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by email, company, name, or keywords..."
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-xs font-mono text-gray-900 placeholder-gray-400 focus:border-[#415a77] focus:outline-none focus:ring-1 focus:ring-[#415a77]/30 transition-all shadow-xs"
        />
      </div>

      {/* Inquiries Table / List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500 font-mono text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#415a77]" />
            <span>Fetching submissions from database...</span>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-16 text-center text-gray-500 font-mono text-xs space-y-2">
            <Inbox className="h-8 w-8 mx-auto text-gray-300" />
            <div className="text-sm font-semibold text-gray-700">No contact inquiries found</div>
            <p className="text-gray-400 max-w-sm mx-auto">
              New submissions via the Get in Touch section and pop-up modal will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInquiries.map((item) => (
              <div key={item.id || item.createdAt} className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-gray-900">{item.email}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.email, item.id || String(item.createdAt))}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      title="Copy email"
                    >
                      {copiedId === (item.id || String(item.createdAt)) ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {item.source && (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-mono text-gray-600 border border-gray-200">
                        {item.source}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Optional Metadata Row */}
                {(item.name || item.company) && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    {item.name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{item.name}</span>
                      </span>
                    )}
                    {item.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span>{item.company}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Message Content */}
                {item.message && (
                  <div className="mt-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-xs text-gray-700 leading-relaxed font-sans">
                    {item.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInquiriesAdminView;
