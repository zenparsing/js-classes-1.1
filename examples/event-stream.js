export class EventStream {
  let listeners, onError, observable;

  let subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      let index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }

  constructor(opts = {}) {
    listeners = [];
    onError = opts.onError || defaultOnError;
    observable = new Observable(x => subscribe(x));
  }

  /**
   * Looks like it should cycle, but it won't because the `observable` accessor
   * property is in a different namespace than the `observable` hidden instance
   * variable. Can be re-spelled as `return this::observable;` for clarity.
   */
  get observable() {
    return observable;
  }

  push(event, detail = null) {
    if (typeof event === 'string') {
      event = { type: event, detail };
    }
    listeners.forEach(listener => {
      try { listener.next(event) }
      catch (e) { onError(e, event) }
    });
  }

}

function defaultOnError(e) {
  setTimeout(() => { throw e });
}
