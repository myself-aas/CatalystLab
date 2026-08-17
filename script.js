// ============================================================
// Catalyst Score – Frontend Logic
// ============================================================

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
// Homepage (index.html) – Handle form submission
// ============================================================
const analyzeForm = document.getElementById('analyzeForm');
if (analyzeForm) {
  analyzeForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const urlInput = document.getElementById('urlInput');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const submitBtn = analyzeForm.querySelector('button[type="submit"]');

    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
      errorDiv.textContent = 'Please enter a URL.';
      errorDiv.style.display = 'block';
      return;
    }

    // Basic URL validation (optional)
    let urlToAnalyze = rawUrl;
    if (!/^https?:\/\//i.test(urlToAnalyze)) {
      urlToAnalyze = 'https://' + urlToAnalyze;
    }

    // Show loading state
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing…';

    try {
      const report = await fetchJSON('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: urlToAnalyze }),
      });

      // Store report for the report page
      sessionStorage.setItem('catalystReport', JSON.stringify(report));
      // Redirect to report page
      window.location.href = 'report.html';
    } catch (error) {
      errorDiv.textContent = 'Error: ' + error.message;
      errorDiv.style.display = 'block';
    } finally {
      loading.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Analyze';
    }
  });
}

// ============================================================
// Report page (report.html) – Load & render report
// ============================================================
document.addEventListener('DOMContentLoaded', async function () {
  const reportContent = document.getElementById('reportContent');
  if (!reportContent) return; // Not on report page

  let report = null;

  // 1. Try sessionStorage first (freshly generated report)
  const stored = sessionStorage.getItem('catalystReport');
  if (stored) {
    try {
      report = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored report', e);
    }
  }

  // 2. If not in sessionStorage, check query parameter ?id=...
  if (!report) {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('id');
    if (reportId) {
      try {
        report = await fetchJSON(`/api/report?id=${encodeURIComponent(reportId)}`);
      } catch (error) {
        reportContent.innerHTML = `<p class="error">Failed to load report: ${error.message}</p>`;
        return;
      }
    }
  }

  // 3. If still no report, show message
  if (!report) {
    reportContent.innerHTML = '<p>No report data available. Please run an analysis first.</p>';
    return;
  }

  // Render the report
  renderReport(report);
});

// ============================================================
// Report rendering
// ============================================================
function renderReport(report) {
  // Set URL and score
  const reportUrlEl = document.getElementById('reportUrl');
  if (reportUrlEl) {
    reportUrlEl.textContent = `URL: ${report.url}`;
  }

  const overallScoreEl = document.getElementById('overallScore');
  const gradeEl = document.getElementById('grade');
  if (overallScoreEl) overallScoreEl.textContent = report.overall_score;
  if (gradeEl) {
    gradeEl.textContent = report.grade;
    // Remove any existing grade classes
    gradeEl.className = 'grade'; // reset
    // Add class based on grade
    const gradeClass = `grade-${report.grade}`;
    if (['A', 'B', 'C', 'D', 'F'].includes(report.grade)) {
      gradeEl.classList.add(gradeClass);
    }
  }

  // Draw radar chart
  const canvas = document.getElementById('radarChart');
  if (canvas && typeof Chart !== 'undefined') {
    const categories = report.categories;
    const labels = Object.keys(categories);
    const scores = labels.map((cat) => categories[cat].score);

    new Chart(canvas.getContext('2d'), {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Category Scores',
            data: scores,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 },
          },
        },
      },
    });
  }

  // Render category details
  const categoriesDiv = document.getElementById('categories');
  if (categoriesDiv) {
    categoriesDiv.innerHTML = '';
    for (const [catName, catData] of Object.entries(report.categories)) {
      const card = document.createElement('div');
      card.className = 'category-card';

      const heading = document.createElement('h3');
      heading.textContent = `${capitalize(catName)}: ${catData.score}/100`;
      card.appendChild(heading);

      if (catData.issues && catData.issues.length > 0) {
        const ul = document.createElement('ul');
        ul.className = 'issue-list';
        catData.issues.forEach((issue) => {
          const li = document.createElement('li');
          li.className = `issue issue-${issue.status}`;
          li.innerHTML = `<strong>${escapeHtml(issue.check)}</strong>: ${escapeHtml(issue.message)}`;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      } else {
        const p = document.createElement('p');
        p.textContent = 'No issues found.';
        p.style.color = '#16a34a';
        card.appendChild(p);
      }

      categoriesDiv.appendChild(card);
    }
  }

  // Handle "Save as Public Lab Report" button
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
      } else {
        alert('This report could not be saved (missing ID). Please try again.');
      }
    });
  }
}

// ============================================================
// Utility functions
// ============================================================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
