// ============================================================
// Catalyst Score – Frontend Logic & Telemetry Engine
// ============================================================

const RECENT_AUDITS_KEY = 'catalyst_recent_audits';

// Helper: Fetch wrapper with error handling
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

// ============================================================
// LocalStorage: Recent Audits Management
// ============================================================
function getRecentAudits() {
  try {
    const raw = localStorage.getItem(RECENT_AUDITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read recent audits from localStorage', e);
    return [];
  }
}

function saveRecentAudit(report) {
  if (!report || !report.url) return;
  try {
    let audits = getRecentAudits();
    // Remove existing entry for the same URL or ID if present
    audits = audits.filter((a) => a.url !== report.url && a.id !== report.id);
    
    // Add new audit entry at the beginning
    const entry = {
      id: report.id || Math.random().toString(36).substring(2, 10),
      url: report.url,
      final_url: report.final_url || report.url,
      overall_score: report.overall_score,
      grade: report.grade,
      timestamp: report.timestamp || new Date().toISOString(),
      fullReport: report
    };

    audits.unshift(entry);
    // Keep max 25 audits
    if (audits.length > 25) audits = audits.slice(0, 25);

    localStorage.setItem(RECENT_AUDITS_KEY, JSON.stringify(audits));
  } catch (e) {
    console.error('Failed to save recent audit to localStorage', e);
  }
}

function deleteRecentAudit(id) {
  try {
    let audits = getRecentAudits();
    audits = audits.filter((a) => a.id !== id);
    localStorage.setItem(RECENT_AUDITS_KEY, JSON.stringify(audits));
    renderRecentAudits();
    if (window.refreshRecentDomainsDropdown) {
      window.refreshRecentDomainsDropdown();
    }
  } catch (e) {
    console.error('Failed to delete recent audit', e);
  }
}

function clearRecentAudits() {
  if (confirm('Are you sure you want to clear all recent audits history?')) {
    localStorage.removeItem(RECENT_AUDITS_KEY);
    renderRecentAudits();
    if (window.refreshRecentDomainsDropdown) {
      window.refreshRecentDomainsDropdown();
    }
  }
}

function renderRecentAudits() {
  const container = document.getElementById('recentAuditsList');
  const clearBtn = document.getElementById('clearHistoryBtn');
  const section = document.getElementById('recentAuditsSection');
  if (!container) return;

  const audits = getRecentAudits();

  if (!audits || audits.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 2rem 1rem; text-align: center; background: #ffffff; border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
        <p style="color: var(--text-muted); font-size: 0.95rem;">No recent audits in local storage yet. Enter a website URL above to generate your first health intelligence report.</p>
      </div>
    `;
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  if (clearBtn) clearBtn.style.display = 'inline-block';

  container.innerHTML = audits.map((audit) => {
    const formattedDate = formatTimestamp(audit.timestamp);
    const gradeClass = `grade-${audit.grade}`;
    const scoreColorClass = audit.overall_score >= 90 ? 'score-good' : (audit.overall_score >= 70 ? 'score-warn' : 'score-bad');

    let displayHost = audit.url;
    try {
      displayHost = new URL(audit.url).hostname.replace(/^www\./i, '');
    } catch {}

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(displayHost)}&sz=32`;

    return `
      <div class="recent-audit-card">
        <div class="recent-card-top">
          <div style="display:flex; align-items:center; gap:0.5rem; min-width:0; flex:1;">
            <img src="${faviconUrl}" alt="" style="width:20px; height:20px; border-radius:4px; flex-shrink:0;" onerror="this.style.display='none'">
            <a href="#" class="recent-card-url" data-id="${escapeHtml(audit.id)}" title="${escapeHtml(audit.url)}">${escapeHtml(displayHost)}</a>
          </div>
          <div class="recent-card-score">
            <span class="recent-score-pill ${scoreColorClass}">${audit.overall_score}</span>
            <span class="grade ${gradeClass}" style="font-size:0.8rem; padding:0.15rem 0.5rem;">${audit.grade}</span>
          </div>
        </div>
        <div class="recent-card-date">🕒 ${formattedDate}</div>
        <div class="recent-card-actions">
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary btn-sm btn-view-report" data-id="${escapeHtml(audit.id)}">View Report</button>
            <a href="/compare.html?urlA=${encodeURIComponent(audit.url)}" class="btn btn-secondary btn-sm">VS Compare</a>
          </div>
          <button class="btn-icon btn-delete-audit" data-id="${escapeHtml(audit.id)}" title="Delete from history">🗑️</button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event handlers
  container.querySelectorAll('.btn-view-report, .recent-card-url').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = el.getAttribute('data-id');
      const audit = audits.find((a) => a.id === id);
      if (audit && audit.fullReport) {
        sessionStorage.setItem('catalystReport', JSON.stringify(audit.fullReport));
        window.location.href = '/reports/' + id;
      } else if (audit) {
        window.location.href = `/reports/${id}`;
      }
    });
  });

  container.querySelectorAll('.btn-delete-audit').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-id');
      deleteRecentAudit(id);
    });
  });
}

// ============================================================
// Autocomplete: Recent Domains Suggestions Engine
// ============================================================
function initRecentDomainsAutocomplete() {
  const urlInput = document.getElementById('urlInput');
  const dropdown = document.getElementById('recentDomainsDropdown');
  const clearBtn = document.getElementById('clearUrlInputBtn');
  if (!urlInput || !dropdown) return;

  let activeIndex = -1;
  let currentMatches = [];

  function parseUrlDetails(rawUrl) {
    try {
      let formatted = rawUrl.trim();
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = 'https://' + formatted;
      }
      const parsed = new URL(formatted);
      const host = parsed.hostname.replace(/^www\./i, '');
      const path = parsed.pathname !== '/' ? parsed.pathname : '';
      return {
        host: host || rawUrl,
        fullDisplay: host + path,
        url: rawUrl,
        origin: parsed.origin
      };
    } catch {
      return {
        host: rawUrl,
        fullDisplay: rawUrl,
        url: rawUrl,
        origin: ''
      };
    }
  }

  function getFormattedRecentList() {
    const rawAudits = getRecentAudits();
    const seen = new Set();
    const results = [];

    // Fallback sample domains for first-time onboarding
    const sampleDomains = [
      { url: 'https://stripe.com', host: 'stripe.com', overall_score: 96, grade: 'A', isSample: true },
      { url: 'https://github.com', host: 'github.com', overall_score: 91, grade: 'A', isSample: true },
      { url: 'https://apple.com', host: 'apple.com', overall_score: 88, grade: 'B', isSample: true },
      { url: 'https://wikipedia.org', host: 'wikipedia.org', overall_score: 84, grade: 'B', isSample: true }
    ];

    for (const audit of rawAudits) {
      if (!audit || !audit.url) continue;
      const details = parseUrlDetails(audit.url);
      const key = details.fullDisplay.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: audit.id,
          url: audit.url,
          host: details.host,
          fullDisplay: details.fullDisplay,
          overall_score: audit.overall_score,
          grade: audit.grade,
          timestamp: audit.timestamp,
          isSample: false
        });
      }
    }

    if (results.length === 0) {
      return sampleDomains.map((s) => ({
        id: null,
        url: s.url,
        host: s.host,
        fullDisplay: s.host,
        overall_score: s.overall_score,
        grade: s.grade,
        timestamp: null,
        isSample: true
      }));
    }

    return results;
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="domain-match-hl">$1</mark>');
  }

  function formatRelativeTime(isoString) {
    if (!isoString) return '';
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now - past;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;
      return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  function renderDropdown(query = '') {
    const trimmedQuery = query.trim().toLowerCase();
    const allDomains = getFormattedRecentList();
    const hasHistory = allDomains.some((d) => !d.isSample);

    if (trimmedQuery) {
      currentMatches = allDomains.filter(
        (d) =>
          d.fullDisplay.toLowerCase().includes(trimmedQuery) ||
          d.url.toLowerCase().includes(trimmedQuery)
      );
    } else {
      currentMatches = allDomains.slice(0, 8);
    }

    if (clearBtn) {
      clearBtn.style.display = urlInput.value ? 'flex' : 'none';
    }

    if (currentMatches.length === 0) {
      dropdown.innerHTML = `
        <div class="dropdown-header">
          <div class="dropdown-header-left">
            <span>🔍 Recent History</span>
            <span class="dropdown-badge">0 found</span>
          </div>
        </div>
        <div class="dropdown-empty">
          <div class="dropdown-empty-icon">🌐</div>
          <div>No saved audits match "<strong>${escapeHtml(query)}</strong>"</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.35rem;">Press <kbd>Enter</kbd> or click <em>Analyze Health</em> to run a new audit.</div>
        </div>
      `;
      dropdown.style.display = 'flex';
      urlInput.setAttribute('aria-expanded', 'true');
      return;
    }

    const headerTitle = trimmedQuery
      ? 'Matching Domains'
      : hasHistory
      ? 'Recent Domains from Storage'
      : 'Recommended Starter Domains';
    const badgeText = `${currentMatches.length} ${currentMatches.length === 1 ? 'domain' : 'domains'}`;

    let html = `
      <div class="dropdown-header">
        <div class="dropdown-header-left">
          <span>🕒 ${headerTitle}</span>
          <span class="dropdown-badge">${badgeText}</span>
        </div>
        ${hasHistory ? '<button type="button" class="dropdown-clear-btn" id="dropdownClearAllBtn" title="Clear all recent history">Clear History</button>' : ''}
      </div>
      <ul class="dropdown-list" role="listbox">
    `;

    currentMatches.forEach((item, index) => {
      const score = item.overall_score !== undefined ? item.overall_score : null;
      let scoreColorClass = 'score-good';
      if (score !== null && score < 70) scoreColorClass = 'score-bad';
      else if (score !== null && score < 90) scoreColorClass = 'score-warn';

      const highlightedDisplay = highlightMatch(item.fullDisplay, trimmedQuery);
      const relativeTime = formatRelativeTime(item.timestamp);
      const isActive = index === activeIndex;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.host)}&sz=32`;

      html += `
        <li 
          class="dropdown-item ${isActive ? 'active' : ''}" 
          data-index="${index}" 
          data-url="${escapeHtml(item.url)}"
          role="option"
          aria-selected="${isActive}"
          id="recent-domain-opt-${index}"
        >
          <div class="dropdown-item-main">
            <img 
              src="${faviconUrl}" 
              alt="" 
              class="dropdown-favicon"
              onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-flex';"
            >
            <span class="dropdown-favicon" style="display:none;">🌐</span>
            
            <div class="dropdown-text-group">
              <div class="dropdown-domain">${highlightedDisplay}</div>
              <div class="dropdown-meta">
                <span>${escapeHtml(item.url)}</span>
                ${relativeTime ? `<span>• ${relativeTime}</span>` : ''}
                ${item.isSample ? '<span style="color:var(--primary); font-weight:700;">• Sample</span>' : ''}
              </div>
            </div>
          </div>

          <div class="dropdown-item-actions">
            ${score !== null ? `
              <span class="dropdown-score-pill ${scoreColorClass}">
                <strong>${score}</strong>
                ${item.grade ? `<span class="dropdown-grade-pill grade-${item.grade}">${item.grade}</span>` : ''}
              </span>
            ` : ''}
            <span class="dropdown-select-hint">Select ↵</span>
            ${!item.isSample && item.id ? `
              <button 
                type="button" 
                class="dropdown-delete-btn" 
                data-delete-id="${escapeHtml(item.id)}" 
                title="Remove from history"
                aria-label="Remove ${escapeHtml(item.host)} from history"
              >✕</button>
            ` : ''}
          </div>
        </li>
      `;
    });

    html += `
      </ul>
      <div class="dropdown-footer">
        <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
        <span><kbd>↵</kbd> Select</span>
        <span><kbd>Esc</kbd> Dismiss</span>
      </div>
    `;

    dropdown.innerHTML = html;
    dropdown.style.display = 'flex';
    urlInput.setAttribute('aria-expanded', 'true');

    // Attach clear history listener
    const clearAllBtn = dropdown.querySelector('#dropdownClearAllBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearRecentAudits();
        renderDropdown(urlInput.value);
      });
    }

    // Attach individual delete listeners
    dropdown.querySelectorAll('.dropdown-delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idToDelete = btn.getAttribute('data-delete-id');
        if (idToDelete) {
          deleteRecentAudit(idToDelete);
          renderDropdown(urlInput.value);
        }
      });
    });

    // Attach item selection listeners
    dropdown.querySelectorAll('.dropdown-item').forEach((itemEl) => {
      itemEl.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown-delete-btn')) return;
        const selectedUrl = itemEl.getAttribute('data-url');
        selectDomain(selectedUrl);
      });
    });
  }

  function selectDomain(url) {
    if (!url) return;
    urlInput.value = url;
    closeDropdown();
    if (clearBtn) clearBtn.style.display = 'flex';
    urlInput.focus();
  }

  function openDropdown() {
    activeIndex = -1;
    renderDropdown(urlInput.value);
  }

  function closeDropdown() {
    dropdown.style.display = 'none';
    urlInput.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  function updateActiveOption() {
    const items = dropdown.querySelectorAll('.dropdown-item');
    items.forEach((el, idx) => {
      if (idx === activeIndex) {
        el.classList.add('active');
        el.setAttribute('aria-selected', 'true');
        el.scrollIntoView({ block: 'nearest' });
        urlInput.setAttribute('aria-activedescendant', el.id);
      } else {
        el.classList.remove('active');
        el.setAttribute('aria-selected', 'false');
      }
    });
  }

  // --- Event Listeners ---
  urlInput.addEventListener('input', () => {
    activeIndex = -1;
    renderDropdown(urlInput.value);
  });

  urlInput.addEventListener('focus', () => {
    openDropdown();
  });

  urlInput.addEventListener('click', () => {
    if (dropdown.style.display === 'none') {
      openDropdown();
    }
  });

  urlInput.addEventListener('keydown', (e) => {
    if (dropdown.style.display === 'none') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        openDropdown();
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentMatches.length > 0) {
        activeIndex = (activeIndex + 1) % currentMatches.length;
        updateActiveOption();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentMatches.length > 0) {
        activeIndex = (activeIndex - 1 + currentMatches.length) % currentMatches.length;
        updateActiveOption();
      }
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < currentMatches.length) {
        e.preventDefault();
        const selected = currentMatches[activeIndex];
        selectDomain(selected.url);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    } else if (e.key === 'Tab') {
      closeDropdown();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      clearBtn.style.display = 'none';
      urlInput.focus();
      renderDropdown('');
    });
  }

  document.addEventListener('click', (e) => {
    if (
      !urlInput.contains(e.target) &&
      !dropdown.contains(e.target) &&
      (!clearBtn || !clearBtn.contains(e.target))
    ) {
      closeDropdown();
    }
  });

  window.refreshRecentDomainsDropdown = function () {
    if (dropdown.style.display !== 'none') {
      renderDropdown(urlInput.value);
    }
  };
}

