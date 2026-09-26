/* The fragrance finder's quiz. Perfumes from #finderPerfumes, reasons from #finderReasons, wording from #finderStrings. Moved from sections/media--hero.liquid. */
  const perfumeDatabase = JSON.parse((document.getElementById('finderPerfumes') || {}).textContent || '[]');

  /*
   * Live store data (a region without a hero-perfumes data file): gender and
   * scent family come from metafields where set, otherwise from the tag that
   * matches one of this quiz's own answers. Sold-out perfumes, and products
   * that are not finder perfumes (no scent family), are left out.
   * For a data file this changes nothing: every entry already has both, and
   * none carries `available`.
   */
  (function useLiveCatalogue() {
    const answers = (field) =>
      [...document.querySelectorAll(`.quiz-step[data-matches-perfume-field="${field}"] [data-answer]`)].map((b) => b.dataset.answer);
    const genders = answers('category');
    const families = answers('scent_family');
    for (let i = perfumeDatabase.length - 1; i >= 0; i--) {
      const p = perfumeDatabase[i];
      const tags = p.tags || [];
      if (!p.category) p.category = genders.find((g) => tags.includes(g)) || '';
      if (!p.scent_family) p.scent_family = families.find((f) => tags.includes(f)) || '';
      if (p.available === false || !p.scent_family) perfumeDatabase.splice(i, 1);
    }
  })();

  // The questions, from the region's content (rendered above); answers[i] is the
  // card chosen for questionSteps[i].
  const questionSteps = [...document.querySelectorAll('.quiz-step[data-question]')];
  const finderStrings = JSON.parse((document.getElementById('finderStrings') || {}).textContent || '{}');
  let quizAnswers = { userName: '', answers: [] };

  let currentStep = 0;
  let recommendedPerfume = null;

  const quizTriggerBtn = document.getElementById('quiz-trigger-btn');
  const closeQuizBtn = document.getElementById('close-quiz-btn');
  const quizModal = document.getElementById('quiz-modal');
  const quizCards = document.querySelectorAll('.quiz-card');
  const restartBtn = document.getElementById('restart-quiz-btn');
  const viewProductBtn = document.getElementById('view-product-btn');
  const nameInput = document.getElementById('user-name-input');
  const nameNextBtn = document.getElementById('name-next-btn');
  const backBtns = document.querySelectorAll('.quiz-back-btn');

  // Open modal
  quizTriggerBtn.addEventListener('click', e => {
    e.preventDefault();
    quizModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    currentStep = 0;
    showStep(0);
  });

  // Close modal
  closeQuizBtn.addEventListener('click', closeModal);
  quizModal.addEventListener('click', e => {
    if (e.target === quizModal.querySelector('.quiz-modal-overlay')) closeModal();
  });

  function closeModal() {
    quizModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  // <CHANGE> Name input handler
  nameNextBtn.addEventListener('click', () => {
    if (nameInput.value.trim()) {
      quizAnswers.userName = nameInput.value.trim();
      currentStep = 1;
      showStep(1);
    }
  });

  nameInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && nameInput.value.trim()) {
      quizAnswers.userName = nameInput.value.trim();
      currentStep = 1;
      showStep(1);
    }
  });

  // Handle quiz card clicks
  quizCards.forEach(card => {
    card.addEventListener('click', () => {
      const step = card.closest('.quiz-step');
      const siblings = step.querySelectorAll('.quiz-card');

      siblings.forEach(s => s.classList.remove('selected'));
      card.classList.add('selected');

      quizAnswers.answers[currentStep - 1] = card;

      setTimeout(() => {
        if (currentStep < questionSteps.length) {
          currentStep++;
          showStep(currentStep);
        } else {
          showStep('loading');
          setTimeout(() => getRecommendation(), 1500);
        }
      }, 300);
    });
  });

  // Back button
  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  function showStep(stepNum) {
    document.querySelectorAll('.quiz-step').forEach(s => s.classList.add('hidden'));
    const targetStep = document.querySelector(`[data-step="${stepNum}"]`);
    if (targetStep) targetStep.classList.remove('hidden');
  }

  function getRecommendation() {
    recommendedPerfume = findBestMatch(quizAnswers.answers);
    displayRecommendation(recommendedPerfume);
  }

  /*
   * Each question scores from its content: one with matches_perfume_field gives
   * points_for_match when the chosen answer (or an answer that suits every
   * answer, like Unisex) equals that field of the perfume; any other gives the
   * chosen answer's points to perfumes in its for_scent_families (empty: all).
   */
  function findBestMatch(answers) {
    let scores = perfumeDatabase.map(perfume => {
      let score = 0;
      questionSteps.forEach((step, i) => {
        const chosen = answers[i];
        if (!chosen) return;
        const field = step.dataset.matchesPerfumeField;
        if (field) {
          const suitsEvery = [...step.querySelectorAll('[data-suits-every-answer]')].map(c => c.dataset.answer);
          if (suitsEvery.includes(perfume[field]) || perfume[field] === chosen.dataset.answer) {
            score += Number(step.dataset.pointsForMatch) || 0;
          }
        } else {
          const families = (chosen.dataset.forScentFamilies || '').split(',').filter(Boolean);
          if (!families.length || families.includes(perfume.scent_family)) score += Number(chosen.dataset.points) || 0;
        }
      });
      return { perfume, score };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores[0].perfume;
  }

  // <CHANGE> Display recommendation with user name
  function displayRecommendation(perfume) {
    if (!perfume) return;
    const reasons = JSON.parse((document.getElementById('finderReasons') || {}).textContent || '{}');

    const uName = document.getElementById('result-user-name');
    if (uName) uName.textContent = quizAnswers.userName;
    const pName = document.getElementById('result-perfume-name');
    if (pName) pName.textContent = perfume.name;
    const pInsp = document.getElementById('result-inspired-by');
    if (pInsp) pInsp.textContent = perfume.originalName ? finderStrings.inspiredBy.replace('[name]', () => perfume.originalName) : '';
    const pHead = document.getElementById('result-head-notes');
    if (pHead) pHead.textContent = perfume.head_notes;
    const pHeart = document.getElementById('result-heart-notes');
    if (pHeart) pHeart.textContent = perfume.heart_notes;
    const pBase = document.getElementById('result-base-notes');
    if (pBase) pBase.textContent = perfume.base_notes;
    const pAi = document.getElementById('result-ai-reason');
    if (pAi) {
      pAi.textContent =
        reasons[perfume.scent_family] ||
        finderStrings.reasonFallback
          .replace('[scent_family]', () => perfume.scent_family)
          .replace('[category]', () => perfume.category)
          .replace('[name]', () => perfume.name);
    }

    if (viewProductBtn) {
      // The live catalogue carries each product's real address. The data file
      // does not, so its link is still derived from the name — which is why
      // "Heaven's Pour" and "L'Infini" 404 there and not on the live path.
      const productHandle = (perfume.name || '').toLowerCase().replace(/\s+/g, '-');
      viewProductBtn.href = perfume.url || `${window.Shopify.routes.root}products/${productHandle}`;
    }

    showStep('results');
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      quizAnswers = { userName: '', answers: [] };
      currentStep = 0;
      if (nameInput) nameInput.value = '';
      document.querySelectorAll('.quiz-card').forEach(card => card.classList.remove('selected'));
      showStep(0);
    });
  }
