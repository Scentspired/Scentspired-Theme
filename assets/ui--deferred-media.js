class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener("click", this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(this.querySelector("template").content.firstElementChild.cloneNode(true));

      this.setAttribute("loaded", true);
      const deferredElement = this.appendChild(
        content.querySelector("video, model-viewer, iframe")
      );
      if (focus) deferredElement.focus();
      if (deferredElement.nodeName == "VIDEO" && deferredElement.getAttribute("autoplay")) {
        // force autoplay for safari
        deferredElement.play();
      }

      // Workaround for safari iframe bug
      const formerStyle = deferredElement.getAttribute("style");
      deferredElement.setAttribute("style", "display: block;");
      window.setTimeout(() => {
        deferredElement.setAttribute("style", formerStyle);
      }, 0);
    }
  }
}

if (!customElements.get("deferred-media")) {
  customElements.define("deferred-media", DeferredMedia);
}