// ============================================================
// Granular Audit Progress & Real-Time Telemetry Controller
// ============================================================
const AUDIT_DIMENSIONS_CONFIG = [
  { key: 'seo', name: 'SEO Architecture', icon: '🔍', desc: 'Title, meta, headings & crawler indexability' },
  { key: 'security', name: 'Security & SecOps', icon: '🛡️', desc: 'HTTPS, HSTS, CSP, X-Frame & TLS security' },
  { key: 'performance', name: 'Performance & Vitals', icon: '⚡', desc: 'Core Web Vitals, LCP, CLS & load timing' },
  { key: 'mobile', name: 'Mobile & Touch', icon: '📱', desc: 'Viewport meta, touch targets & responsiveness' },
  { key: 'accessibility', name: 'Accessibility (WCAG)', icon: '♿', desc: 'Alt text, ARIA landmarks, contrast & labels' },
  { key: 'social', name: 'Social Graph & OG', icon: '🌐', desc: 'Open Graph, Twitter cards & preview metadata' },
  { key: 'ethical', name: 'Digital Ethics & Green', icon: '🌱', desc: 'Carbon footprint, sustainability & trackers' },
  { key: 'web_standards', name: 'Web Standards & HTML5', icon: '📐', desc: 'HTML5 DOCTYPE, DOM tree depth & validity' },
  { key: 'ai_readiness', name: 'AI & LLM Readiness', icon: '🤖', desc: 'llms.txt, MCP agent endpoints & schemas' },
  { key: 'ux_ecosystem', name: 'UX & Ecosystem', icon: '✨', desc: 'PWA manifest, modern stack & resource hints' }
];

class GranularProgressController {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('loading');
    this.titleEl = options.titleEl || document.getElementById('progressStatusTitle');
    this.subEl = options.subEl || document.getElementById('progressStatusSub');
    this.elapsedEl = options.elapsedEl || document.getElementById('progressElapsedTime');
    this.percentEl = options.percentEl || document.getElementById('progressPercentText');
    this.progressBarFill = options.progressBarFill || document.getElementById('auditProgressBarFill');
    this.gridEl = options.gridEl || document.getElementById('dimensionProgressGrid');
    this.logEl = options.logEl || document.getElementById('telemetryLogText');
    this.prefix = options.idPrefix || 'dimCard_';
    
    this.startTime = 0;
    this.timerInterval = null;
    this.currentPercent = 0;
    this.completedCount = 0;
    this.totalCount = 10;
  }

  initGrid() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';

    AUDIT_DIMENSIONS_CONFIG.forEach((dim) => {
      const card = document.createElement('div');
      card.id = `${this.prefix}${dim.key}`;
      card.className = 'dimension-progress-card state-pending';
      card.innerHTML = `
        <div class="dim-card-left">
          <span class="dim-card-icon" aria-hidden="true">${dim.icon}</span>
          <div class="dim-card-text">
            <span class="dim-card-title">${dim.name}</span>
            <span class="dim-card-desc">${dim.desc}</span>
          </div>
        </div>
        <div class="dim-card-status">
          <span class="dim-status-pill pill-pending">○ Queued</span>
        </div>
      `;
      this.gridEl.appendChild(card);
    });
  }

  start(targetUrl) {
    if (this.container) this.container.style.display = 'flex';
    this.initGrid();
    this.startTime = Date.now();
    this.currentPercent = 4;
    this.completedCount = 0;
    this.updateProgress(4, `Auditing ${targetUrl}…`, 'Evaluating 10 core health dimensions in real-time');
    this.log(`Initiated telemetry audit connection for ${targetUrl}`);

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.elapsedEl) {
        const elapsedSec = ((Date.now() - this.startTime) / 1000).toFixed(1);
        this.elapsedEl.textContent = `${elapsedSec}s`;
      }
    }, 100);
  }

  setDimensionActive(key, customMessage) {
    const card = document.getElementById(`${this.prefix}${key}`);
    const dim = AUDIT_DIMENSIONS_CONFIG.find((d) => d.key === key);
    if (card && !card.classList.contains('state-completed')) {
      card.className = 'dimension-progress-card state-active';
      const statusEl = card.querySelector('.dim-card-status');
      if (statusEl) {
        statusEl.innerHTML = `<span class="dim-status-pill pill-active">● Scanning...</span>`;
      }
    }
    if (dim) {
      this.log(customMessage || `Scanning ${dim.name}...`);
      if (this.subEl) this.subEl.textContent = `Evaluating ${dim.name} (${dim.desc})`;
    }
  }

  setDimensionComplete(key, score, status, detail) {
    const card = document.getElementById(`${this.prefix}${key}`);
    const dim = AUDIT_DIMENSIONS_CONFIG.find((d) => d.key === key);
    this.completedCount = Math.min(10, this.completedCount + 1);

    if (card) {
      card.className = 'dimension-progress-card state-completed';
      const statusEl = card.querySelector('.dim-card-status');
      if (statusEl) {
        const numericScore = typeof score === 'number' ? Math.round(score) : (score || 0);
        const pillClass = numericScore >= 90 ? 'pill-pass' : (numericScore >= 70 ? 'pill-warn' : 'pill-fail');
        const badgeIcon = numericScore >= 90 ? '✓' : (numericScore >= 70 ? '▲' : '✕');
        statusEl.innerHTML = `<span class="dim-status-pill ${pillClass}">${badgeIcon} ${numericScore}/100</span>`;
      }
      if (detail) {
        const descEl = card.querySelector('.dim-card-desc');
        if (descEl) descEl.textContent = detail;
      }
    }

    const newPercent = Math.min(96, Math.round(10 + (this.completedCount / 10) * 85));
    const titleMsg = `Audited ${this.completedCount}/10 Dimensions (${dim ? dim.name : key} complete)`;
    this.updateProgress(newPercent, titleMsg, `${10 - this.completedCount} dimensions remaining…`);
    this.log(`[PASS ${score}/100] ${dim ? dim.name : key}: ${detail || 'Dimension verified'}`);
  }

  updateProgress(percent, title, sub) {
    this.currentPercent = Math.max(this.currentPercent, percent);
    if (this.progressBarFill) {
      this.progressBarFill.style.width = `${this.currentPercent}%`;
    }
    if (this.percentEl) {
      this.percentEl.textContent = `${this.currentPercent}%`;
    }
    if (this.titleEl && title) {
      this.titleEl.textContent = title;
    }
    if (this.subEl && sub) {
      this.subEl.textContent = sub;
    }
  }

  log(msg) {
    if (this.logEl) {
      this.logEl.textContent = msg;
    }
  }

  finish(report) {
    this.updateProgress(100, 'Audit Complete!', 'Compiling 10-dimension health radar benchmarks…');
    this.log(`All 10 dimensions finalized — Overall Score: ${report.overall_score}/100 (Grade ${report.grade})`);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

async function executeAuditWithLiveStream(targetUrl, progressController) {
  progressController.start(targetUrl);

  return new Promise((resolve, reject) => {
    let resolved = false;
    let sse = null;
    let fallbackTimer = null;

    const fallbackToStandardFetch = async () => {
      if (resolved) return;
      if (sse) {
        try { sse.close(); } catch(e) {}
        sse = null;
      }

      try {
        let simIdx = 0;
        const simInterval = setInterval(() => {
          if (resolved || simIdx >= AUDIT_DIMENSIONS_CONFIG.length) {
            clearInterval(simInterval);
            return;
          }
          const currentDim = AUDIT_DIMENSIONS_CONFIG[simIdx];
          progressController.setDimensionActive(currentDim.key);
          simIdx++;
        }, 800);

        const report = await fetchJSON('/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ url: targetUrl })
        });

        clearInterval(simInterval);
        if (!resolved) {
          resolved = true;
          Object.keys(report.categories || {}).forEach((catKey) => {
            const cat = report.categories[catKey];
            progressController.setDimensionComplete(catKey, cat.score, 'pass', `${cat.issues?.length || 0} checks evaluated`);
          });
          progressController.finish(report);
          resolve(report);
        }
      } catch (err) {
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      }
    };

    if (typeof EventSource !== 'undefined') {
      try {
        const streamUrl = `/api/analyze-stream?url=${encodeURIComponent(targetUrl)}`;
        sse = new EventSource(streamUrl);

        // Safety fallback if SSE doesn't respond within 4s
        fallbackTimer = setTimeout(() => {
          if (!resolved && progressController.completedCount === 0) {
            console.log('SSE connection slow/quiet, initiating parallel fetch fallback');
            fallbackToStandardFetch();
          }
        }, 4000);

        sse.onmessage = (event) => {
          if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
          }

          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
              progressController.updateProgress(data.percent || 5, 'Connecting to Diagnostic Engine…', data.message);
              progressController.log(data.message);
            } else if (data.type === 'step_start' || data.type === 'step_complete') {
              progressController.updateProgress(data.percent || 10, 'Fetching Web Assets…', data.message);
              progressController.log(data.message);
            } else if (data.type === 'dimension_start') {
              progressController.setDimensionActive(data.dimension, data.message);
            } else if (data.type === 'dimension_complete') {
              progressController.setDimensionComplete(data.dimension, data.score, data.status, data.detail);
            } else if (data.type === 'cached_hit') {
              progressController.log(data.message);
              if (!resolved) {
                resolved = true;
                sse.close();
                Object.keys(data.report.categories || {}).forEach((catKey) => {
                  const cat = data.report.categories[catKey];
                  progressController.setDimensionComplete(catKey, cat.score, 'pass', `${cat.issues?.length || 0} checks evaluated`);
                });
                progressController.finish(data.report);
                resolve(data.report);
              }
            } else if (data.type === 'complete') {
              if (!resolved) {
                resolved = true;
                sse.close();
                progressController.finish(data.report);
                resolve(data.report);
              }
            } else if (data.type === 'error') {
              if (!resolved) {
                resolved = true;
                sse.close();
                reject(new Error(data.error || 'Audit stream error'));
              }
            }
          } catch (e) {
            console.warn('Error parsing SSE event:', e);
          }
        };

        sse.onerror = (err) => {
          console.warn('SSE stream error, transitioning to standard fetch:', err);
          fallbackToStandardFetch();
        };
      } catch (e) {
        fallbackToStandardFetch();
      }
    } else {
      fallbackToStandardFetch();
    }
  });
}

