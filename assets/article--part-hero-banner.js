/* Article hero banner: in a heading that names the brand, "spired" is set in italic
 * ("Scent<span class="italic-text">spired</span>"). Every heading marked
 * data-brand-italic, once; each banner loads this after its markup. It was a custom
 * element defined per block (luxury-banner-<id>) that did only this. */
(function () {
  document.querySelectorAll('[data-brand-italic]:not([data-brand-italic-done])').forEach(function (heading) {
    heading.setAttribute('data-brand-italic-done', '');
    var text = heading.textContent.trim();
    if (/Scentspired/i.test(text)) {
      heading.innerHTML = text.replace(/(Scent)(spired)/i, '$1<span class="italic-text">$2</span>');
    }
  });
})();
