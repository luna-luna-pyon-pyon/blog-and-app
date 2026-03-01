(() => {
  const input = document.getElementById('demo-q');
  const log = document.getElementById('request-log');

  function addLog(text) {
    if (!log) return;
    if (log.children.length === 1 && log.textContent.includes('まだリクエストはありません')) {
      log.innerHTML = '';
    }
    const li = document.createElement('li');
    li.textContent = text;
    log.prepend(li);
  }

  document.body.addEventListener('htmx:beforeRequest', (e) => {
    if (e.target?.id !== 'demo-q') return;
    const t = new Date().toLocaleTimeString('ja-JP');
    addLog(`[${t}] request発火: "${input?.value ?? ''}"`);
  });

  document.body.addEventListener('htmx:afterSwap', (e) => {
    if (e.target?.id !== 'search-result') return;
    const t = new Date().toLocaleTimeString('ja-JP');
    addLog(`[${t}] 画面更新完了`);
  });
})();