// ============================================================
// Homepage (index.html) – Handle form submission & load history
// ============================================================
const analyzeForm = document.getElementById('analyzeForm');
if (analyzeForm) {
  // Initialize recent domains autocomplete dropdown
  initRecentDomainsAutocomplete();

  // Render history on home page
  renderRecentAudits();

  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearRecentAudits);
  }

  // Instantiate Granular Progress Controller for Homepage
  const homeProgress = new GranularProgressController({
    container: document.getElementById('loading'),
    titleEl: document.getElementById('progressStatusTitle'),
    subEl: document.getElementById('progressStatusSub'),
    elapsedEl: document.getElementById('progressElapsedTime'),
    percentEl: document.getElementById('progressPercentText'),
    progressBarFill: document.getElementById('auditProgressBarFill'),
    gridEl: document.getElementById('dimensionProgressGrid'),
    logEl: document.getElementById('telemetryLogText'),
    idPrefix: 'dimCard_'
  });

  if (analyzeForm) analyzeForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const urlInput = document.getElementById('urlInput');
    const errorDiv = document.getElementById('error');
    const submitBtn = document.getElementById('analyzeBtn');

    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
      errorDiv.textContent = 'Please enter a valid website URL.';
      errorDiv.style.display = 'block';
      return;
    }

    let urlToAnalyze = rawUrl;
    if (!/^https?:\/\//i.test(urlToAnalyze)) {
      urlToAnalyze = 'https://' + urlToAnalyze;
    }

    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Auditing…';

    try {
      const report = await executeAuditWithLiveStream(urlToAnalyze, homeProgress);

      // Save to localStorage recent history
      saveRecentAudit(report);
      // Store report in sessionStorage for the report page
      sessionStorage.setItem('catalystReport', JSON.stringify(report));

      // Brief delay to appreciate the complete 100% state before navigation
      setTimeout(() => {
        window.location.href = '/reports/' + report.id;
      }, 500);
    } catch (error) {
      homeProgress.stop();
      errorDiv.textContent = 'Error: ' + error.message;
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Analyze Health';
    }
  });
}

// ============================================================
// Report Page (report.html) – Filter, Radar Chart & PDF Export
// ============================================================
const ALL_CATEGORY_KEYS = [
  'seo', 'security', 'performance', 'mobile', 'accessibility',
  'social', 'ethical', 'web_standards', 'ai_readiness', 'ux_ecosystem'
];
let currentReportData = null;
let currentRadarChart = null;
let activeCategories = new Set(ALL_CATEGORY_KEYS);
let activeStatusFilter = 'all';
let activeSearchQuery = '';

document.addEventListener('DOMContentLoaded', async function () {
  const reportContent = document.getElementById('reportContent');
  if (!reportContent) return; // Not on report page

  let report = null;

  const pathParts = window.location.pathname.split('/');
  let pathReportId = null;
  if (pathParts[1] === 'reports' && pathParts[2] && pathParts[3]) {
    pathReportId = `${pathParts[2]}/${pathParts[3]}`;
  } else {
    const params = new URLSearchParams(window.location.search);
    pathReportId = params.get('id');
  }

  // 1. Try sessionStorage first
  const stored = sessionStorage.getItem('catalystReport');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Only use sessionStorage if the ID matches the URL, or if we don't have a URL ID
      if (!pathReportId || parsed.id === pathReportId) {
        report = parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored report', e);
    }
  }

  // 2. If not in sessionStorage, check path or query parameter
  if (!report && pathReportId) {
    try {
      report = await fetchJSON(`/api/report?id=${encodeURIComponent(pathReportId)}`);
    } catch (error) {
      reportContent.innerHTML = `<div class="error-box">Failed to load report: ${escapeHtml(error.message)}</div>`;
      return;
    }
  }

  // 3. If still no report, prompt user
  if (!report) {
    reportContent.innerHTML = `
      <div class="empty-state">
        <p style="font-size:1.1rem; margin-bottom:1rem;">No audit data found for this session.</p>
        <a href="index.html" class="btn btn-primary">Run a Website Audit</a>
      </div>
    `;
    return;
  }

  currentReportData = report;
  saveRecentAudit(report);
  renderReport(report);
  setupReportFilters();
  setupReportActions(report);
});

// Setup Filter & Toggle Controls
function setupReportFilters() {
  const catCheckboxes = document.querySelectorAll('.cat-checkbox-input');
  const selectedCatCount = document.getElementById('selectedCatCount');

  function updateCatCountLabel() {
    if (selectedCatCount) {
      selectedCatCount.textContent = `${activeCategories.size} of ${ALL_CATEGORY_KEYS.length} visible`;
    }
  }

  catCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const catVal = checkbox.value;
      const parentCard = checkbox.closest('.cat-toggle-card');
      if (checkbox.checked) {
        activeCategories.add(catVal);
        if (parentCard) parentCard.classList.add('active');
      } else {
        activeCategories.delete(catVal);
        if (parentCard) parentCard.classList.remove('active');
      }
      updateCatCountLabel();
      applyReportFilters();
    });
  });

  const selectAllCatsBtn = document.getElementById('selectAllCatsBtn');
  if (selectAllCatsBtn) {
    selectAllCatsBtn.addEventListener('click', () => {
      catCheckboxes.forEach((cb) => {
        cb.checked = true;
        activeCategories.add(cb.value);
        const parent = cb.closest('.cat-toggle-card');
        if (parent) parent.classList.add('active');
      });
      updateCatCountLabel();
      applyReportFilters();
    });
  }

  const deselectAllCatsBtn = document.getElementById('deselectAllCatsBtn');
  if (deselectAllCatsBtn) {
    deselectAllCatsBtn.addEventListener('click', () => {
      catCheckboxes.forEach((cb) => {
        cb.checked = false;
        activeCategories.delete(cb.value);
        const parent = cb.closest('.cat-toggle-card');
        if (parent) parent.classList.remove('active');
      });
      updateCatCountLabel();
      applyReportFilters();
    });
  }

  const statusPills = document.querySelectorAll('#statusFilterPills .filter-pill');
  statusPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      statusPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activeStatusFilter = pill.getAttribute('data-status');
      applyReportFilters();
    });
  });

  const searchInput = document.getElementById('findingSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value.trim().toLowerCase();
      applyReportFilters();
    });
  }

  const expandAllBtn = document.getElementById('expandAllBtn');
  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      document.querySelectorAll('#categories details.detailed-card').forEach((d) => (d.open = true));
    });
  }

  const collapseAllBtn = document.getElementById('collapseAllBtn');
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      document.querySelectorAll('#categories details.detailed-card').forEach((d) => (d.open = false));
    });
  }

  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      activeCategories = new Set(ALL_CATEGORY_KEYS);
      catCheckboxes.forEach((cb) => {
        cb.checked = true;
        const parent = cb.closest('.cat-toggle-card');
        if (parent) parent.classList.add('active');
      });
      activeStatusFilter = 'all';
      activeSearchQuery = '';
      if (searchInput) searchInput.value = '';
      updateCatCountLabel();

      statusPills.forEach((p) => p.classList.toggle('active', p.getAttribute('data-status') === 'all'));

      applyReportFilters();
    });
  }
}

// Render Report Main Visuals
function renderReport(report) {
  const reportUrlEl = document.getElementById('reportUrl');
  const reportDateEl = document.getElementById('reportDate');
  const reportStatusEl = document.getElementById('reportStatus');
  const overallScoreEl = document.getElementById('overallScore');
  const gradeEl = document.getElementById('grade');

  if (reportUrlEl) reportUrlEl.textContent = report.url;
  if (reportDateEl) reportDateEl.textContent = formatTimestamp(report.timestamp || new Date().toISOString());
  if (reportStatusEl) reportStatusEl.textContent = `${report.status_code || 200} OK`;
  if (overallScoreEl) overallScoreEl.textContent = report.overall_score;
  
  if (gradeEl) {
    gradeEl.textContent = `Grade ${report.grade}`;
    gradeEl.className = 'grade';
    const gradeClass = `grade-${report.grade}`;
    if (['A', 'B', 'C', 'D', 'F'].includes(report.grade)) {
      gradeEl.classList.add(gradeClass);
    }
  }

  // Update Category Scores on Checkbox Pills
  if (report.categories) {
    Object.entries(report.categories).forEach(([catKey, catData]) => {
      const pill = document.getElementById(`pillScore-${catKey}`);
      if (pill) {
        pill.textContent = `${catData.score}`;
        pill.className = 'cat-score-pill';
        if (catData.score >= 90) pill.classList.add('score-good');
        else if (catData.score >= 70) pill.classList.add('score-warn');
        else pill.classList.add('score-bad');
      }
    });
  }

  // Draw Radar Chart
  if(window.renderRadarChartReact) window.renderRadarChartReact(report);

  // Render Detailed Findings
  applyReportFilters();
}

function renderRadarChart(report) {
  const canvas = document.getElementById('radarChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (currentRadarChart) {
    currentRadarChart.destroy();
  }

  const categories = report.categories;
  const rawKeys = Object.keys(categories);
  const labels = rawKeys.map((k) => capitalize(k));
  const scores = rawKeys.map((k) => categories[k].score);

  currentRadarChart = new Chart(canvas.getContext('2d'), {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Health Score (0-100)',
          data: scores,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2.5,
          pointBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4.5,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 10, weight: 'bold' },
            backdropColor: 'transparent',
          },
          pointLabels: {
            font: { size: 11.5, weight: '600' },
            color: '#1e293b',
          },
          grid: {
            color: '#e2e8f0',
          },
          angleLines: {
            color: '#e2e8f0',
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { weight: 'bold' },
            color: '#0f172a',
          },
        },
      },
    },
  });
}

// Apply Category, Status, and Search Filters
function applyReportFilters() {
  if (!currentReportData) return;
  const categoriesDiv = document.getElementById('categories');
  const filterCountBadge = document.getElementById('filterCountBadge');
  if (!categoriesDiv) return;

  categoriesDiv.innerHTML = '';
  let visibleCategoryCount = 0;
  let totalMatchingFindings = 0;

  for (const [catKey, catData] of Object.entries(currentReportData.categories)) {
    // 1. Check if category is enabled in checkbox toggles
    if (!activeCategories.has(catKey)) {
      continue;
    }

    const issues = catData.issues || [];
    
    // 2. Filter issues by Status and Search query
    const filteredIssues = issues.filter((issue) => {
      // Status filter
      if (activeStatusFilter !== 'all') {
        if (issue.status !== activeStatusFilter) return false;
      }
      // Search filter
      if (activeSearchQuery) {
        const textToSearch = `${issue.check} ${issue.message} ${issue.status}`.toLowerCase();
        if (!textToSearch.includes(activeSearchQuery)) return false;
      }
      return true;
    });

    // If a specific status or search filter is active and no issues match, hide category
    if ((activeStatusFilter !== 'all' || activeSearchQuery) && filteredIssues.length === 0) {
      continue;
    }

    visibleCategoryCount++;
    totalMatchingFindings += filteredIssues.length;

    // Create Expandable Card
    const card = document.createElement('details');
    card.className = 'detailed-card';
    // Open if score is below 95 or if filtering
    if (catData.score < 95 || activeStatusFilter !== 'all' || activeSearchQuery) {
      card.open = true;
    }

    const summary = document.createElement('summary');
    const headerInfo = document.createElement('div');
    headerInfo.className = 'cat-header-info';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'cat-title';
    titleSpan.textContent = capitalize(catKey);

    const scoreBadge = document.createElement('span');
    scoreBadge.className = 'cat-score-badge';
    scoreBadge.textContent = `${catData.score}/100`;

    if (catData.score >= 90) scoreBadge.classList.add('score-good');
    else if (catData.score >= 70) scoreBadge.classList.add('score-warn');
    else scoreBadge.classList.add('score-bad');

    const findingsCount = document.createElement('span');
    findingsCount.className = 'cat-findings-count';
    findingsCount.textContent = `(${filteredIssues.length} finding${filteredIssues.length === 1 ? '' : 's'})`;

    headerInfo.appendChild(titleSpan);
    headerInfo.appendChild(scoreBadge);
    headerInfo.appendChild(findingsCount);

    const expandIcon = document.createElement('span');
    expandIcon.className = 'expand-icon';
    expandIcon.innerHTML = '▼';

    summary.appendChild(headerInfo);
    summary.appendChild(expandIcon);
    card.appendChild(summary);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';

    if (filteredIssues.length > 0) {
      filteredIssues.forEach((issue) => {
        const item = document.createElement('div');
        item.className = 'finding-item';

        let badgeClass = 'badge-info';
        if (issue.status === 'fail') badgeClass = 'badge-fail';
        else if (issue.status === 'warning') badgeClass = 'badge-warning';
        else if (issue.status === 'pass') badgeClass = 'badge-pass';

        let contextPath = currentReportData.url;
        const checkLower = issue.check.toLowerCase();
        if (checkLower.includes('robots')) contextPath = `${currentReportData.url}/robots.txt`;
        else if (checkLower.includes('llm')) contextPath = `${currentReportData.url}/llms.txt`;
        else if (checkLower.includes('mcp')) contextPath = `${currentReportData.url}/.well-known/ai-plugin.json`;
        else if (checkLower.includes('pwa') || checkLower.includes('manifest')) contextPath = `${currentReportData.url}/site.webmanifest`;
        else contextPath = `DOM / Headers at ${currentReportData.url}`;

        item.innerHTML = `
          <div class="finding-header">
            <span class="finding-badge ${badgeClass}">${issue.status}</span>
            <span class="finding-check">${escapeHtml(issue.check)}</span>
          </div>
          <div class="finding-body">
            <p class="finding-msg"><strong>Finding:</strong> ${linkify(escapeHtml(issue.message))}</p>
            <p class="finding-context"><strong>Context:</strong> <code>${escapeHtml(contextPath)}</code></p>
            <div class="finding-recommendation">
              <strong>Best Practice:</strong>
              <div class="recommendation-content">${getSOTARecommendation(issue.check, issue.status)}</div>
            </div>
            ${issue.reference ? `
            <div class="finding-reference" style="margin-top: 0.75rem; font-size: 0.85rem; padding: 0.5rem 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; border-left: 3px solid #3b82f6;">
              <strong>Standards Ref:</strong> <a href="${issue.reference.url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${escapeHtml(issue.reference.name)}</a>
            </div>` : ''}
          </div>
        `;
        contentDiv.appendChild(item);
      });
    } else {
      contentDiv.innerHTML = `<p style="color:#16a34a; font-weight:600;">✅ No matching issues for this category.</p>`;
    }

    card.appendChild(contentDiv);
    categoriesDiv.appendChild(card);
  }

  if (filterCountBadge) {
    filterCountBadge.textContent = `${visibleCategoryCount} Categories visible (${totalMatchingFindings} findings)`;
  }

  if (visibleCategoryCount === 0) {
    const isZeroCategories = activeCategories.size === 0;
    categoriesDiv.innerHTML = `
      <div class="empty-state">
        <p style="font-size:1.05rem; margin-bottom:0.75rem;">
          ${isZeroCategories ? 'All category sections are currently hidden.' : 'No findings match your current filter criteria.'}
        </p>
        <button id="clearFiltersInlineBtn" class="btn btn-primary btn-sm">
          ${isZeroCategories ? 'Show All Categories' : 'Reset Filters'}
        </button>
      </div>
    `;
    const clearInline = document.getElementById('clearFiltersInlineBtn');
    if (clearInline) {
      clearInline.addEventListener('click', () => {
        if (isZeroCategories) {
          document.getElementById('selectAllCatsBtn')?.click();
        } else {
          document.getElementById('resetFiltersBtn')?.click();
        }
      });
    }
  }
}

