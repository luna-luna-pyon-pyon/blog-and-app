const display = document.getElementById('calc-display');
const grid = document.querySelector('.calc-grid');

let expr = '';

function render() {
  display.textContent = expr || '0';
}

function isOperator(ch) {
  return ['+', '-', '*', '/', '%'].includes(ch);
}

function appendValue(v) {
  if (v === '.') {
    const parts = expr.split(/[-+*/%]/);
    const current = parts[parts.length - 1] || '';
    if (current.includes('.')) return;
  }

  if (isOperator(v)) {
    if (!expr) return;
    const last = expr[expr.length - 1];
    if (isOperator(last)) {
      expr = expr.slice(0, -1) + v;
      return;
    }
  }

  expr += v;
}

function clearAll() {
  expr = '';
}

function backspace() {
  expr = expr.slice(0, -1);
}

function calculate() {
  if (!expr) return;
  if (!/^[0-9+\-*/%. ]+$/.test(expr)) return;

  try {
    const result = Function(`"use strict"; return (${expr});`)();
    if (!Number.isFinite(result)) {
      expr = '';
      display.textContent = 'Error';
      return;
    }
    expr = String(Number(result.toFixed(10)));
  } catch {
    expr = '';
    display.textContent = 'Error';
    return;
  }
}

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === 'clear') clearAll();
  else if (action === 'back') backspace();
  else if (action === 'equals') calculate();
  else if (value) appendValue(value);

  render();
});

render();
