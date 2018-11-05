export class EventStream {
  let listeners, onError, observable;

  let subscribe = (listener) => {
    this::listeners.push(listener);
    return () => {
      let index = this::listeners.indexOf(listener);
      if (index >= 0) {
        this::listeners.splice(index, 1);
      }
    };
  }

  constructor(opts = {}) {
    this::listeners = [];
    this::onError = opts.onError || defaultOnError;
    this::observable = new Observable(x => this::subscribe(x));
  }

  /**
   * Looks like it should cycle, but it won't because the `observable` accessor
   * property is in a different namespace than the `observable` hidden instance
   * variable. Can be re-spelled as `return this::observable;` for clarity.
   */
  get observable() {
    return this::observable;
  }

  push(event, detail = null) {
    if (typeof event === 'string') {
      event = { type: event, detail };
    }
    this::listeners.forEach(listener => {
      try { listener.next(event) }
      catch (e) { this::onError(e, event) }
    });
  }

}

function defaultOnError(e) {
  setTimeout(() => { throw e });
}