// Setup Report Actions (PDF Export, Email Share, Compare, Public Link)
function setupReportActions(report) {
  // 1. Export PDF
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', async () => {
      await exportReportToPdf(report);
    });
  }

  // 2. Email Report Modal Integration
  setupEmailReportModal(report);

  // 3. Compare This Site
  const compareThisBtn = document.getElementById('compareThisBtn');
  if (compareThisBtn) {
    compareThisBtn.addEventListener('click', () => {
      window.location.href = `/compare.html?urlA=${encodeURIComponent(report.url)}`;
    });
  }

  // 4. Save / Share Report Link
  const saveBtn = document.getElementById('saveReportBtn');
  const publicLinkDiv = document.getElementById('publicLink');
  const publicUrlLink = document.getElementById('publicUrlLink');

  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      if (report.id) {
        const publicUrl = `${window.location.origin}/report.html?id=${report.id}`;
        publicUrlLink.href = publicUrl;
        publicUrlLink.textContent = publicUrl;
        publicLinkDiv.style.display = 'block';
        // Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(publicUrl);
          saveBtn.textContent = '✅ Link Copied!';
          setTimeout(() => { saveBtn.textContent = '🔗 Share Report Link'; }, 3000);
        }
      } else {
        alert('This report is ready to share. Report ID: ' + report.id);
      }
    });
  }
}

// Build Plain Text & Markdown Summary of Audit Report
function buildEmailSummaryText(report, options = {}) {
  const {
    recipient = '',
    note = '',
    includeBreakdown = true,
    includeFindings = true,
    includeShareLink = true
  } = options;

  const url = report.url || report.final_url || 'Unknown Target';
  const score = report.overall_score !== undefined ? report.overall_score : '--';
  const grade = report.grade || '--';
  const timestamp = report.timestamp ? new Date(report.timestamp).toLocaleString() : new Date().toLocaleString();
  const publicUrl = report.id ? `${window.location.origin}/report.html?id=${report.id}` : window.location.href;

  const categoryNames = {
    seo: 'SEO & Meta Indexability',
    security: 'Security & SecOps Headers',
    performance: 'Core Web Vitals & Speed',
    mobile: 'Mobile & Responsive Design',
    accessibility: 'Accessibility (WCAG 2.1)',
    social: 'Social Sharing & Open Graph',
    ethical: 'Digital Ethics & Carbon Footprint',
    web_standards: 'W3C Web Standards & HTML5',
    ai_readiness: 'AI Readiness & MCP Protocols',
    ux_ecosystem: 'UX & Modern Tech Ecosystem'
  };

  let summary = `CATALYSTLAB WEBSITE HEALTH AUDIT SUMMARY\n`;
  summary += `====================================================\n`;
  summary += `Target Website : ${url}\n`;
  summary += `Overall Score  : ${score} / 100 (Grade ${grade})\n`;
  summary += `Timestamp      : ${timestamp}\n`;
  if (includeShareLink) {
    summary += `Interactive URL: ${publicUrl}\n`;
  }
  if (note && note.trim()) {
    summary += `\nSender Note    : ${note.trim()}\n`;
  }
  summary += `====================================================\n\n`;

  if (includeBreakdown && report.categories) {
    summary += `10-DIMENSION SCORE BREAKDOWN:\n`;
    summary += `----------------------------------------------------\n`;
    for (const [key, data] of Object.entries(report.categories)) {
      const label = categoryNames[key] || capitalize(key);
      const catScore = data.score !== undefined ? data.score : '--';
      const status = catScore >= 90 ? '[EXCELLENT]' : (catScore >= 70 ? '[GOOD]' : '[NEEDS WORK]');
      summary += `• ${label.padEnd(35)} : ${String(catScore).padStart(3)} / 100  ${status}\n`;
    }
    summary += `\n`;
  }

  if (includeFindings && report.categories) {
    summary += `KEY ACTION ITEMS & DETECTED ISSUES:\n`;
    summary += `----------------------------------------------------\n`;
    let issueCount = 0;
    for (const [key, data] of Object.entries(report.categories)) {
      const issues = (data.issues || []).filter(i => i.status === 'fail' || i.status === 'warning');
      if (issues.length > 0) {
        const label = categoryNames[key] || capitalize(key);
        summary += `\n[${label}]\n`;
        issues.slice(0, 3).forEach(issue => {
          issueCount++;
          const icon = issue.status === 'fail' ? '❌' : '⚠️';
          summary += `  ${icon} ${issue.check}: ${issue.message}\n`;
          if (issue.recommendation) {
            summary += `     Fix: ${issue.recommendation}\n`;
          }
        });
      }
    }
    if (issueCount === 0) {
      summary += `All tested parameters met or exceeded production health standards.\n`;
    }
    summary += `\n`;
  }

  if (includeShareLink) {
    summary += `View full interactive charts, telemetry breakdown & comparative benchmarking:\n`;
    summary += `${publicUrl}\n\n`;
  }
  summary += `Generated with CatalystLab Pro Telemetry Diagnostic Engine.\n`;

  return summary;
}

// Setup Email Report Modal Controller
function setupEmailReportModal(report) {
  const emailReportBtn = document.getElementById('emailReportBtn');
  const emailModal = document.getElementById('emailModal');
  const modalCloseBtn = document.getElementById('emailModalCloseBtn');
  const cancelBtn = document.getElementById('btnCancelEmailModal');
  const tabCompose = document.getElementById('tabEmailCompose');
  const tabPreview = document.getElementById('tabEmailPreview');
  const composeBody = document.getElementById('modalComposeBody');
  const previewBody = document.getElementById('modalPreviewBody');
  const previewContent = document.getElementById('emailPreviewContent');
  const recipientInput = document.getElementById('emailRecipientInput');
  const subjectInput = document.getElementById('emailSubjectInput');
  const noteInput = document.getElementById('emailNoteInput');
  const optBreakdown = document.getElementById('emailOptBreakdown');
  const optFindings = document.getElementById('emailOptFindings');
  const optShareLink = document.getElementById('emailOptShareLink');
  const btnSendApi = document.getElementById('btnSendEmailApi');
  const btnOpenMailto = document.getElementById('btnOpenMailto');
  const btnCopyText = document.getElementById('btnCopyEmailText');
  const alertBox = document.getElementById('emailModalAlert');

  if (!emailModal || !emailReportBtn) return;

  function getHost() {
    try {
      return new URL(report.url).hostname.replace(/^www\./i, '');
    } catch {
      return report.url || 'Website';
    }
  }

  function getDefaultSubject() {
    const host = getHost();
    const score = report.overall_score !== undefined ? report.overall_score : '--';
    const grade = report.grade || '--';
    return `CatalystLab Audit Summary: ${host} (Score ${score}/100 • Grade ${grade})`;
  }

  function getCurrentOptions() {
    return {
      recipient: recipientInput ? recipientInput.value.trim() : '',
      note: noteInput ? noteInput.value.trim() : '',
      subject: subjectInput && subjectInput.value.trim() ? subjectInput.value.trim() : getDefaultSubject(),
      includeBreakdown: optBreakdown ? optBreakdown.checked : true,
      includeFindings: optFindings ? optFindings.checked : true,
      includeShareLink: optShareLink ? optShareLink.checked : true
    };
  }

  function updatePreview() {
    if (previewContent) {
      const text = buildEmailSummaryText(report, getCurrentOptions());
      previewContent.textContent = text;
    }
  }

  function showAlert(msg, type = 'info') {
    if (!alertBox) return;
    alertBox.className = `modal-alert modal-alert-${type}`;
    alertBox.innerHTML = msg;
    alertBox.style.display = 'flex';
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = 'none';
  }

  function openModal() {
    hideAlert();
    const savedEmail = localStorage.getItem('catalyst_last_email') || '';
    if (recipientInput) {
      recipientInput.value = savedEmail;
    }
    if (subjectInput && (!subjectInput.value || subjectInput.value.startsWith('CatalystLab Audit Summary:'))) {
      subjectInput.value = getDefaultSubject();
    }
    if (noteInput) {
      noteInput.value = '';
    }
    switchTab('compose');
    emailModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (recipientInput) {
        recipientInput.focus();
        if (savedEmail) recipientInput.select();
      }
    }, 50);
  }

  function closeModal() {
    emailModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function switchTab(tab) {
    if (tab === 'compose') {
      if (tabCompose) tabCompose.classList.add('active');
      if (tabPreview) tabPreview.classList.remove('active');
      if (composeBody) composeBody.style.display = 'flex';
      if (previewBody) previewBody.style.display = 'none';
    } else {
      if (tabPreview) tabPreview.classList.add('active');
      if (tabCompose) tabCompose.classList.remove('active');
      if (previewBody) previewBody.style.display = 'flex';
      if (composeBody) composeBody.style.display = 'none';
      updatePreview();
    }
  }

  emailReportBtn.addEventListener('click', openModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  emailModal.addEventListener('click', (e) => {
    if (e.target === emailModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && emailModal.style.display === 'flex') {
      closeModal();
    }
  });

  if (tabCompose) tabCompose.addEventListener('click', () => switchTab('compose'));
  if (tabPreview) tabPreview.addEventListener('click', () => switchTab('preview'));

  [recipientInput, subjectInput, noteInput, optBreakdown, optFindings, optShareLink].forEach((el) => {
    if (el) el.addEventListener('input', updatePreview);
  });

  // Action 1: Send via Server-Side Email Service API
  if (btnSendApi) {
    btnSendApi.addEventListener('click', async () => {
      const opts = getCurrentOptions();
      const email = opts.recipient;

      if (!email || !email.includes('@') || !email.includes('.')) {
        showAlert('⚠️ Please enter a valid recipient email address (e.g. name@domain.com).', 'error');
        if (recipientInput) recipientInput.focus();
        return;
      }

      btnSendApi.disabled = true;
      const originalHtml = btnSendApi.innerHTML;
      btnSendApi.innerHTML = '⏳ Sending Dispatch…';
      hideAlert();

      try {
        const response = await fetch('/api/email-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            reportId: report.id,
            report: report,
            subject: opts.subject,
            note: opts.note,
            includeDetails: opts.includeFindings
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to deliver email.');
        }

        // Save last email to localStorage
        localStorage.setItem('catalyst_last_email', email);

        showAlert(`✅ Audit summary successfully delivered to <strong>${escapeHtml(email)}</strong> (ID: ${escapeHtml(data.messageId)}).`, 'success');
        btnSendApi.innerHTML = '✅ Dispatched!';
        setTimeout(() => {
          btnSendApi.disabled = false;
          btnSendApi.innerHTML = originalHtml;
        }, 4000);
      } catch (err) {
        console.error('Email API Error:', err);
        showAlert(`❌ Delivery error: ${escapeHtml(err.message)}`, 'error');
        btnSendApi.disabled = false;
        btnSendApi.innerHTML = originalHtml;
      }
    });
  }

  // Action 2: Open in Mail Client via mailto URI
  if (btnOpenMailto) {
    btnOpenMailto.addEventListener('click', () => {
      const opts = getCurrentOptions();
      const bodyText = buildEmailSummaryText(report, opts);
      const recipient = opts.recipient || '';
      const subject = opts.subject || getDefaultSubject();

      const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

      if (recipient) {
        localStorage.setItem('catalyst_last_email', recipient);
      }

      showAlert('✉️ Launching your default email application with pre-filled audit content...', 'info');

      const mailtoAnchor = document.createElement('a');
      mailtoAnchor.href = mailtoUrl;
      mailtoAnchor.target = '_blank';
      mailtoAnchor.rel = 'noopener noreferrer';
      document.body.appendChild(mailtoAnchor);
      mailtoAnchor.click();
      setTimeout(() => mailtoAnchor.remove(), 100);
    });
  }

  // Action 3: Copy Plain-Text Summary to Clipboard
  if (btnCopyText) {
    btnCopyText.addEventListener('click', async () => {
      const opts = getCurrentOptions();
      const textToCopy = buildEmailSummaryText(report, opts);

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          const tempArea = document.createElement('textarea');
          tempArea.value = textToCopy;
          document.body.appendChild(tempArea);
          tempArea.select();
          document.execCommand('copy');
          document.body.removeChild(tempArea);
        }

        const origBtnText = btnCopyText.innerHTML;
        btnCopyText.innerHTML = '✅ Copied!';
        showAlert('📋 Audit summary text copied to clipboard. Ready to paste in any message or email.', 'info');
        setTimeout(() => {
          btnCopyText.innerHTML = origBtnText;
        }, 3000);
      } catch (err) {
        console.error('Clipboard copy error:', err);
        showAlert('⚠️ Unable to access clipboard automatically.', 'error');
      }
    });
  }
}

