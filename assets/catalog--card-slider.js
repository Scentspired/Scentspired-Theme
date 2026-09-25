/* The card sliders (catalog--featured-collections, bundle--collection).
 * On desktop the arrows scroll their own slider. Each section is its own
 * [data-card-slider], so two sliders on one page never share arrows (they
 * used to share element ids, and both sets of arrows drove the first slider). */
(function () {
  if (window.cardSliderLoaded) return; // every card slider section loads this file
  window.cardSliderLoaded = true;

  const ready = new WeakSet();

  function init(root) {
    if (ready.has(root)) return;
    ready.add(root);
    const track = root.querySelector('[data-card-slider-track]');
    const prev = root.querySelector('[data-card-slider-prev]');
    const next = root.querySelector('[data-card-slider-next]');
    if (!track || !prev || !next) return;
    if (window.innerWidth < 1024) return; // below 1024px the cards stack

    const step = () => track.offsetWidth * 0.9;
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  const initAll = () => document.querySelectorAll('[data-card-slider]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
  document.addEventListener('shopify:section:load', initAll);
})();
