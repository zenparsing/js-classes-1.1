export class EventStream {
  let _listeners = [];
  let _onError;
  let _observable;

  constructor(opts = {}) {
    _onError = opts.onError || defaultOnError;
    _observable = new Observable(sink => {
      _listeners.push(sink);
      return () => {
        let index = _listeners.indexOf(sink);
        if (index >= 0) {
          _listeners.splice(index, 1);
        }
      };
    });
  }

  get observable() {
    return _observable;
  }

  push(event, detail = null) {
    if (typeof event === 'string') {
      event = { type: event, detail };
    }
    _listeners.forEach(listener => {
      try { listener.next(event) } catch (e) { _onError(e, event) }
    });
  }

}

function defaultOnError(e) {
  setTimeout(() => { throw e });
}