// Client-Side PDF Generation using html2pdf.js
async function exportReportToPdf(report) {
  const exportBtn = document.getElementById('exportPdfBtn');
  const originalText = exportBtn ? exportBtn.innerHTML : '';
  if (exportBtn) {
    exportBtn.disabled = true;
    exportBtn.innerHTML = '⏳ Generating PDF…';
  }

  try {
    // Open all details cards for PDF capture
    const detailsList = document.querySelectorAll('#categories details');
    detailsList.forEach((d) => (d.open = true));

    // Element to print
    const element = document.getElementById('reportContainer');

    const cleanDomain = report.url.replace(/^https?:\/\//i, '').replace(/[\/\\:]/g, '_');
    const filename = `Catalyst-Report-${cleanDomain}-${new Date().toISOString().slice(0, 10)}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    if (typeof html2pdf !== 'undefined') {
      await html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  } catch (error) {
    console.error('PDF export error:', error);
    alert('Failed to generate PDF automatically. Opening print dialogue as fallback.');
    window.print();
  } finally {
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.innerHTML = originalText;
    }
  }
}

// ============================================================
// Comparison Page (compare.html) – Side-by-Side Analysis
// ============================================================
let compareRadarChart = null;

const compareForm = document.getElementById('compareForm');
if (compareForm) {
  const quickPickA = document.getElementById('quickPickA');
  const quickPickB = document.getElementById('quickPickB');
  const urlInputA = document.getElementById('urlInputA');
  const urlInputB = document.getElementById('urlInputB');
  const recentAudits = getRecentAudits();

  // Populate Quick-Pick Dropdowns
  if (recentAudits.length > 0) {
    recentAudits.forEach((audit) => {
      const optA = document.createElement('option');
      optA.value = audit.url;
      optA.textContent = `${audit.url} (Score: ${audit.overall_score}, Grade: ${audit.grade})`;
      quickPickA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = audit.url;
      optB.textContent = `${audit.url} (Score: ${audit.overall_score}, Grade: ${audit.grade})`;
      quickPickB.appendChild(optB);
    });

    quickPickA.addEventListener('change', () => {
      if (quickPickA.value) urlInputA.value = quickPickA.value;
    });

    quickPickB.addEventListener('change', () => {
      if (quickPickB.value) urlInputB.value = quickPickB.value;
    });
  }

  // Check URL query parameters: ?urlA=...&urlB=...
  const params = new URLSearchParams(window.location.search);
  const qUrlA = params.get('urlA');
  const qUrlB = params.get('urlB');

  if (qUrlA) urlInputA.value = qUrlA;
  if (qUrlB) urlInputB.value = qUrlB;

  if (qUrlA && qUrlB) {
    runSideBySideComparison(qUrlA, qUrlB);
  }

  // Handle Form Submission
  compareForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetA = urlInputA.value.trim();
    const targetB = urlInputB.value.trim();

    if (!targetA || !targetB) {
      alert('Please enter both website URLs to compare.');
      return;
    }

    await runSideBySideComparison(targetA, targetB);
  });
}

async function runSideBySideComparison(urlA, urlB) {
  const loading = document.getElementById('compareLoading');
  const errorDiv = document.getElementById('compareError');
  const resultsContainer = document.getElementById('compareResults');
  const compareBtn = document.getElementById('compareBtn');

  errorDiv.style.display = 'none';
  resultsContainer.style.display = 'none';
  if (compareBtn) compareBtn.disabled = true;

  const normA = /^https?:\/\//i.test(urlA) ? urlA : 'https://' + urlA;
  const normB = /^https?:\/\//i.test(urlB) ? urlB : 'https://' + urlB;

  const compareProgress = new GranularProgressController({
    container: loading,
    titleEl: document.getElementById('compareProgressStatusTitle'),
    subEl: document.getElementById('compareLoadingText'),
    elapsedEl: document.getElementById('compareProgressElapsedTime'),
    percentEl: document.getElementById('compareProgressPercentText'),
    progressBarFill: document.getElementById('compareProgressBarFill'),
    gridEl: document.getElementById('compareDimensionProgressGrid'),
    logEl: document.getElementById('compareTelemetryLogText'),
    idPrefix: 'compareDim_'
  });

  try {
    // Check if reports exist in recent audits or fetch
    const recent = getRecentAudits();
    const cachedA = recent.find((a) => a.url === normA && a.fullReport)?.fullReport;
    const cachedB = recent.find((b) => b.url === normB && b.fullReport)?.fullReport;

    const [reportA, reportB] = await Promise.all([
      cachedA ? Promise.resolve(cachedA) : executeAuditWithLiveStream(normA, compareProgress),
      cachedB ? Promise.resolve(cachedB) : fetchJSON('/api/analyze', { method: 'POST', body: JSON.stringify({ url: normB }) })
    ]);

    saveRecentAudit(reportA);
    saveRecentAudit(reportB);

    compareProgress.finish(reportA);
    setTimeout(() => {
      loading.style.display = 'none';
      renderComparisonResults(reportA, reportB);
      resultsContainer.style.display = 'block';
    }, 400);
  } catch (err) {
    compareProgress.stop();
    errorDiv.textContent = 'Comparison error: ' + err.message;
    errorDiv.style.display = 'block';
  } finally {
    if (compareBtn) compareBtn.disabled = false;
  }
}

function renderComparisonResults(reportA, reportB) {
  // 1. Overall Score Cards
  const scoreAEl = document.getElementById('scoreA');
  const scoreBEl = document.getElementById('scoreB');
  const gradeAEl = document.getElementById('gradeA');
  const gradeBEl = document.getElementById('gradeB');
  const displayUrlA = document.getElementById('displayUrlA');
  const displayUrlB = document.getElementById('displayUrlB');
  const ribbonA = document.getElementById('winnerRibbonA');
  const ribbonB = document.getElementById('winnerRibbonB');
  const cardA = document.getElementById('siteCardA');
  const cardB = document.getElementById('siteCardB');

  scoreAEl.textContent = reportA.overall_score;
  scoreBEl.textContent = reportB.overall_score;

  gradeAEl.textContent = `Grade ${reportA.grade}`;
  gradeAEl.className = `grade grade-${reportA.grade}`;

  gradeBEl.textContent = `Grade ${reportB.grade}`;
  gradeBEl.className = `grade grade-${reportB.grade}`;

  displayUrlA.textContent = reportA.url;
  displayUrlB.textContent = reportB.url;

  // Determine Winner
  ribbonA.style.display = 'none';
  ribbonB.style.display = 'none';
  cardA.classList.remove('winner');
  cardB.classList.remove('winner');

  if (reportA.overall_score > reportB.overall_score) {
    ribbonA.style.display = 'block';
    ribbonA.textContent = `🏆 +${(reportA.overall_score - reportB.overall_score).toFixed(1)} PTS HIGHER`;
    cardA.classList.add('winner');
  } else if (reportB.overall_score > reportA.overall_score) {
    ribbonB.style.display = 'block';
    ribbonB.textContent = `🏆 +${(reportB.overall_score - reportA.overall_score).toFixed(1)} PTS HIGHER`;
    cardB.classList.add('winner');
  }

  // 2. Comparative Dual Radar Chart
  if(window.renderDualRadarChartReact) window.renderDualRadarChartReact(reportA, reportB);

  // 3. Category Matrix Table
  renderComparisonMatrix(reportA, reportB);

  // 4. Side-by-Side Detailed Findings Split
  renderComparisonBreakdown(reportA, reportB);

  // 5. Comparison Action Buttons & Email Modal
  setupCompareActions(reportA, reportB);
}

// Setup Compare Actions & Email Modal
function setupCompareActions(reportA, reportB) {
  const shareBtn = document.getElementById('copyCompareLinkBtn');
  const emailBtn = document.getElementById('emailCompareBtn');
  const modal = document.getElementById('emailCompareModal');
  const closeBtn = document.getElementById('emailCompareCloseBtn');
  const cancelBtn = document.getElementById('btnCancelCompareModal');
  const tabCompose = document.getElementById('tabCompareCompose');
  const tabPreview = document.getElementById('tabComparePreview');
  const composeBody = document.getElementById('modalCompareComposeBody');
  const previewBody = document.getElementById('modalComparePreviewBody');
  const previewContent = document.getElementById('comparePreviewContent');
  const recipientInput = document.getElementById('compareEmailRecipientInput');
  const subjectInput = document.getElementById('compareEmailSubjectInput');
  const noteInput = document.getElementById('compareEmailNoteInput');
  const optMatrix = document.getElementById('compareOptMatrix');
  const optLink = document.getElementById('compareOptLink');
  const btnSendApi = document.getElementById('btnSendCompareApi');
  const btnOpenMailto = document.getElementById('btnOpenCompareMailto');
  const btnCopyText = document.getElementById('btnCopyCompareText');
  const alertBox = document.getElementById('emailCompareAlert');

  // Copy Comparison Link
  if (shareBtn) {
    shareBtn.onclick = () => {
      const compUrl = `${window.location.origin}/compare.html?urlA=${encodeURIComponent(reportA.url)}&urlB=${encodeURIComponent(reportB.url)}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(compUrl);
        shareBtn.textContent = '✅ Link Copied!';
        setTimeout(() => { shareBtn.textContent = '🔗 Share Comparison Link'; }, 3000);
      }
    };
  }

  if (!modal || !emailBtn) return;

  function getCleanDomain(u) {
    try { return new URL(u).hostname.replace(/^www\./i, ''); } catch { return u || 'Site'; }
  }

  const domA = getCleanDomain(reportA.url);
  const domB = getCleanDomain(reportB.url);
  const defaultSubject = `CatalystLab Comparison: ${domA} vs ${domB} (${reportA.overall_score} vs ${reportB.overall_score} pts)`;

  function getCompareOptions() {
    return {
      recipient: recipientInput ? recipientInput.value.trim() : '',
      note: noteInput ? noteInput.value.trim() : '',
      subject: subjectInput && subjectInput.value.trim() ? subjectInput.value.trim() : defaultSubject,
      includeMatrix: optMatrix ? optMatrix.checked : true,
      includeLink: optLink ? optLink.checked : true
    };
  }

  function buildCompareText(opts = {}) {
    const compUrl = `${window.location.origin}/compare.html?urlA=${encodeURIComponent(reportA.url)}&urlB=${encodeURIComponent(reportB.url)}`;
    const diff = (reportA.overall_score - reportB.overall_score).toFixed(1);
    const winnerText = reportA.overall_score > reportB.overall_score
      ? `${domA} leads by +${diff} points`
      : (reportB.overall_score > reportA.overall_score ? `${domB} leads by +${Math.abs(diff)} points` : 'Tied score');

    let text = `CATALYSTLAB WEBSITE HEALTH BENCHMARK COMPARISON\n`;
    text += `====================================================\n`;
    text += `Site A       : ${reportA.url} (${reportA.overall_score}/100 • Grade ${reportA.grade})\n`;
    text += `Site B       : ${reportB.url} (${reportB.overall_score}/100 • Grade ${reportB.grade})\n`;
    text += `Outcome      : ${winnerText}\n`;
    if (opts.note && opts.note.trim()) {
      text += `Sender Note  : ${opts.note.trim()}\n`;
    }
    text += `====================================================\n\n`;

    if (opts.includeMatrix) {
      text += `10-DIMENSION SCORE DELTA MATRIX:\n`;
      text += `----------------------------------------------------\n`;
      const keys = Object.keys(reportA.categories || {});
      keys.forEach((k) => {
        const scA = reportA.categories[k]?.score || 0;
        const scB = reportB.categories[k]?.score || 0;
        const delta = scA - scB;
        const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
        const outcome = delta > 0 ? `${domA} (+${delta})` : (delta < 0 ? `${domB} (+${Math.abs(delta)})` : 'Tied');
        text += `• ${capitalize(k).padEnd(20)} : ${String(scA).padStart(3)} vs ${String(scB).padStart(3)} | Delta: ${deltaStr.padStart(4)} (${outcome})\n`;
      });
      text += `\n`;
    }

    if (opts.includeLink) {
      text += `Interactive Comparison Dashboard:\n${compUrl}\n\n`;
    }
    text += `Generated with CatalystLab Telemetry Diagnostic Engine.\n`;
    return text;
  }

  function updatePreview() {
    if (previewContent) {
      previewContent.textContent = buildCompareText(getCompareOptions());
    }
  }

  function showAlert(msg, type = 'info') {
    if (!alertBox) return;
    alertBox.className = `modal-alert modal-alert-${type}`;
    alertBox.innerHTML = msg;
    alertBox.style.display = 'flex';
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = 'none';
  }

  function openModal() {
    hideAlert();
    const savedEmail = localStorage.getItem('catalyst_last_email') || '';
    if (recipientInput) recipientInput.value = savedEmail;
    if (subjectInput) subjectInput.value = defaultSubject;
    if (noteInput) noteInput.value = '';
    switchTab('compose');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (recipientInput) {
        recipientInput.focus();
        if (savedEmail) recipientInput.select();
      }
    }, 50);
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function switchTab(tab) {
    if (tab === 'compose') {
      if (tabCompose) tabCompose.classList.add('active');
      if (tabPreview) tabPreview.classList.remove('active');
      if (composeBody) composeBody.style.display = 'flex';
      if (previewBody) previewBody.style.display = 'none';
    } else {
      if (tabPreview) tabPreview.classList.add('active');
      if (tabCompose) tabCompose.classList.remove('active');
      if (previewBody) previewBody.style.display = 'flex';
      if (composeBody) composeBody.style.display = 'none';
      updatePreview();
    }
  }

  emailBtn.onclick = openModal;
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (tabCompose) tabCompose.onclick = () => switchTab('compose');
  if (tabPreview) tabPreview.onclick = () => switchTab('preview');

  [recipientInput, subjectInput, noteInput, optMatrix, optLink].forEach(el => {
    if (el) el.addEventListener('input', updatePreview);
  });

  // Action: Copy Comparison Text
  if (btnCopyText) {
    btnCopyText.onclick = async () => {
      const text = buildCompareText(getCompareOptions());
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        const orig = btnCopyText.innerHTML;
        btnCopyText.innerHTML = '✅ Copied!';
        showAlert('📋 Comparison summary copied to clipboard.', 'info');
        setTimeout(() => { btnCopyText.innerHTML = orig; }, 3000);
      }
    };
  }

  // Action: Open in Mail Client
  if (btnOpenMailto) {
    btnOpenMailto.onclick = () => {
      const opts = getCompareOptions();
      const body = buildCompareText(opts);
      const mailto = `mailto:${encodeURIComponent(opts.recipient)}?subject=${encodeURIComponent(opts.subject)}&body=${encodeURIComponent(body)}`;
      showAlert('✉️ Launching your mail application...', 'info');
      const a = document.createElement('a');
      a.href = mailto;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 100);
    };
  }

  // Action: Send via Email API
  if (btnSendApi) {
    btnSendApi.onclick = async () => {
      const opts = getCompareOptions();
      if (!opts.recipient || !opts.recipient.includes('@')) {
        showAlert('⚠️ Please enter a valid recipient email address.', 'error');
        if (recipientInput) recipientInput.focus();
        return;
      }

      btnSendApi.disabled = true;
      const orig = btnSendApi.innerHTML;
      btnSendApi.innerHTML = '⏳ Sending Dispatch…';
      hideAlert();

      try {
        const textBody = buildCompareText(opts);
        const compUrl = `${window.location.origin}/compare.html?urlA=${encodeURIComponent(reportA.url)}&urlB=${encodeURIComponent(reportB.url)}`;
        
        // Generate custom comparative HTML email payload
        const htmlBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 0 auto; color: #1e293b; line-height: 1.5; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 24px; text-align: center;">
              <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #ffffff;">CatalystLab Side-by-Side Health Audit</h1>
              <p style="margin: 0; color: #94a3b8; font-size: 13px;">Comparative Benchmark Analysis</p>
            </div>
            <div style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px;">
                <div style="flex: 1; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
                  <div style="font-size: 12px; color: #64748b; font-weight: 600;">SITE A</div>
                  <div style="font-size: 15px; font-weight: 700; color: #4338ca; margin: 4px 0;">${escapeHtml(reportA.url)}</div>
                  <div style="font-size: 28px; font-weight: 800; color: #0f172a;">${reportA.overall_score} <span style="font-size: 14px; font-weight: 600; color: #64748b;">/ 100</span></div>
                  <div style="font-size: 12px; font-weight: 700; color: #4338ca;">Grade ${reportA.grade}</div>
                </div>
                <div style="flex: 1; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
                  <div style="font-size: 12px; color: #64748b; font-weight: 600;">SITE B</div>
                  <div style="font-size: 15px; font-weight: 700; color: #059669; margin: 4px 0;">${escapeHtml(reportB.url)}</div>
                  <div style="font-size: 28px; font-weight: 800; color: #0f172a;">${reportB.overall_score} <span style="font-size: 14px; font-weight: 600; color: #64748b;">/ 100</span></div>
                  <div style="font-size: 12px; font-weight: 700; color: #059669;">Grade ${reportB.grade}</div>
                </div>
              </div>
              ${opts.note ? `<div style="padding: 12px 16px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; font-size: 13px; color: #1e3a8a; margin-bottom: 20px;"><strong>Note:</strong> ${escapeHtml(opts.note)}</div>` : ''}
              <div style="text-align: center; margin-top: 24px;">
                <a href="${compUrl}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">Explore Interactive Dual Comparison →</a>
              </div>
            </div>
          </div>
        `;

        const res = await fetch('/api/email-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: opts.recipient,
            subject: opts.subject,
            note: opts.note,
            report: {
              url: `${reportA.url} vs ${reportB.url}`,
              overall_score: `${reportA.overall_score} vs ${reportB.overall_score}`,
              grade: `${reportA.grade} vs ${reportB.grade}`,
              categories: reportA.categories
            }
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to deliver comparison email.');

        localStorage.setItem('catalyst_last_email', opts.recipient);
        showAlert(`✅ Comparison successfully delivered to <strong>${escapeHtml(opts.recipient)}</strong>!`, 'success');
        btnSendApi.innerHTML = '✅ Dispatched!';
        setTimeout(() => {
          btnSendApi.disabled = false;
          btnSendApi.innerHTML = orig;
        }, 4000);
      } catch (err) {
        showAlert(`❌ Delivery error: ${escapeHtml(err.message)}`, 'error');
        btnSendApi.disabled = false;
        btnSendApi.innerHTML = orig;
      }
    };
  }
}

function renderDualRadarChart(reportA, reportB) {
  const canvas = document.getElementById('compareRadarChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (compareRadarChart) {
    compareRadarChart.destroy();
  }

  const rawKeys = Object.keys(reportA.categories);
  const labels = rawKeys.map((k) => capitalize(k));
  const scoresA = rawKeys.map((k) => reportA.categories[k]?.score || 0);
  const scoresB = rawKeys.map((k) => reportB.categories[k]?.score || 0);

  compareRadarChart = new Chart(canvas.getContext('2d'), {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: reportA.url,
          data: scoresA,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: '#4f46e5',
          borderWidth: 2.5,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
        },
        {
          label: reportB.url,
          data: scoresB,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, backdropColor: 'transparent' },
          pointLabels: { font: { size: 11, weight: '600' }, color: '#1e293b' },
          grid: { color: '#e2e8f0' },
          angleLines: { color: '#e2e8f0' },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { font: { weight: 'bold' } },
        },
      },
    },
  });
}

function renderComparisonMatrix(reportA, reportB) {
  const tableBody = document.getElementById('matrixTableBody');
  const thA = document.getElementById('thSiteA');
  const thB = document.getElementById('thSiteB');

  if (thA) thA.textContent = reportA.url;
  if (thB) thB.textContent = reportB.url;
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const allKeys = Object.keys(reportA.categories);

  allKeys.forEach((catKey) => {
    const scoreA = reportA.categories[catKey]?.score || 0;
    const scoreB = reportB.categories[catKey]?.score || 0;
    const delta = Math.round((scoreA - scoreB) * 10) / 10;

    let deltaHtml = `<span class="delta-pill delta-neutral">0</span>`;
    let outcomeHtml = `<span>Tie</span>`;

    if (delta > 0) {
      deltaHtml = `<span class="delta-pill delta-pos">+${delta}</span>`;
      outcomeHtml = `<strong style="color:#16a34a;">Site A Wins</strong>`;
    } else if (delta < 0) {
      deltaHtml = `<span class="delta-pill delta-neg">${delta}</span>`;
      outcomeHtml = `<strong style="color:#2563eb;">Site B Wins</strong>`;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${capitalize(catKey)}</strong></td>
      <td><span class="score-tag ${scoreA >= 90 ? 'score-good' : (scoreA >= 70 ? 'score-warn' : 'score-bad')}">${scoreA}/100</span></td>
      <td><span class="score-tag ${scoreB >= 90 ? 'score-good' : (scoreB >= 70 ? 'score-warn' : 'score-bad')}">${scoreB}/100</span></td>
      <td>${deltaHtml}</td>
      <td>${outcomeHtml}</td>
    `;
    tableBody.appendChild(row);
  });
}

