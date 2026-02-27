function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function calculateCompoundSimulation(initial, monthly, annualRate, years) {
  const i = clampNumber(initial, 0, 1_000_000_000_000);
  const m = clampNumber(monthly, 0, 1_000_000_000);
  const r = clampNumber(annualRate, 0, 100) / 100;
  const y = Math.trunc(clampNumber(years, 1, 100));

  const monthlyRate = r / 12;
  const totalMonths = y * 12;

  let balance = i;
  const rows = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    balance = balance * (1 + monthlyRate) + m;

    if (month % 12 === 0) {
      const year = month / 12;
      const principal = i + m * month;
      const profit = balance - principal;
      rows.push({ year, balance, principal, profit });
    }
  }

  const principalTotal = i + m * totalMonths;
  const finalValue = balance;
  const profitTotal = finalValue - principalTotal;

  return { rows, principalTotal, finalValue, profitTotal };
}

function formatYen(value) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value);
}

if (typeof document !== 'undefined') {
  const initialEl = document.getElementById('initial');
  const monthlyEl = document.getElementById('monthly');
  const annualRateEl = document.getElementById('annualRate');
  const yearsEl = document.getElementById('years');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');

  const finalValueEl = document.getElementById('finalValue');
  const principalValueEl = document.getElementById('principalValue');
  const profitValueEl = document.getElementById('profitValue');
  const resultBodyEl = document.getElementById('resultBody');

  function render() {
    const initial = Number(initialEl.value);
    const monthly = Number(monthlyEl.value);
    const annualRate = Number(annualRateEl.value);
    const years = Number(yearsEl.value);

    const result = calculateCompoundSimulation(initial, monthly, annualRate, years);

    finalValueEl.textContent = formatYen(result.finalValue);
    principalValueEl.textContent = formatYen(result.principalTotal);
    profitValueEl.textContent = formatYen(result.profitTotal);

    resultBodyEl.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (const row of result.rows) {
      const tr = document.createElement('tr');

      const yearCell = document.createElement('td');
      yearCell.textContent = `${row.year}年`;

      const balanceCell = document.createElement('td');
      balanceCell.textContent = formatYen(row.balance);

      const principalCell = document.createElement('td');
      principalCell.textContent = formatYen(row.principal);

      const profitCell = document.createElement('td');
      profitCell.textContent = formatYen(row.profit);

      tr.append(yearCell, balanceCell, principalCell, profitCell);
      fragment.appendChild(tr);
    }

    resultBodyEl.appendChild(fragment);
  }

  calcBtn.addEventListener('click', render);
  resetBtn.addEventListener('click', () => {
    initialEl.value = '1000000';
    monthlyEl.value = '50000';
    annualRateEl.value = '4';
    yearsEl.value = '20';
    render();
  });

  render();
}

if (typeof module !== 'undefined') {
  module.exports = { calculateCompoundSimulation };
}
