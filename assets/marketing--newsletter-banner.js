/* The newsletter banner's sign-up (Klaviyo). The list from #newsletterBannerConfig, wording from #newsletterBannerStrings. Moved from sections/marketing--newsletter-banner.liquid. */
  document.addEventListener('DOMContentLoaded', () => {
    const strings = JSON.parse((document.getElementById('newsletterBannerStrings') || {}).textContent || '{}');
    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailNews');
    const button = document.getElementById('newsletterBtn');
    const buttonText = document.getElementById('newsletterBtnText');
    const message = document.getElementById('newsletterMessage');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;

      // Disable button and show "Submitting…"
      button.disabled = true;
      buttonText.textContent = strings.submitting;
      buttonText.style.color = '#000'; // force black text

      try {
        const response = await fetch('https://manage.kmail-lists.com/ajax/subscriptions/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            // the region's Klaviyo list (region.json, newsletter.klaviyo_list_id)
            g: JSON.parse((document.getElementById('newsletterBannerConfig') || {}).textContent || '{}').klaviyoListId,
            email: email,
          }),
        });

        if (response.ok) {
          buttonText.textContent = strings.thanks;
          buttonText.style.color = '#000'; // keep black
          emailInput.value = '';

          // Keep the success text for 3s
          setTimeout(() => {
            button.disabled = false;
            buttonText.textContent = strings.submit;
            buttonText.style.color = '#000'; // reset black
          }, 3000);
        } else {
          throw new Error(`subscribe ${response.status}`);
        }
      } catch (err) {
        buttonText.textContent = strings.tryAgain;
        buttonText.style.color = '#000'; // black for error
        setTimeout(() => {
          button.disabled = false;
          buttonText.textContent = strings.submit;
          buttonText.style.color = '#000'; // reset
        }, 3000);
      }
    });
  });
