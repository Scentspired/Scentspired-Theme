class BulkAdd extends HTMLElement {
  static ASYNC_REQUEST_DELAY = 250;

  constructor() {
    super();
    this.queue = [];
    this.setRequestStarted(false);
    this.ids = [];
  }

  startQueue(id, quantity) {
    this.queue.push({ id, quantity });

    const interval = setInterval(() => {
      if (this.queue.length > 0) {
        if (!this.requestStarted) {
          this.sendRequest(this.queue);
        }
      } else {
        clearInterval(interval);
      }
    }, BulkAdd.ASYNC_REQUEST_DELAY);
  }

  sendRequest(queue) {
    this.setRequestStarted(true);
    const items = {};

    queue.forEach(queueItem => {
      items[parseInt(queueItem.id)] = queueItem.quantity;
    });
    this.queue = this.queue.filter(queueElement => !queue.includes(queueElement));

    this.updateMultipleQty(items);
  }

  setRequestStarted(requestStarted) {
    this._requestStarted = requestStarted;
  }

  get requestStarted() {
    return this._requestStarted;
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    if (input) {
      input.value = input.getAttribute("value") || "";
    }
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    if (!event || !event.target) return;
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    if (typeof event.target.select === "function") event.target.select();
  }

  validateQuantity(event) {
    if (!event || !event.target) return;
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    const message = validateQuantityInput(
      inputValue,
      event.target.dataset.min,
      event.target.max,
      event.target.step,
      window.quickOrderListStrings
    );

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity("");
      event.target.reportValidity();
      event.target.setAttribute("value", inputValue);
      this.startQueue(index, inputValue);
    }
  }

  getSectionInnerHTML(html, selector) {
    return HTMLUpdateUtility.getSectionInnerHTML(html, selector);
  }
}

if (!customElements.get("bulk-add")) {
  customElements.define("bulk-add", BulkAdd);
}
