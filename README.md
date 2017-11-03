# cache-proxy

*cache-proxy* is a small Node package providing a simple way to put in local storage results of function calls, so next calls won't call the original function. This can be useful to minimize a number of Ajax requests for instance.

## Installation

```
npm install --save cache-proxy
```

## Usage

```js
import cacheProxy from 'cache-proxy'

// The service containing the functions we want to cache:
const service = {
  add(x, y) {
    return x + y
  },
  sub(x, y) {
    return x - y
  }
}

// Settings for the cache:
const cacheSettings = {
  add: {}
}

const cachedService = cacheProxy(service)

cachedService.add(2, 3) // calls service.add
cachedService.add(2, 3) // fetches result from local storage
cachedService.add(3, 4) // calls service.add (different arguments)
cachedService.sub(4, 3) // calls service.sub (not cached function)
```

## Options

```js
const cacheSettings = {
  /**
   * Each key represents the name of a method you want to cache.
   */
  [method]: {
    /**
     * By default the keys used in local storage are made with a JSON
     * stringification of the method name and the given parameters. Use
     * the `key` option to specify another way to do. You can for instance
     * use only some arguments, or use a more complex expression if
     * the parameters are not JSON-serializable.
     */
    key: (...args) => JSON.stringify({ method, args }),
    /**
     * Set this option to `true` if the function returns a promise
     * (i.e. is asynchronous). Instead of putting in cache the result
     * of the function (the promise), we'll wait for the promise to be
     * resolved to put in cache the value it is resolved with. The
     * function will still return a promise, but sometimes it will
     * be immediately resolved.
     */
    async: false
  }
}
```

## Important notes

* Since the result of cached functions will be put in local storage, and since local storage only allows strings to be stored in, the results must be JSON-serializable. This means they can't be object with circular references, functions, etc.
* The keys for local storage must also be strings, so if the function arguments are not JSON-serializable, use the `key` setting to build a string key from arguments.

## Caveats

* When using promises (with the `async` setting), if the function is called several times before the first called is resolved, next calls won't use cache (since the cache exists only after the first promise is resolved).

## License

Source code is distributed under [GPL-v3.0](https://www.gnu.org/licenses/gpl.html) licence.