// From https://github.com/tc39/proposal-static-class-features/issues/4

export const registry = new JSDOMRegistry();

export class JSDOM {
  var createdBy;

  hidden registerWithRegistry(registryName) {
    // ...elided...
  }

  hidden finalizeFactoryCreated(factoryName) {
    this->createdBy = factoryName;
    this->registerWithRegistry(registry);
    return this;
  }

  async static fromURL(url, options = {}) {
    normalizeFromURLOptions(options);
    normalizeOptions(options);

    const body = await getBodyFromURL(url);
    return new this(body, options)->finalizeFactoryCreated(factoryName);
  }

  async static fromFile(filename, options = {}) {
    normalizeOptions(options);

    const body = await getBodyFromFilename(filename);
    return new this(body, options)->finalizeFactoryCreated(factoryName);
  }

}

function normalizeFromURLOptions(options) {
  if (options.referrer === undefined) {
    throw new TypeError();
  }
}

function normalizeOptions(options) {
  if (options.url === undefined) {
    throw new TypeError();
  }
  options.url = (new URL(options.url)).href;
}
