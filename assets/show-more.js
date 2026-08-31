if (!customElements.get("show-more-button")) {
  customElements.define(
    "show-more-button",
    class ShowMoreButton extends HTMLElement {
      constructor() {
        super();
        const button = this.querySelector("button");
        if (!button) return;
        button.addEventListener("click", event => {
          this.expandShowMore(event);
          const parent = event.target ? event.target.closest(".parent-display") : null;
          const nextElementToFocus = parent ? parent.querySelector(".show-more-item") : null;
          if (nextElementToFocus && !nextElementToFocus.classList.contains("hidden")) {
            const input = nextElementToFocus.querySelector("input");
            if (input) input.focus();
          }
        });
      }
      expandShowMore(event) {
        const showMoreEl = event.target ? event.target.closest('[id^="Show-More-"]') : null;
        const parentDisplay = showMoreEl
          ? showMoreEl.closest(".parent-display")
          : event.target
            ? event.target.closest(".parent-display")
            : null;
        if (!parentDisplay) return;
        const parentWrap = parentDisplay.querySelector(".parent-wrap");
        this.querySelectorAll(".label-text").forEach(element => element.classList.toggle("hidden"));
        parentDisplay
          .querySelectorAll(".show-more-item")
          .forEach(item => item.classList.toggle("hidden"));
        if (!this.querySelector(".label-show-less")) {
          this.classList.add("hidden");
        }
      }
    }
  );
}
