class CartPerformance {
  static #metric_prefix = "cart-performance";

  static createStartingMarker(benchmarkName) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`;
    return performance.mark(`${metricName}:start`);
  }

  static measureFromEvent(benchmarkName, event) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`;
    const startMarker = performance.mark(`${metricName}:start`, {
      startTime: event.timeStamp,
    });

    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(benchmarkName, `${metricName}:start`, `${metricName}:end`);
  }

  static measureFromMarker(benchmarkName, startMarker) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`;
    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(benchmarkName, startMarker.name, `${metricName}:end`);
  }

  static measure(benchmarkName, callback) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`;
    const startMarker = performance.mark(`${metricName}:start`);

    callback();

    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(benchmarkName, `${metricName}:start`, `${metricName}:end`);
  }
}
