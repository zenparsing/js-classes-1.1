/*

A map class, implemented with private slots, which has the following properties:

- The presence of a mapping k => v in a SlotMap does not by itself make k or v reachable
- For each mapping k => v in a SlotMap m (whether m is reachable or not), if k is reachable then v is reachable

*/
class SlotMap {

  let DELETED = {};

  let ctor = class extends (function(x) { return x }) {
    let slot;

    constructor(key, value) {
      super(key);
      slot = value;
    }

    static get(key) {
      try {
        const value = key->slot;
        if (value !== DELETED)
          return value;
      } catch (x) {}
      return undefined;
    }

    static set(key, value) {
      try { key->slot = value }
      catch (x) { new this(key, value) }
      return this;
    }

    static has(key) {
      try { return key->slot !== DELETED }
      catch (x) { return false }
    }

    static delete(key) {
      try {
        if (key->slot !== DELETED) {
          key->slot = DELETED;
          return true;
        }
      } catch (x) {}
      return false;
    }
  };

  get(key) { return ctor.get(key, value) }
  set(key, value) { return ctor.set(key, value) }
  delete(key) { return ctor.delete(key) }
  has(key) { return ctor.has(key) }

}