function renderComparisonBreakdown(reportA, reportB) {
  const container = document.getElementById('compareBreakdown');
  if (!container) return;
  container.innerHTML = '';

  const allKeys = Object.keys(reportA.categories);

  allKeys.forEach((catKey) => {
    const dataA = reportA.categories[catKey] || { score: 0, issues: [] };
    const dataB = reportB.categories[catKey] || { score: 0, issues: [] };

    const card = document.createElement('details');
    card.className = 'detailed-card';
    if (dataA.score !== 100 || dataB.score !== 100) card.open = true;

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <div class="cat-header-info">
        <span class="cat-title">${capitalize(catKey)}</span>
        <span class="cat-score-badge ${dataA.score >= 90 ? 'score-good' : 'score-warn'}">A: ${dataA.score}</span>
        <span class="cat-score-badge ${dataB.score >= 90 ? 'score-good' : 'score-warn'}">B: ${dataB.score}</span>
      </div>
      <span class="expand-icon">▼</span>
    `;

    const content = document.createElement('div');
    content.className = 'card-content';

    const splitGrid = document.createElement('div');
    splitGrid.className = 'compare-split-grid';

    // Col A
    const colA = document.createElement('div');
    colA.className = 'split-col';
    colA.innerHTML = `<div class="split-col-header">${escapeHtml(reportA.url)} (${dataA.score}/100)</div>`;
    renderFindingsList(colA, dataA.issues, reportA.url);

    // Col B
    const colB = document.createElement('div');
    colB.className = 'split-col';
    colB.innerHTML = `<div class="split-col-header">${escapeHtml(reportB.url)} (${dataB.score}/100)</div>`;
    renderFindingsList(colB, dataB.issues, reportB.url);

    splitGrid.appendChild(colA);
    splitGrid.appendChild(colB);
    content.appendChild(splitGrid);
    card.appendChild(summary);
    card.appendChild(content);
    container.appendChild(card);
  });
}

function renderFindingsList(parentEl, issues, domainUrl) {
  if (!issues || issues.length === 0) {
    parentEl.innerHTML += `<p style="color:#16a34a; font-weight:600; font-size:0.9rem; padding:0.5rem 0;">✅ No issues detected.</p>`;
    return;
  }

  issues.forEach((issue) => {
    const item = document.createElement('div');
    item.className = 'finding-item';
    let badgeClass = issue.status === 'fail' ? 'badge-fail' : (issue.status === 'warning' ? 'badge-warning' : 'badge-pass');

    item.innerHTML = `
      <div class="finding-header">
        <span class="finding-badge ${badgeClass}">${issue.status}</span>
        <span class="finding-check" style="font-size:0.88rem;">${escapeHtml(issue.check)}</span>
      </div>
      <p class="finding-msg" style="font-size:0.85rem;">${linkify(escapeHtml(issue.message))}</p>
      ${issue.reference ? `
      <div class="finding-reference" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.4rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; border-left: 2px solid #3b82f6;">
        <a href="${issue.reference.url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${escapeHtml(issue.reference.name)}</a>
      </div>` : ''}
    `;
    parentEl.appendChild(item);
  });
}

// ============================================================
// Utility & Formatting Functions
// ============================================================
function capitalize(str) {
  if (str === 'web_standards') return 'Web Standards';
  if (str === 'ethical') return 'Ethics';
  if (str === 'ai_readiness') return 'AI Readiness';
  if (str === 'ux_ecosystem') return 'UX & Ecosystem';
  if (str === 'seo') return 'SEO';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTimestamp(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Recently';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function linkify(text) {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="linkified" style="text-decoration: underline; color: var(--primary);">${url}</a>`;
  });
}

