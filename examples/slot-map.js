/*

A map class, implemented with private slots, which has the following properties:

- The presence of a mapping k => v in a SlotMap does not by itself make k or v reachable
- For each mapping k => v in a SlotMap m (whether m is reachable or not), if k is reachable then v is reachable

*/
const DELETED = {};

class SlotMap {
  var ctor;

  constructor() { this->ctor = createCtor() }
  get(key) { return this->ctor.get(key, value) }
  set(key, value) { return this->ctor.set(key, value) }
  delete(key) { return this->ctor.delete(key) }
  has(key) { return this->ctor.has(key) }

  hidden createCtor() {
    return class extends (function(x) { return x }) {
      var slot;

      constructor(key, value) {
        super(key);
        this->slot = value;
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
  }

}
