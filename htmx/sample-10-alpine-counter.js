function counter() {
  const KEY = 'demo.alpine.counter';
  return {
    count: 0,
    init() {
      const n = Number(localStorage.getItem(KEY) ?? '0');
      this.count = Number.isFinite(n) ? n : 0;
    },
    persist() {
      localStorage.setItem(KEY, String(this.count));
    },
    inc() {
      this.count += 1;
      this.persist();
    },
    dec() {
      this.count -= 1;
      this.persist();
    },
    reset() {
      this.count = 0;
      this.persist();
    }
  }
}

window.counter = counter;
