/* ==========================================================================
   AI TRANSLATOR — FRONTEND INTERACTIONS + BACKEND CALL
   Talks to a single endpoint: POST /translate
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------ *
   * ELEMENT REFERENCES (declared ONCE, used everywhere below)
   * ------------------------------------------------------------------ */
  const form = document.getElementById('translationForm');
  const textInput = document.getElementById('textInput');
  const sourceLanguage = document.getElementById('sourceLanguage');
  const targetLanguage = document.getElementById('targetLanguage');
  const translateBtn = document.getElementById('translateBtn');
  const translatedText = document.getElementById('translatedText');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const swapBtn = document.getElementById('swapBtn');
  const characterCount = document.getElementById('characterCount');
  const outputCharCount = document.getElementById('outputCharCount');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const detectedLanguage = document.getElementById('detectedLanguage');
  const statusMessage = document.getElementById('statusMessage');
  const outputPanel = document.querySelector('.output-panel');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const toastContainer = document.getElementById('toastContainer');
  const currentYearEl = document.getElementById('currentYear');

  const MAX_CHARS = 2000;
  const LANGUAGE_LABELS = {
    auto: 'Auto Detect', en: 'English', ur: 'Urdu', fr: 'French', de: 'German',
    es: 'Spanish', ar: 'Arabic', hi: 'Hindi', zh: 'Chinese', ja: 'Japanese', ko: 'Korean'
  };

  /* ------------------------------------------------------------------ *
   * FOOTER YEAR
   * ------------------------------------------------------------------ */
  if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ *
   * CHARACTER COUNTER
   * ------------------------------------------------------------------ */
  function updateCharacterCount() {
    const len = textInput.value.length;
    characterCount.textContent = `${len} / ${MAX_CHARS}`;
    characterCount.classList.remove('is-near-limit', 'is-at-limit');
    if (len >= MAX_CHARS) {
      characterCount.classList.add('is-at-limit');
    } else if (len >= MAX_CHARS * 0.9) {
      characterCount.classList.add('is-near-limit');
    }
  }
  textInput.addEventListener('input', updateCharacterCount);
  updateCharacterCount();

  /* ------------------------------------------------------------------ *
   * TOAST NOTIFICATIONS
   * ------------------------------------------------------------------ */
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  }

  /* ------------------------------------------------------------------ *
   * SWAP LANGUAGES
   * ------------------------------------------------------------------ */
  swapBtn.addEventListener('click', () => {
    if (sourceLanguage.value === 'auto') {
      showToast("Can't swap while source is Auto Detect", 'error');
      return;
    }
    const temp = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = temp;

    swapBtn.classList.add('is-spinning');
    window.setTimeout(() => swapBtn.classList.remove('is-spinning'), 320);

    showToast('Languages swapped', 'success', 1800);
  });

  /* ------------------------------------------------------------------ *
   * CLEAR INPUT
   * ------------------------------------------------------------------ */
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    updateCharacterCount();
    textInput.focus();
    resetOutput();
    showToast('Input cleared', 'info', 1800);
  });

  function resetOutput() {
    translatedText.innerHTML = '<span class="placeholder-text">Your translation will appear here...</span>';
    outputCharCount.textContent = '';
    detectedLanguage.hidden = true;
    setStatus('Ready', 'idle');
  }

  /* ------------------------------------------------------------------ *
   * COPY OUTPUT
   * ------------------------------------------------------------------ */
  copyBtn.addEventListener('click', async () => {
    const text = translatedText.textContent.trim();
    if (!text || translatedText.querySelector('.placeholder-text')) {
      showToast('Nothing to copy yet', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'success', 1800);
    } catch (err) {
      showToast('Could not copy — copy manually', 'error');
    }
  });

  /* ------------------------------------------------------------------ *
   * STATUS PILL HELPER
   * ------------------------------------------------------------------ */
  function setStatus(label, state) {
    statusMessage.textContent = label;
    statusMessage.classList.remove('is-busy', 'is-done');
    if (state === 'busy') statusMessage.classList.add('is-busy');
    if (state === 'done') statusMessage.classList.add('is-done');
  }

  /* ------------------------------------------------------------------ *
   * TRANSLATE — calls your FastAPI backend at POST /translate
   *
   * Expected request:  multipart/form-data
   *   text              -> raw text to translate
   *   source_language   -> e.g. "Auto Detect", "English", "Urdu", ...
   *   target_language   -> e.g. "Urdu"
   *
   * Expected JSON response:
   *   {
   *     "translated_text": "...",
   *     "detected_language": "..."   // optional, only if source was Auto Detect
   *   }
   * ------------------------------------------------------------------ */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = textInput.value.trim();
    if (!text) {
      showToast('Enter some text before translating', 'error');
      textInput.focus();
      return;
    }

    // --- loading state ---
    setStatus('Translating…', 'busy');
    loadingSpinner.hidden = false;
    outputPanel.classList.add('is-translating');
    translateBtn.disabled = true;
    translatedText.innerHTML = '<span class="placeholder-text">Working on it...</span>';
    detectedLanguage.hidden = true;

    const formData = new FormData();
    formData.append('text', text);
    formData.append('source_language', LANGUAGE_LABELS[sourceLanguage.value] || sourceLanguage.value);
    formData.append('target_language', LANGUAGE_LABELS[targetLanguage.value] || targetLanguage.value);

    try {
      const response = await fetch('/translate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      translatedText.textContent = data.translated_text;
      outputCharCount.textContent = `${data.translated_text.length} chars`;

      if (data.detected_language) {
        detectedLanguage.hidden = false;
        detectedLanguage.textContent = `Detected: ${data.detected_language}`;
      } else {
        detectedLanguage.hidden = true;
      }

      setStatus('Done', 'done');
      showToast(`Ready in ${LANGUAGE_LABELS[targetLanguage.value] || targetLanguage.value}`, 'success');

    } catch (error) {
      console.error('Translation request failed:', error);
      translatedText.innerHTML = '<span class="placeholder-text">Translation failed. Please try again.</span>';
      outputCharCount.textContent = '';
      setStatus('Error', 'idle');
      showToast('Translation failed — check the server and try again', 'error');

    } finally {
      loadingSpinner.hidden = true;
      outputPanel.classList.remove('is-translating');
      translateBtn.disabled = false;
    }
  });

  /* ------------------------------------------------------------------ *
   * BUTTON RIPPLE EFFECT
   * ------------------------------------------------------------------ */
  document.querySelectorAll('[data-ripple]').forEach((btn) => {
    btn.addEventListener('click', function (event) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ------------------------------------------------------------------ *
   * DARK MODE TOGGLE
   * ------------------------------------------------------------------ */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorageSafeSet('ai-translator-theme', theme);
  }

  function localStorageSafeSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) { /* no-op */ }
  }
  function localStorageSafeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  const savedTheme = localStorageSafeGet('ai-translator-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  darkModeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info', 1600);
  });

  /* ------------------------------------------------------------------ *
   * SMOOTH SCROLLING FOR ANCHOR LINKS
   * ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});