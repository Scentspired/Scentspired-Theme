/* The FAQ page's questions: one open at a time (onclick="toggleFaq(this)"). Moved from sections/content--faq.liquid. */
  function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const isActive = button.classList.contains('active');
    // Close all other FAQs
    document.querySelectorAll('.faq-question.active').forEach(q => {
      q.classList.remove('active');
      q.nextElementSibling.classList.remove('active');
    });
    // Toggle current FAQ
    if (!isActive) {
      button.classList.add('active');
      answer.classList.add('active');
    }
  }
