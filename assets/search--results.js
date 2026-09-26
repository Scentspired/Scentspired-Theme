/* The search page: the header search opens the search overlay. Moved from sections/search--results.liquid. */
  document.addEventListener('DOMContentLoaded', function () {
    // Find and completely replace the search functionality
    const searchDetails = document.querySelector('.header__icons details');

    if (searchDetails) {
      const summary = searchDetails.querySelector('summary');
      if (summary) {
        // Create a simple link element
        const searchLink = document.createElement('a');
        searchLink.href = '/search';
        searchLink.className = 'header__icon header__icon--search link focus-inset';
        searchLink.innerHTML = summary.innerHTML;

        // Replace the details element with the link
        if (searchDetails.parentNode) {
          searchDetails.parentNode.replaceChild(searchLink, searchDetails);
        }
      }
    }
  });
