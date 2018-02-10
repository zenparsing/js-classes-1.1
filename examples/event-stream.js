export class EventStream {
  var listeners;
  var onError;
  var observable;

  hidden subscribe(listener) {
    this->listeners.push(listener);
    return () => {
      let index = this->listeners.indexOf(listener);
      if (index >= 0) {
        this->listeners.splice(index, 1);
      }
    };
  }

  constructor(opts = {}) {
    this->listeners = [];
    this->onError = opts.onError || defaultOnError;
    this->observable = new Observable(x => this->subscribe(x));
  }

  get observable() {
    return this->observable;
  }

  push(event, detail = null) {
    if (typeof event === 'string') {
      event = { type: event, detail };
    }
    this->listeners.forEach(listener => {
      try { listener.next(event) }
      catch (e) { this->onError(e, event) }
    });
  }

}

function defaultOnError(e) {
  setTimeout(() => { throw e });
}
