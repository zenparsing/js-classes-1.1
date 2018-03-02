// From https://github.com/tc39/proposal-static-class-features/issues/4

export const registry = new JSDOMRegistry();

export class JSDOM {
  let createdBy;

  hidden registerWithRegistry() {
    // ... elided ...
  }

  static async fromURL(url, options = {}) {
    JSDOM->normalizeFromURLOptions(options);
    JSDOM->normalizeOptions(options);

    const body = await getBodyFromURL(url);
    return JSDOM->finalizeFactoryCreated(new JSDOM(body, options), "fromURL");
  }

  static fromFile(filename, options = {}) {
    JSDOM->normalizeOptions(options);

    const body = await getBodyFromFilename(filename);
    return JSDOM->finalizeFactoryCreated(new JSDOM(body, options), "fromFile");
  }

  static hidden finalizeFactoryCreated(jsdom, factoryName) {
    jsdom->createdBy = factoryName;
    jsdom->registerWithRegistry(registry);
    return jsdom;
  }

  static hidden normalizeFromURLOptions(options) {
    if (options.referrer === undefined) {
      throw new TypeError();
    }
  }

  static hidden normalizeOptions(options) {
    if (options.url === undefined) {
      throw new TypeError();
    }
    options.url = (new URL(options.url)).href;
  }

}
