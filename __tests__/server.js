/* eslint-env jest */
const Server = require('../lib/server')
const error = require('../error')

describe('dispatch', () => {
  test('should call the handler function', async () => {
    const handler = jest.fn()
    const server = new Server(handler)

    await server.dispatch('foo', ['bar', 100])
    expect(handler).toBeCalledWith('foo', ['bar', 100])
  })

  test('should return the result of handler function', async () => {
    const handler = jest.fn(() => 'okay')
    const server = new Server(handler)

    await expect(server.dispatch('foo', ['bar', 100])).resolves.toBe('okay')
  })

  test('should rethrow error if the error has message and code', async () => {
    const handler = jest.fn(() => {
      const error = new Error('foo')
      error.code = 100
      throw error
    })
    const server = new Server(handler)

    await expect(server.dispatch('foo', ['bar', 100])).rejects.toThrow('foo')
  })

  test('should throw MethodError if the error does not have message and code', async () => {
    const handler = jest.fn(() => {
      throw new Error('foo')
    })
    const server = new Server(handler)

    await expect(server.dispatch('foo', ['bar', 100])).rejects.toThrow('Method error')
  })
})

describe('dispatchRequest', () => {
  describe('with requests that has no id', () => {
    const request = {
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100]
    }

    test('should return null with handler that returns', async () => {
      const handler = jest.fn(() => 'ok')
      const server = new Server(handler)

      await expect(server.dispatchRequest(request)).resolves.toBe(null)
      expect(handler).toBeCalled()
    })

    test('should return null with handler that throws', async () => {
      const handler = jest.fn(() => {
        throw new Error('foo')
      })
      const server = new Server(handler)

      await expect(server.dispatchRequest(request)).resolves.toBe(null)
      expect(handler).toBeCalled()
    })
  })

  describe('should return result response with handler that returns', async () => {
    const server = new Server((method, args) => ({[method]: args}))

    await expect(server.dispatchRequest({
      jsonrpc: '2.0',
      id: 100,
      method: 'foo',
      params: ['bar', 100]
    })).resolves.toEqual({
      jsonrpc: '2.0',
      id: 100,
      result: {
        foo: ['bar', 100]
      }
    })
  })

  describe('should return null result response with handler that returns undefined', async () => {
    const server = new Server(() => {})

    await expect(server.dispatchRequest({
      jsonrpc: '2.0',
      id: 100,
      method: 'foo',
      params: ['bar', 100]
    })).resolves.toEqual({
      jsonrpc: '2.0',
      id: 100,
      result: null
    })
  })

  describe('should return null result response with handler that returns null', async () => {
    const server = new Server(() => null)

    await expect(server.dispatchRequest({
      jsonrpc: '2.0',
      id: 100,
      method: 'foo',
      params: ['bar', 100]
    })).resolves.toEqual({
      jsonrpc: '2.0',
      id: 100,
      result: null
    })
  })

  describe('should return error response with handlers that throw standard error', async () => {
    const server = new Server(() => {
      const error = new Error('foo')
      error.code = 100
      error.data = {foo: 'bar'}
      throw error
    })

    await expect(server.dispatchRequest({
      jsonrpc: '2.0',
      id: 100,
      method: 'foo',
      params: ['bar', 100]
    })).resolves.toEqual({
      jsonrpc: '2.0',
      id: 100,
      error: {
        message: 'foo',
        code: 100,
        data: {foo: 'bar'}
      }
    })
  })

  describe('should return method error response with handlers that throw non-standard error', async () => {
    const server = new Server(() => {
      throw new Error('foo')
    })

    await expect(server.dispatchRequest({
      jsonrpc: '2.0',
      id: 100,
      method: 'foo',
      params: ['bar', 100]
    })).resolves.toEqual({
      jsonrpc: '2.0',
      id: 100,
      error: {
        message: error.METHOD_ERROR.message,
        code: error.METHOD_ERROR.code
      }
    })
  })

  test('should return error response if request is an empty array', async () => {
    const handler = jest.fn()
    const server = new Server(handler)

    await expect(server.dispatchRequest([])).resolves.toEqual({
      jsonrpc: '2.0',
      id: null,
      error: {
        message: error.INVALID_REQUEST.message,
        code: error.INVALID_REQUEST.code
      }
    })
    expect(handler).not.toBeCalled()
  })

  test('should return correct responses for each requests in array', async () => {
    const handler = jest.fn((method, params) => {
      if (method === 'throw1') {
        const error = new Error('throw1')
        error.code = 1
        error.data = {foo: 'bar'}
        throw error
      }

      if (method === 'throw2') {
        throw new Error('foo')
      }

      return {[method]: params || null}
    })
    const server = new Server(handler)

    const response = await server.dispatchRequest([
      {
        jsonrpc: '2.0',
        method: 'foo'
      },
      {
        jsonrpc: '2.0',
        method: 'foo',
        params: ['bar', 100]
      },
      {
        jsonrpc: '2.0',
        id: 101,
        method: 'foo',
        params: ['bar', 100]
      },
      {
        jsonrpc: '2.0',
        id: 102,
        method: 'foo'
      },
      {
        jsonrpc: '2.0',
        id: 103,
        method: 'throw1'
      },
      {
        jsonrpc: '2.0',
        id: 104,
        method: 'throw2'
      }
    ])

    expect(handler).toBeCalledTimes(6)
    expect(response.length).toBe(4)
    expect(response.find(r => r.id === 101)).toEqual({
      jsonrpc: '2.0',
      id: 101,
      result: {foo: ['bar', 100]}
    })
    expect(response.find(r => r.id === 102)).toEqual({
      jsonrpc: '2.0',
      id: 102,
      result: {foo: null}
    })
    expect(response.find(r => r.id === 103)).toEqual({
      jsonrpc: '2.0',
      id: 103,
      error: {
        message: 'throw1',
        code: 1,
        data: {foo: 'bar'}
      }
    })
    expect(response.find(r => r.id === 104)).toEqual({
      jsonrpc: '2.0',
      id: 104,
      error: {
        message: error.METHOD_ERROR.message,
        code: error.METHOD_ERROR.code
      }
    })
  })

  test('should return null if all requests in array does not have id', async () => {
    const handler = jest.fn((method, params) => {
      if (method === 'throw1') {
        const error = new Error('throw1')
        error.code = 1
        error.data = {foo: 'bar'}
        throw error
      }

      if (method === 'throw2') {
        throw new Error('foo')
      }

      return {[method]: params || null}
    })
    const server = new Server(handler)

    const response = await server.dispatchRequest([
      {
        jsonrpc: '2.0',
        method: 'foo'
      },
      {
        jsonrpc: '2.0',
        method: 'foo',
        params: ['bar', 100]
      },
      {
        jsonrpc: '2.0',
        method: 'foo',
        params: ['bar', 100]
      },
      {
        jsonrpc: '2.0',
        method: 'foo'
      },
      {
        jsonrpc: '2.0',
        method: 'throw1'
      },
      {
        jsonrpc: '2.0',
        method: 'throw2'
      }
    ])

    expect(handler).toBeCalledTimes(6)
    expect(response).toBe(null)
  })

  describe('should return invalid request error response if request is invalid', async () => {
    const server = new Server((method, args) => ({[method]: args}))

    await expect(server.dispatchRequest({
      jsonrpc: '20',
      method: 'foo',
      params: ['bar', 100]
    })).resolves.toEqual({
      jsonrpc: '2.0',
      id: null,
      error: {
        message: error.INVALID_REQUEST.message,
        code: error.INVALID_REQUEST.code
      }
    })
  })
})

describe('dispatchJSON', () => {
  test('should return parse error response if JSON is invalid', async () => {
    const server = new Server(() => {})

    const requestJSON = '{"jsonrpc":"2.0","method":"foo","params":["bar"]'
    const responseJSON = await server.dispatchJSON(requestJSON)
    expect(JSON.parse(responseJSON)).toEqual({
      jsonrpc: '2.0',
      id: null,
      error: {
        message: error.PARSE_ERROR.message,
        code: error.PARSE_ERROR.code
      }
    })
  })

  test('should return response JSON', async () => {
    const server = new Server((method, params) => [method, ...params])

    const requestJSON = JSON.stringify({
      jsonrpc: '2.0',
      id: 100,
      method: 'foo',
      params: ['bar', 100]
    })
    const responseJSON = await server.dispatchJSON(requestJSON)
    expect(JSON.parse(responseJSON)).toEqual({
      jsonrpc: '2.0',
      id: 100,
      result: ['foo', 'bar', 100]
    })
  })

  test('should return null if response is null', async () => {
    const server = new Server(() => {})

    const requestJSON = JSON.stringify({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100]
    })
    await expect(server.dispatchJSON(requestJSON)).resolves.toBe(null)
  })
})
