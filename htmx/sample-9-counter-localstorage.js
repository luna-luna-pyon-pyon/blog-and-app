(() => {
  const KEY = 'demo.counter.value';
  const countEl = document.getElementById('ls-count');
  const plusBtn = document.getElementById('btn-plus');
  const minusBtn = document.getElementById('btn-minus');
  const resetBtn = document.getElementById('btn-reset');

  let count = Number(localStorage.getItem(KEY) ?? '0');
  if (!Number.isFinite(count)) count = 0;

  function render() {
    countEl.textContent = String(count);
  }

  function persist() {
    localStorage.setItem(KEY, String(count));
  }

  plusBtn.addEventListener('click', () => {
    count += 1;
    render();
    persist();
  });

  minusBtn.addEventListener('click', () => {
    count -= 1;
    render();
    persist();
  });

  resetBtn.addEventListener('click', () => {
    count = 0;
    render();
    persist();
  });

  render();
})();
