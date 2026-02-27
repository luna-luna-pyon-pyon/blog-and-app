const textArea = document.getElementById('sourceText');
const clearBtn = document.getElementById('clearBtn');

const charsWithSpacesEl = document.getElementById('charsWithSpaces');
const charsWithoutSpacesEl = document.getElementById('charsWithoutSpaces');
const wordCountEl = document.getElementById('wordCount');
const lineCountEl = document.getElementById('lineCount');
const paragraphCountEl = document.getElementById('paragraphCount');
const readingTimeEl = document.getElementById('readingTime');

const WORDS_PER_MINUTE = 400;

function countWords(text) {
  if (!text.trim()) return 0;

  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
    let count = 0;
    for (const part of segmenter.segment(text)) {
      if (part.isWordLike) count += 1;
    }
    return count;
  }

  const matches = text.match(/[\p{L}\p{N}_'-]+/gu);
  return matches ? matches.length : 0;
}

function updateCounts() {
  const text = textArea.value;

  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s/gu, '').length;
  const wordCount = countWords(text);
  const lineCount = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/u).length;
  const paragraphCount = text.trim() ? text.trim().split(/\n\s*\n/u).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  charsWithSpacesEl.textContent = String(charsWithSpaces);
  charsWithoutSpacesEl.textContent = String(charsWithoutSpaces);
  wordCountEl.textContent = String(wordCount);
  lineCountEl.textContent = String(lineCount);
  paragraphCountEl.textContent = String(paragraphCount);
  readingTimeEl.textContent = wordCount === 0 ? '0分' : `${readingMinutes}分`;
}

textArea.addEventListener('input', updateCounts);
clearBtn.addEventListener('click', () => {
  textArea.value = '';
  updateCounts();
  textArea.focus();
});

updateCounts();
