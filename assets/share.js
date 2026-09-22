if (!customElements.get("share-button")) {
  customElements.define(
    "share-button",
    class ShareButton extends DetailsDisclosure {
      constructor() {
        super();

        this.elements = {
          shareButton: this.querySelector("button"),
          shareSummary: this.querySelector("summary"),
          closeButton: this.querySelector(".share-button__close"),
          successMessage: this.querySelector('[id^="ShareMessage"]'),
          urlInput: this.querySelector("input"),
        };
        this.urlToShare = this.elements.urlInput
          ? this.elements.urlInput.value
          : document.location.href;

        if (navigator.share) {
          if (this.mainDetailsToggle) this.mainDetailsToggle.setAttribute("hidden", "");
          if (this.elements.shareButton) {
            this.elements.shareButton.classList.remove("hidden");
            this.elements.shareButton.addEventListener("click", () => {
              navigator.share({ url: this.urlToShare, title: document.title });
            });
          }
        } else if (this.mainDetailsToggle) {
          this.mainDetailsToggle.addEventListener("toggle", this.toggleDetails.bind(this));
          const copyBtn = this.mainDetailsToggle.querySelector(".share-button__copy");
          if (copyBtn) copyBtn.addEventListener("click", this.copyToClipboard.bind(this));
          const closeBtn = this.mainDetailsToggle.querySelector(".share-button__close");
          if (closeBtn) closeBtn.addEventListener("click", this.close.bind(this));
        }
      }

      toggleDetails() {
        if (this.mainDetailsToggle && !this.mainDetailsToggle.open) {
          if (this.elements.successMessage) {
            this.elements.successMessage.classList.add("hidden");
            this.elements.successMessage.textContent = "";
          }
          if (this.elements.closeButton) this.elements.closeButton.classList.add("hidden");
          if (this.elements.shareSummary) this.elements.shareSummary.focus();
        }
      }

      copyToClipboard() {
        if (!this.elements.urlInput) return;
        navigator.clipboard.writeText(this.elements.urlInput.value).then(() => {
          if (this.elements.successMessage) {
            this.elements.successMessage.classList.remove("hidden");
            this.elements.successMessage.textContent =
              window.accessibilityStrings?.shareSuccess || "Link copied!";
          }
          if (this.elements.closeButton) {
            this.elements.closeButton.classList.remove("hidden");
            this.elements.closeButton.focus();
          }
        });
      }

      updateUrl(url) {
        this.urlToShare = url;
        if (this.elements.urlInput) this.elements.urlInput.value = url;
      }
    }
  );
}
