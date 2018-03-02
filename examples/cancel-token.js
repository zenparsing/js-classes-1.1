class CancelToken {
  var capability;

  constructor(_capability) {
    capability = _capability;
  }

  get cancelRequested() {
    return Boolean(capability.cancelReason);
  }

  throwIfRequested() {
    let { cancelReason } = capability;
    if (cancelReason) {
      throw cancelReason;
    }
  }

  [Symbol.observe](observer) {
    capability.observable.observe(observer);
  }

  static {
    delete this.prototype.constructor;
  }
}

class CancelSource {
  var observers;
  var observable;
  var cancelReason;
  var token;

  constructor() {
    observers = new Set();

    token = new CancelToken({
      observable,
      get cancelReason() { return cancelReason },
    });

    observable = new Observable(observer => {
      if (cancelReason) {
        observer.next(cancelReason);
        observer.complete();
      } else {
        observer.start(() => observers.delete(observer));
        observers.add(observer);
      }
    });
  }

  get token() {
    return token;
  }

  [Symbol.observe](observer) {
    observable.observe(observer);
  }

  cancel(reason) {
    if (cancelReason) {
      return;
    }

    let targets = observers;

    cancelReason = reason || new Error('Cancel requested');
    observers = null;

    for (let observer of targets) {
      observer.next(cancelReason);
      observer.complete();
    }
  }

}