function getSOTARecommendation(check, status) {
  const checkLower = check.toLowerCase();
  
  if (status === 'pass') {
    return '<p>Maintain this configuration as it fully aligns with current industry best practices.</p>';
  }
  
  const rules = [
    { 
      key: 'doctype', 
      rec: `
        <ol>
          <li>Ensure the DOCTYPE declaration is the very first item in your HTML document.</li>
          <li>Remove any preceding whitespace or XML declarations.</li>
          <li>Use the standard HTML5 DOCTYPE.</li>
        </ol>
        <pre><code>&lt;!DOCTYPE html&gt;\n&lt;html lang="en"&gt;</code></pre>
      ` 
    },
    { 
      key: 'carbon', 
      rec: `
        <ol>
          <li>Enable Brotli or Gzip compression on your web server.</li>
          <li>Convert images to modern formats like WebP or AVIF.</li>
          <li>Implement lazy loading for offscreen images.</li>
          <li>Minify CSS, JS, and HTML payloads.</li>
        </ol>
        <pre><code>&lt;img src="image.avif" loading="lazy" alt="..." /&gt;</code></pre>
      ` 
    },
    { 
      key: 'secops', 
      rec: `
        <ol>
          <li>Configure your server to send strict security headers.</li>
          <li>Enable Strict-Transport-Security (HSTS).</li>
          <li>Set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy.</li>
        </ol>
        <pre><code>Strict-Transport-Security: max-age=31536000; includeSubDomains\nCross-Origin-Opener-Policy: same-origin\nCross-Origin-Embedder-Policy: require-corp</code></pre>
      ` 
    },
    { 
      key: 'headers', 
      rec: `
        <ol>
          <li>Configure your server to send strict security headers.</li>
          <li>Enable Strict-Transport-Security (HSTS).</li>
          <li>Set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy.</li>
        </ol>
        <pre><code>Strict-Transport-Security: max-age=31536000; includeSubDomains\nCross-Origin-Opener-Policy: same-origin\nCross-Origin-Embedder-Policy: require-corp</code></pre>
      ` 
    },
    { 
      key: 'llms', 
      rec: `
        <ol>
          <li>Create a <code>llms.txt</code> file in the root of your domain.</li>
          <li>Provide a markdown-formatted overview of your project, intended for AI consumption.</li>
          <li>Link to your API documentation and OpenAPI specifications.</li>
        </ol>
        <pre><code># Project Overview\n\nThis is a documentation file for AI agents...\n\n[OpenAPI Spec](/api/openapi.json)</code></pre>
      ` 
    },
    { 
      key: 'mcp', 
      rec: `
        <ol>
          <li>Create a <code>.well-known</code> directory in your root public folder.</li>
          <li>Add an <code>ai-plugin.json</code> file describing your API for LLM tool use.</li>
          <li>Ensure CORS is configured to allow access from AI platform origins.</li>
        </ol>
        <pre><code>{\n  "schema_version": "v1",\n  "name_for_model": "my_api",\n  "description_for_model": "API for fetching data.",\n  "api": { "type": "openapi", "url": "/openapi.yaml" }\n}</code></pre>
      ` 
    },
    { 
      key: 'semantic', 
      rec: `
        <ol>
          <li>Replace generic <code>&lt;div&gt;</code> tags with semantic HTML5 elements.</li>
          <li>Use <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, and <code>&lt;footer&gt;</code> to structure the layout.</li>
          <li>Ensure headings (H1-H6) follow a logical hierarchy.</li>
        </ol>
        <pre><code>&lt;main&gt;\n  &lt;article&gt;\n    &lt;h1&gt;Main Title&lt;/h1&gt;\n    &lt;p&gt;Content goes here.&lt;/p&gt;\n  &lt;/article&gt;\n&lt;/main&gt;</code></pre>
      ` 
    },
    { 
      key: 'structured data', 
      rec: `
        <ol>
          <li>Generate a JSON-LD script block detailing your page's entity type (e.g., Article, Organization, Product).</li>
          <li>Place it in the <code>&lt;head&gt;</code> of your document.</li>
          <li>Validate using the Schema Markup Validator.</li>
        </ol>
        <pre><code>&lt;script type="application/ld+json"&gt;\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "My Site",\n  "url": "https://example.com/"\n}\n&lt;/script&gt;</code></pre>
      ` 
    },
    { 
      key: 'api', 
      rec: `
        <ol>
          <li>Expose machine-readable documentation for your API endpoints.</li>
          <li>Add a link to your OpenAPI/Swagger definition in the document head.</li>
        </ol>
        <pre><code>&lt;link rel="api" href="/openapi.json" type="application/vnd.oai.openapi+json"&gt;</code></pre>
      ` 
    },
    { 
      key: 'pwa', 
      rec: `
        <ol>
          <li>Create a <code>site.webmanifest</code> file containing app metadata (name, icons, display mode).</li>
          <li>Link the manifest in your HTML head.</li>
          <li>Add a <code>theme-color</code> meta tag for mobile browser UI styling.</li>
        </ol>
        <pre><code>&lt;link rel="manifest" href="/site.webmanifest"&gt;\n&lt;meta name="theme-color" content="#3b82f6"&gt;</code></pre>
      ` 
    },
    { 
      key: 'resource hints', 
      rec: `
        <ol>
          <li>Identify critical external origins and use <code>preconnect</code> to establish early connections.</li>
          <li>Use <code>preload</code> for critical rendering path assets like LCP images or key fonts.</li>
        </ol>
        <pre><code>&lt;link rel="preconnect" href="https://fonts.googleapis.com"&gt;\n&lt;link rel="preload" href="/hero-image.avif" as="image"&gt;</code></pre>
      ` 
    },
    { 
      key: 'dom depth', 
      rec: `
        <ol>
          <li>Flatten your DOM architecture by removing unnecessary wrapper elements (e.g., redundant container divs).</li>
          <li>Use CSS Grid or Flexbox to manage layout without adding extra markup.</li>
          <li>Aim for a maximum tree depth of under 32 nodes.</li>
        </ol>
        <pre><code>/* Use Grid to avoid wrapper divs */\n.grid-container {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n}</code></pre>
      ` 
    },
    { 
      key: 'tracking', 
      rec: `
        <ol>
          <li>Minimize the use of client-side tracking scripts.</li>
          <li>Transition to server-side tagging (e.g., GTM Server Container) to reduce client payload.</li>
          <li>Ensure explicit user consent (cookie banners) before loading any third-party tracking.</li>
        </ol>
        <pre><code>// Load analytics only after consent\nif (userConsented) {\n  loadAnalytics();\n}</code></pre>
      ` 
    },
    { 
      key: 'https', 
      rec: `
        <ol>
          <li>Enforce TLS 1.2 or 1.3 across all environments.</li>
          <li>Redirect all HTTP traffic to HTTPS via 301 redirects.</li>
          <li>Implement the <code>upgrade-insecure-requests</code> CSP directive to fix mixed content.</li>
        </ol>
        <pre><code>Content-Security-Policy: upgrade-insecure-requests;</code></pre>
      ` 
    },
    { 
      key: 'obsolete', 
      rec: `
        <ol>
          <li>Audit your codebase for deprecated HTML tags (e.g., <code>&lt;font&gt;</code>, <code>&lt;center&gt;</code>, <code>&lt;marquee&gt;</code>).</li>
          <li>Replace them with standard CSS properties (e.g., <code>text-align: center</code>).</li>
        </ol>
        <pre><code>&lt;!-- Bad --&gt;\n&lt;center&gt;Text&lt;/center&gt;\n\n&lt;!-- Good --&gt;\n&lt;div style="text-align: center;"&gt;Text&lt;/div&gt;</code></pre>
      ` 
    },
    { 
      key: 'permissions', 
      rec: `
        <ol>
          <li>Add the <code>Permissions-Policy</code> header to your server response.</li>
          <li>Explicitly disable powerful browser APIs (camera, geolocation) if they are not used.</li>
        </ol>
        <pre><code>Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()</code></pre>
      ` 
    },
    { 
      key: 'server masking', 
      rec: `
        <ol>
          <li>Configure your web server (Nginx, Apache) to omit the <code>Server</code> and <code>X-Powered-By</code> headers.</li>
          <li>In Node.js/Express, disable the <code>x-powered-by</code> setting.</li>
        </ol>
        <pre><code>// Express.js\napp.disable('x-powered-by');</code></pre>
      ` 
    },
    { 
      key: 'font', 
      rec: `
        <ol>
          <li>Download the required web fonts (e.g., WOFF2 format) instead of loading them from third-party CDNs (like Google Fonts).</li>
          <li>Serve them from your own domain to prevent IP leakage and ensure GDPR compliance.</li>
          <li>Define them in your CSS using <code>@font-face</code>.</li>
        </ol>
        <pre><code>@font-face {\n  font-family: 'MyFont';\n  src: url('/fonts/myfont.woff2') format('woff2');\n  font-display: swap;\n}</code></pre>
      ` 
    },
    {
      key: 'title',
      rec: `
        <ol>
          <li>Add a <code>&lt;title&gt;</code> tag within the <code>&lt;head&gt;</code> of your document.</li>
          <li>Keep the length between 10 and 60 characters for optimal display in search engines.</li>
          <li>Include primary keywords near the beginning.</li>
        </ol>
        <pre><code>&lt;title&gt;Primary Keyword - Brand Name&lt;/title&gt;</code></pre>
      `
    },
    {
      key: 'meta description',
      rec: `
        <ol>
          <li>Add a <code>&lt;meta name="description"&gt;</code> tag within the <code>&lt;head&gt;</code>.</li>
          <li>Keep the length between 50 and 160 characters.</li>
          <li>Write a compelling summary that encourages click-throughs.</li>
        </ol>
        <pre><code>&lt;meta name="description" content="A comprehensive description of the page content that encourages users to click."&gt;</code></pre>
      `
    },
    {
      key: 'h1',
      rec: `
        <ol>
          <li>Ensure exactly one <code>&lt;h1&gt;</code> tag is present per page.</li>
          <li>Use it to describe the main topic of the page.</li>
          <li>Place it logically at the top of the content hierarchy.</li>
        </ol>
        <pre><code>&lt;h1&gt;Main Topic of the Page&lt;/h1&gt;</code></pre>
      `
    },
    {
      key: 'canonical',
      rec: `
        <ol>
          <li>Add a canonical link tag to indicate the preferred version of a URL.</li>
          <li>This prevents duplicate content issues in search engines.</li>
        </ol>
        <pre><code>&lt;link rel="canonical" href="https://example.com/preferred-page-url" /&gt;</code></pre>
      `
    },
    {
      key: 'image alt',
      rec: `
        <ol>
          <li>Add meaningful <code>alt</code> attributes to all <code>&lt;img&gt;</code> tags.</li>
          <li>For decorative images, use an empty string (<code>alt=""</code>).</li>
          <li>Ensure the alt text accurately describes the image for screen readers.</li>
        </ol>
        <pre><code>&lt;img src="chart.png" alt="A bar chart showing quarterly revenue growth" /&gt;</code></pre>
      `
    },
    {
      key: 'open graph',
      rec: `
        <ol>
          <li>Add Open Graph meta tags (<code>og:title</code>, <code>og:description</code>, <code>og:image</code>) to control how your page appears when shared on social media.</li>
          <li>Ensure the image URL is absolute and high resolution (at least 1200x630px).</li>
        </ol>
        <pre><code>&lt;meta property="og:title" content="Page Title"&gt;\n&lt;meta property="og:image" content="https://example.com/image.jpg"&gt;</code></pre>
      `
    },
    {
      key: 'viewport',
      rec: `
        <ol>
          <li>Include a viewport meta tag in the <code>&lt;head&gt;</code> to ensure proper scaling on mobile devices.</li>
          <li>Set <code>width=device-width</code> and <code>initial-scale=1.0</code>.</li>
        </ol>
        <pre><code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</code></pre>
      `
    },
    {
      key: 'labels',
      rec: `
        <ol>
          <li>Ensure all <code>&lt;input&gt;</code>, <code>&lt;textarea&gt;</code>, and <code>&lt;select&gt;</code> elements have an associated <code>&lt;label&gt;</code> or <code>aria-label</code>.</li>
          <li>Use the <code>for</code> attribute on labels linking to the input's <code>id</code>.</li>
        </ol>
        <pre><code>&lt;label for="email"&gt;Email Address&lt;/label&gt;\n&lt;input type="email" id="email" name="email"&gt;</code></pre>
      `
    },
    {
      key: 'heading hierarchy',
      rec: `
        <ol>
          <li>Do not skip heading levels (e.g., jumping from H1 to H3).</li>
          <li>Use headings to create a logical outline of your content.</li>
        </ol>
        <pre><code>&lt;h2&gt;Section Title&lt;/h2&gt;\n&lt;h3&gt;Subsection Title&lt;/h3&gt;</code></pre>
      `
    },
    {
      key: 'aria landmarks',
      rec: `
        <ol>
          <li>Use native HTML5 landmarks (e.g., <code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>) or ARIA roles (<code>role="main"</code>).</li>
          <li>Ensure there is a single main content area.</li>
        </ol>
        <pre><code>&lt;main role="main"&gt;\n  &lt;!-- Primary content --&gt;\n&lt;/main&gt;</code></pre>
      `
    }
  ];

  for (const rule of rules) {
    if (checkLower.includes(rule.key)) return rule.rec;
  }

  return `
    <ol>
      <li>Identify the specific component or metric flagged.</li>
      <li>Review official documentation (e.g., MDN Web Docs, web.dev, W3C) to understand the underlying standard.</li>
      <li>Refactor the implementation to align with recommended architectural patterns.</li>
    </ol>
  `;
}

