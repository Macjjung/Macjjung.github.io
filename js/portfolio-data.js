// Select a registered locale without fetching, so file:// previews keep working.
(() => {
  'use strict';
  const requested = new URLSearchParams(location.search).get('lang');
  const locale = requested === 'ko' ? 'ko' : 'en';
  const data = window.PORTFOLIO_LOCALES[locale];
  if (!data) throw new Error('Missing portfolio locale: ' + locale);
  window.PORTFOLIO = data;
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
})();
