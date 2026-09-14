function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: `application/${type}` },
  };
}

function validateQuantityInput(inputValue, min, max, step, strings = window.quickOrderListStrings || {}) {
  let message = "";
  if (min !== undefined && min !== null && min !== "" && inputValue < parseInt(min)) {
    message = (strings.min_error || "").replace("[min]", min);
  } else if (max !== undefined && max !== null && max !== "" && inputValue > parseInt(max)) {
    message = (strings.max_error || "").replace("[max]", max);
  } else if (step && inputValue % parseInt(step || 1) !== 0) {
    message = (strings.step_error || "").replace("[step]", step);
  }
  return message;
}