// ============================================================
// Published Reports Page (reports.html)
// ============================================================
let allPublishedReports = [];

document.addEventListener('DOMContentLoaded', async function () {
  const publishedReportsList = document.getElementById('publishedReportsList');
  if (!publishedReportsList) return;

  const loadingReports = document.getElementById('loadingReports');
  const searchInput = document.getElementById('reportSearchInput');
  const dateFilter = document.getElementById('reportDateFilter');
  
  function renderPublishedReports(reports) {
    if (reports.length === 0) {
      publishedReportsList.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No reports match your search criteria or none have been published yet.</p>
        </div>
      `;
      return;
    }

    publishedReportsList.innerHTML = reports.map((report) => {
      const formattedDate = formatTimestamp(report.timestamp);
      const gradeClass = `grade-${report.grade}`;
      const scoreColorClass = report.overall_score >= 90 ? 'score-good' : (report.overall_score >= 70 ? 'score-warn' : 'score-bad');
      
      const urlObj = new URL(report.url);
      const host = urlObj.hostname;
      const versionStr = report.id.split('/')[1] || 'v1';

      return `
        <div class="recent-audit-card">
          <div class="recent-card-top">
            <a href="/reports/${report.id}" class="recent-card-url" title="${escapeHtml(report.url)}">${escapeHtml(host)} <span style="font-size: 0.8em; color: #888;">(${escapeHtml(versionStr)})</span></a>
            <div class="recent-card-score">
              <span class="recent-score-pill ${scoreColorClass}">${report.overall_score}</span>
              <span class="grade ${gradeClass}" style="font-size:0.8rem; padding:0.15rem 0.5rem;">${report.grade}</span>
            </div>
          </div>
          <div class="recent-card-date">🕒 ${formattedDate}</div>
          <div class="recent-card-actions">
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <a href="/reports/${report.id}" class="btn btn-secondary btn-sm">View Report</a>
              <a href="/compare.html?urlA=${encodeURIComponent(report.url)}" class="btn btn-secondary btn-sm">VS Compare</a>
              <button type="button" class="btn btn-secondary btn-sm" onclick="quickEmailReport('${escapeHtml(report.id)}', '${escapeHtml(report.url)}', ${report.overall_score}, '${escapeHtml(report.grade)}')">📧 Email</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterReports() {
    let filtered = allPublishedReports;
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const dateVal = dateFilter ? dateFilter.value : '';

    if (query) {
      filtered = filtered.filter(report => {
        const urlObj = new URL(report.url);
        return urlObj.hostname.toLowerCase().includes(query) || report.url.toLowerCase().includes(query);
      });
    }

    if (dateVal) {
      // dateVal is YYYY-MM-DD
      filtered = filtered.filter(report => {
        if (!report.timestamp) return false;
        // Compare just the date portion
        const reportDate = new Date(report.timestamp).toISOString().split('T')[0];
        return reportDate === dateVal;
      });
    }

    renderPublishedReports(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterReports);
  if (dateFilter) dateFilter.addEventListener('change', filterReports);

  // Global Quick Email Report helper for report cards
  window.quickEmailReport = async function(reportId, reportUrl, score, grade) {
    const savedEmail = localStorage.getItem('catalyst_last_email') || '';
    const email = prompt(`Dispatch health audit summary for ${reportUrl} (Score: ${score}/100 • Grade ${grade}) to email address:`, savedEmail);
    if (!email || !email.trim()) return;
    if (!email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid email address.');
      return;
    }
    const cleanEmail = email.trim();
    localStorage.setItem('catalyst_last_email', cleanEmail);
    try {
      const res = await fetch('/api/email-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          reportId: reportId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');
      alert(`✅ Audit summary successfully emailed to ${cleanEmail}! (Message ID: ${data.messageId})`);
    } catch (err) {
      alert(`❌ Delivery error: ${err.message}`);
    }
  };

  try {
    allPublishedReports = await fetchJSON('/api/reports');
    loadingReports.style.display = 'none';
    publishedReportsList.style.display = 'grid';

    renderPublishedReports(allPublishedReports);
  } catch (err) {
    loadingReports.style.display = 'none';
    publishedReportsList.style.display = 'block';
    publishedReportsList.innerHTML = `<div class="error-box">Failed to load reports: ${escapeHtml(err.message)}</div>`;
  }
});

// ============================================================
// Admin Dashboard Page (admin.html)
// ============================================================
document.addEventListener('DOMContentLoaded', async function () {
  const adminStatsGrid = document.getElementById('adminStatsGrid');
  if (!adminStatsGrid) return; // Not on admin page

  const statTotalAudits = document.getElementById('statTotalAudits');
  const statUniqueDomains = document.getElementById('statUniqueDomains');
  const statTotalBlogs = document.getElementById('statTotalBlogs');
  const statTotalEmails = document.getElementById('statTotalEmails');
  const emailLogsContainer = document.getElementById('emailLogsContainer');
  const blogForm = document.getElementById('blogForm');
  const blogStatus = document.getElementById('blogStatus');
  const btnSubmitBlog = document.getElementById('btnSubmitBlog');

  // Load stats
  try {
    const stats = await fetchJSON('/api/admin/stats');
    if (statTotalAudits) statTotalAudits.textContent = stats.totalAudits;
    if (statUniqueDomains) statUniqueDomains.textContent = stats.uniqueDomains;
    if (statTotalBlogs) statTotalBlogs.textContent = stats.totalBlogs;
    if (statTotalEmails) statTotalEmails.textContent = stats.totalEmails !== undefined ? stats.totalEmails : 0;
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }

  // Load Email Logs
  if (emailLogsContainer) {
    try {
      const logs = await fetchJSON('/api/admin/email-logs');
      if (!logs || logs.length === 0) {
        emailLogsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No email reports have been dispatched yet. When users email audits, delivery logs will appear here.</p>`;
      } else {
        let html = `
          <div style="overflow-x: auto;">
            <table class="matrix-table" style="width: 100%; font-size: 0.85rem;">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Recipient</th>
                  <th>Target Domain</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
        `;
        logs.forEach(log => {
          const time = formatTimestamp(log.timestamp);
          const gradeClass = `grade-${log.grade}`;
          html += `
            <tr>
              <td style="white-space: nowrap; color: var(--text-muted);">${time}</td>
              <td style="font-weight: 600; color: var(--primary);">${escapeHtml(log.to)}</td>
              <td><a href="${log.reportUrl || '#'}" target="_blank" style="color: var(--text-main); font-weight: 500;">${escapeHtml(log.targetUrl)}</a></td>
              <td style="font-weight: 700;">${log.score}/100</td>
              <td><span class="grade ${gradeClass}" style="display:inline-block; font-size:0.75rem; padding: 2px 6px; border-radius: 4px;">${log.grade}</span></td>
              <td><span style="background: #ecfdf5; color: #065f46; font-size: 0.75rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">DELIVERED</span></td>
            </tr>
          `;
        });
        html += `
              </tbody>
            </table>
          </div>
        `;
        emailLogsContainer.innerHTML = html;
      }
    } catch (err) {
      emailLogsContainer.innerHTML = `<p style="color: var(--danger); font-size: 0.9rem;">Failed to load email logs: ${escapeHtml(err.message)}</p>`;
    }
  }

  // Handle Blog Submission
  blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('blogTitle').value.trim();
    const author = document.getElementById('blogAuthor').value.trim();
    const content = document.getElementById('blogContent').value.trim();

    if (!title || !content) {
      blogStatus.textContent = 'Title and content are required.';
      blogStatus.style.color = 'var(--danger)';
      return;
    }

    btnSubmitBlog.disabled = true;
    btnSubmitBlog.textContent = 'Publishing...';
    blogStatus.textContent = '';

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, content })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish blog');
      }

      blogStatus.textContent = 'Blog published successfully!';
      blogStatus.style.color = 'var(--success)';
      blogForm.reset();
      
      // Update stats visually
      const currentBlogs = parseInt(statTotalBlogs.textContent) || 0;
      statTotalBlogs.textContent = currentBlogs + 1;
      
      setTimeout(() => { blogStatus.textContent = ''; }, 3000);
    } catch (err) {
      blogStatus.textContent = err.message;
      blogStatus.style.color = 'var(--danger)';
    } finally {
      btnSubmitBlog.disabled = false;
      btnSubmitBlog.textContent = 'Publish Blog';
    }
  });
});

// ============================================================
// Blogs Page (blogs.html)
// ============================================================
document.addEventListener('DOMContentLoaded', async function () {
  const blogsList = document.getElementById('blogsList');
  if (!blogsList) return; // Not on blogs page

  const loadingBlogs = document.getElementById('loadingBlogs');

  try {
    const blogs = await fetchJSON('/api/blogs');
    loadingBlogs.style.display = 'none';
    blogsList.style.display = 'grid';

    if (blogs.length === 0) {
      blogsList.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No blog posts have been published yet. Check back soon!</p>
        </div>
      `;
      return;
    }

    blogsList.innerHTML = blogs.map((blog) => {
      const formattedDate = formatTimestamp(blog.createdAt);
      
      return `
        <article class="blog-card">
          <header class="blog-card-header">
            <h2 class="blog-card-title">${escapeHtml(blog.title)}</h2>
            <div class="blog-card-meta">
              <span>👤 ${escapeHtml(blog.author)}</span>
              <span>🕒 ${formattedDate}</span>
            </div>
          </header>
          <div class="blog-card-content">
            ${blog.content.replace(/\n/g, '<br>')}
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    loadingBlogs.style.display = 'none';
    blogsList.style.display = 'block';
    blogsList.innerHTML = `<div class="error-box">Failed to load blogs: ${escapeHtml(err.message)}</div>`;
  }
});

// ============================================================
// Global Navigation & Responsive Menu Interactions
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('mobileNavMenu');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const backToTopBtn = document.getElementById('btnBackToTop');

  // Toggle mobile drawer
  function setMobileNavOpen(isOpen) {
    if (!toggleBtn || !navMenu) return;
    toggleBtn.classList.toggle('active', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navMenu.classList.toggle('open', isOpen);
    navMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (backdrop) {
      backdrop.classList.toggle('open', isOpen);
    }
  }

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('open');
      setMobileNavOpen(!isOpen);
    });

    // Close on backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', function () {
        setMobileNavOpen(false);
      });
    }

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        setMobileNavOpen(false);
      }
    });

    // Close when clicking any nav link inside drawer
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', function () {
        setMobileNavOpen(false);
      });
    });
  }

  // Back to Top Button
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});



// Mobile Dropdown toggles
document.addEventListener('DOMContentLoaded', () => {
  const dropdownToggles = document.querySelectorAll('.mobile-nav-dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.closest('.mobile-nav-dropdown');
      if (parent) {
        parent.classList.toggle('is-open');
      }
    });
  });
});
