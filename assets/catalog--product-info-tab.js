/* The product info tabs: desktop tabs, mobile accordion, ingredients pages, FAQ toggles. Moved from sections/catalog--product-info-tab.liquid. */
  let currentIngredientsPage = 1;
  const ingredientsPerPage = 6;
  let totalIngredients = 0;

  function initializeIngredientsPagination() {
    const table = document.getElementById('ingredientsTable');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    totalIngredients = rows.length;

    const pagination = document.getElementById('ingredientsPagination');
    if (totalIngredients <= ingredientsPerPage) {
      if (pagination) pagination.classList.add('hidden');
      rows.forEach(row => row.classList.add('visible'));
    } else {
      if (pagination) pagination.classList.remove('hidden');
      showIngredientsPage(1);
    }
  }

  function showIngredientsPage(page) {
    const table = document.getElementById('ingredientsTable');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => row.classList.remove('visible'));

    const startIndex = (page - 1) * ingredientsPerPage;
    const endIndex = Math.min(startIndex + ingredientsPerPage, totalIngredients);

    for (let i = startIndex; i < endIndex; i++) {
      if (rows[i]) {
        rows[i].classList.add('visible');
      }
    }

    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');

    if (prevArrow) prevArrow.disabled = page === 1;
    if (nextArrow) nextArrow.disabled = endIndex >= totalIngredients;
  }

  function changeIngredientsPage(direction) {
    const maxPages = Math.ceil(totalIngredients / ingredientsPerPage);
    const newPage = currentIngredientsPage + direction;

    if (newPage >= 1 && newPage <= maxPages) {
      currentIngredientsPage = newPage;
      showIngredientsPage(currentIngredientsPage);
    }
  }

  document.querySelectorAll('.tab-nav button').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.getAttribute('data-tab');
      document.querySelectorAll('.tab-nav button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
      if (tab) {
        const tabEl = document.getElementById(tab);
        if (tabEl) tabEl.classList.add('active');
      }

      if (tab === 'ingredients') {
        setTimeout(initializeIngredientsPagination, 100);
      }
    });
  });

  document.querySelectorAll('.mobile-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const tab = header.getAttribute('data-mobile-tab');
      const content = document.getElementById('mobile-' + tab);
      const isCurrentlyActive = header.classList.contains('active');

      // If clicking on the already open tab, close it
      if (isCurrentlyActive) {
        header.classList.remove('active');
        content.classList.remove('active');
        content.innerHTML = '';
        return;
      }

      // Close all other tabs - IMPORTANT: Only one tab open at a time
      document.querySelectorAll('.mobile-accordion-header').forEach(h => {
        h.classList.remove('active');
      });
      document.querySelectorAll('.mobile-accordion-content').forEach(c => {
        c.classList.remove('active');
        c.innerHTML = '';
      });

      // Open the clicked tab
      header.classList.add('active');
      content.classList.add('active');

      // Scroll to the opened tab header
      setTimeout(() => {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);

      const desktopPanel = document.getElementById(tab);
      if (desktopPanel) {
        content.innerHTML = '<div class="mobile-tab-content">' + desktopPanel.innerHTML + '</div>';
      }

      if (tab === 'ingredients') {
        const mobileIngredientsTable = content.querySelector('#ingredientsTable');
        if (mobileIngredientsTable) {
          mobileIngredientsTable.id = 'mobileIngredientsTable';
          const mobilePagination = content.querySelector('#ingredientsPagination');
          if (mobilePagination) mobilePagination.id = 'mobileIngredientsPagination';
          const mobilePrevArrow = content.querySelector('#prevArrow');
          if (mobilePrevArrow) mobilePrevArrow.id = 'mobilePrevArrow';
          const mobileNextArrow = content.querySelector('#nextArrow');
          if (mobileNextArrow) mobileNextArrow.id = 'mobileNextArrow';

          let mobileCurrentIngredientsPage = 1;
          let mobileTotalIngredients = mobileIngredientsTable.querySelectorAll('tbody tr').length;

          function showMobileIngredientsPage(page) {
            const rows = mobileIngredientsTable.querySelectorAll('tbody tr');
            rows.forEach(row => row.classList.remove('visible'));
            const startIndex = (page - 1) * ingredientsPerPage;
            const endIndex = Math.min(startIndex + ingredientsPerPage, mobileTotalIngredients);
            for (let i = startIndex; i < endIndex; i++) {
              if (rows[i]) {
                rows[i].classList.add('visible');
              }
            }
            const prevArrow = document.getElementById('mobilePrevArrow');
            const nextArrow = document.getElementById('mobileNextArrow');
            if (prevArrow) prevArrow.disabled = page === 1;
            if (nextArrow) nextArrow.disabled = endIndex >= mobileTotalIngredients;
          }

          function changeMobileIngredientsPage(direction) {
            const maxPages = Math.ceil(mobileTotalIngredients / ingredientsPerPage);
            const newPage = mobileCurrentIngredientsPage + direction;
            if (newPage >= 1 && newPage <= maxPages) {
              mobileCurrentIngredientsPage = newPage;
              showMobileIngredientsPage(mobileCurrentIngredientsPage);
            }
          }

          const newPrevArrow = document.getElementById('mobilePrevArrow');
          if (newPrevArrow) newPrevArrow.onclick = () => changeMobileIngredientsPage(-1);
          const newNextArrow = document.getElementById('mobileNextArrow');
          if (newNextArrow) newNextArrow.onclick = () => changeMobileIngredientsPage(1);

          if (mobileTotalIngredients <= ingredientsPerPage) {
            if (mobilePagination) mobilePagination.classList.add('hidden');
            mobileIngredientsTable.querySelectorAll('tbody tr').forEach(row => row.classList.add('visible'));
          } else {
            if (mobilePagination) mobilePagination.classList.remove('hidden');
            showMobileIngredientsPage(1);
          }
        }
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('faq-question')) {
      e.target.parentElement.classList.toggle('open');
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    initializeIngredientsPagination();
  });
