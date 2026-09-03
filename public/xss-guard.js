(function (global) {
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"'`]/g, function (ch) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
      })[ch];
    });
  }

  function colorizeTerminal(raw) {
    return escapeHtml(raw)
      .replace(/\[\+\] PASS:/g, '<span style="color: #4ade80;">[+] PASS:</span>')
      .replace(/\[-\] FAIL:/g, '<span style="color: #f87171;">[-] FAIL:</span>')
      .replace(/\[\~\] WARNING:/g, '<span style="color: #facc15;">[~] WARNING:</span>')
      .replace(/\[!\] CRITICAL:/g, '<span style="color: #f87171; font-weight:bold;">[!] CRITICAL:</span>')
      .replace(/\[FAIL\] STATUS:/g, '<span style="color: #f87171; font-weight:bold;">[FAIL] STATUS:</span>')
      .replace(/\[PASS\] STATUS:/g, '<span style="color: #4ade80; font-weight:bold;">[PASS] STATUS:</span>')
      .replace(/\[WARN\] STATUS:/g, '<span style="color: #facc15; font-weight:bold;">[WARN] STATUS:</span>');
  }

  function safeHttpsUrl(value) {
    var s = String(value == null ? '' : value).trim();
    if (!/^https:\/\//i.test(s)) return '';
    return escapeHtml(s);
  }

  global.CLEscape = escapeHtml;
  global.CLColorize = colorizeTerminal;
  global.CLSafeHttpsUrl = safeHttpsUrl;
})(window);
