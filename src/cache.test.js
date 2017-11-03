const cache = require('./cache')

global.localStorage = {
  _cache: {},
  getItem(key) {
    return this._cache[key] ? JSON.parse(this._cache[key]) : undefined
  },
  setItem(key, value) {
    this._cache[key] = JSON.stringify(value)
  },
  clear() {
    this._cache = {}
  }
}

describe('Service: cache', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  describe('Base usage', () => {
    it('should call uncached method 2 times', () => {
      const testService = {
        add: jest.fn((x, y) => x + y)
      }
      const cachedService = cache(testService)
      expect(cachedService.add(2, 3)).toEqual(5)
      expect(cachedService.add(2, 3)).toEqual(5)
      expect(testService.add).toHaveBeenCalledTimes(2)
    })
    it('should call cached method one time for same arguments', () => {
      const testService = {
        add: jest.fn((x, y) => x + y)
      }
      const cachedService = cache(testService, {
        add: {}
      })
      expect(cachedService.add(2, 3)).toEqual(5)
      expect(cachedService.add(2, 3)).toEqual(5)
      expect(testService.add).toHaveBeenCalledTimes(1)
    })
    it('should call cached method one time for same arguments with local context', () => {
      const testService = {
        val: 5,
        add(x, y) {
          return x + y + this.val
        }
      }
      const spy = jest.spyOn(testService, 'add')
      const cachedService = cache(testService, {
        add: {}
      })
      expect(cachedService.add(2, 3)).toEqual(10)
      expect(cachedService.add(2, 3)).toEqual(10)
      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('should call cached method two times for distinct arguments', () => {
      const testService = {
        add: jest.fn((x, y) => x + y)
      }
      const cachedService = cache(testService, {
        add: {}
      })
      expect(cachedService.add(2, 3)).toEqual(5)
      expect(cachedService.add(4, 5)).toEqual(9)
      expect(testService.add).toHaveBeenCalledTimes(2)
    })
    it('should call cached method one time for same arguments even if returning undefined', () => {
      const testService = {
        nothing: jest.fn(() => undefined)
      }
      const cachedService = cache(testService, {
        nothing: {}
      })
      expect(cachedService.nothing()).toEqual(undefined)
      expect(cachedService.nothing()).toEqual(undefined)
      expect(testService.nothing).toHaveBeenCalledTimes(1)
    })
    it('should call cached method one time with custom key', () => {
      const testService = {
        add: jest.fn((x, y) => x.a + y.b)
      }
      const cachedService = cache(testService, {
        add: {
          key: (x, y) => `${x.a}+${y.b}`
        }
      })
      expect(cachedService.add({ a: 2, b: 4 }, { a: 3, b: 5 })).toEqual(7)
      expect(cachedService.add({ a: 2, b: 5 }, { a: 9, b: 5 })).toEqual(7)
      expect(testService.add).toHaveBeenCalledTimes(1)
    })
  })
  describe('With promises', () => {
    it('should call uncached method 2 times', async () => {
      const testService = {
        add: jest.fn(
          (x, y) => new Promise(resolve => setTimeout(resolve(x + y), 100))
        )
      }
      const cachedService = cache(testService)
      expect(await cachedService.add(2, 3)).toEqual(5)
      expect(await cachedService.add(2, 3)).toEqual(5)
      expect(testService.add).toHaveBeenCalledTimes(2)
    })
    it('should call cached method one time for same arguments', async () => {
      const testService = {
        add: jest.fn(
          (x, y) => new Promise(resolve => setTimeout(resolve(x + y), 100))
        )
      }
      const cachedService = cache(testService, {
        add: { async: true }
      })
      expect(await cachedService.add(2, 3)).toEqual(5)
      expect(await cachedService.add(2, 3)).toEqual(5)
      expect(testService.add).toHaveBeenCalledTimes(1)
    })
    it('should call cached method two times for distinct arguments', async () => {
      const testService = {
        add: jest.fn(
          (x, y) => new Promise(resolve => setTimeout(resolve(x + y), 100))
        )
      }
      const cachedService = cache(testService, {
        add: { async: true }
      })
      expect(await cachedService.add(2, 3)).toEqual(5)
      expect(await cachedService.add(4, 5)).toEqual(9)
      expect(testService.add).toHaveBeenCalledTimes(2)
    })
  })
})
