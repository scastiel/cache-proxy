module.exports = (service, settings = {}, storage = localStorage) => {
  const handler = {
    get(target, key) {
      if (settings[key] && typeof target[key] === 'function') {
        return decorateMethod(target[key].bind(target), settings[key], storage)
      } else {
        return target[key]
      }
    }
  }
  return new Proxy(service, handler)
}

function decorateMethod(method, methodSettings, storage) {
  return methodSettings.async
    ? handleAsyncMethod(method, methodSettings, storage)
    : handleNonAsyncMethod(method, methodSettings, storage)
}

function getKeyForMethodAndArgs(method, args, methodSettings) {
  return methodSettings.key
    ? methodSettings.key(...args)
    : JSON.stringify({ method: method.name, args })
}

function handleNonAsyncMethod(method, methodSettings, storage) {
  return (...args) => {
    const cacheKey = getKeyForMethodAndArgs(method, args, methodSettings)
    const cacheElement = storage.getItem(cacheKey)
    if (cacheElement) {
      return JSON.parse(cacheElement).value
    } else {
      const value = method(...args)
      storage.setItem(cacheKey, JSON.stringify({ value }))
      return value
    }
  }
}

function handleAsyncMethod(method, methodSettings, storage) {
  return (...args) => {
    const cacheKey = getKeyForMethodAndArgs(method, args, methodSettings)
    const cacheElement = storage.getItem(cacheKey)
    if (cacheElement) {
      return Promise.resolve(JSON.parse(cacheElement).value)
    } else {
      return method(...args).then(value => {
        storage.setItem(cacheKey, JSON.stringify({ value }))
        return value
      })
    }
  }
}
