if (!customElements.get("product-modal")) {
  customElements.define(
    "product-modal",
    class ProductModal extends ModalDialog {
      constructor() {
        super();
      }

      hide() {
        super.hide();
      }

      show(opener) {
        super.show(opener);
        this.showActiveMedia();
      }

      showActiveMedia() {
        if (!this.openedBy) return;
        const mediaId = this.openedBy.getAttribute("data-media-id");
        this.querySelectorAll(`[data-media-id]:not([data-media-id="${mediaId}"])`).forEach(
          element => {
            element.classList.remove("active");
          }
        );
        const activeMedia = this.querySelector(`[data-media-id="${mediaId}"]`);
        if (!activeMedia) return;
        const activeMediaTemplate = activeMedia.querySelector("template");
        const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
        activeMedia.classList.add("active");
        activeMedia.scrollIntoView();

        const container = this.querySelector('[role="document"]');
        if (container) {
          container.scrollLeft =
            ((activeMedia.width || activeMedia.clientWidth || 0) - container.clientWidth) / 2;
        }

        if (
          activeMedia.nodeName == "DEFERRED-MEDIA" &&
          activeMediaContent &&
          activeMediaContent.querySelector(".js-youtube") &&
          typeof activeMedia.loadContent === "function"
        )
          activeMedia.loadContent();
      }
    }
  );
}
