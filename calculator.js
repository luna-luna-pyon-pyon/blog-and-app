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

function precedence(op) {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/' || op === '%') return 2;
  return 0;
}

function applyOp(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? NaN : a / b;
  if (op === '%') return b === 0 ? NaN : a % b;
  return NaN;
}

function evaluateExpression(input) {
  const tokens = input.match(/\d*\.?\d+|[+\-*/%]/g);
  if (!tokens) return NaN;

  const values = [];
  const ops = [];

  for (const token of tokens) {
    if (!isNaN(token)) {
      values.push(Number(token));
      continue;
    }

    while (ops.length && precedence(ops[ops.length - 1]) >= precedence(token)) {
      const op = ops.pop();
      const b = values.pop();
      const a = values.pop();
      values.push(applyOp(a, b, op));
    }
    ops.push(token);
  }

  while (ops.length) {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    values.push(applyOp(a, b, op));
  }

  return values[0];
}

function calculate() {
  if (!expr) return;
  if (!/^[0-9+\-*/%. ]+$/.test(expr)) return;

  const result = evaluateExpression(expr);
  if (!Number.isFinite(result)) {
    expr = '';
    display.textContent = 'Error';
    return;
  }
  expr = String(Number(result.toFixed(10)));
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
