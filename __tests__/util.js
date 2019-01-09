/* eslint-env jest */
const util = require('../lib/util')

describe('formatError', () => {
  const {formatError} = util

  test('should return formatted error without data', () => {
    expect(formatError({
      message: 'foo',
      code: 100
    })).toEqual({
      message: 'foo',
      code: 100
    })
  })

  test('should return formatted error with falsy data', () => {
    expect(formatError({
      message: 'foo',
      code: 100,
      data: null
    })).toEqual({
      message: 'foo',
      code: 100,
      data: null
    })
  })

  test('should return formatted error with data', () => {
    expect(formatError({
      message: 'foo',
      code: 100,
      data: {foo: 'bar'}
    })).toEqual({
      message: 'foo',
      code: 100,
      data: {foo: 'bar'}
    })
  })
})

describe('formatResponse', () => {
  const {formatResponse} = util

  test('should return formatted response with result', () => {
    expect(formatResponse(100, {foo: 'bar'})).toEqual({
      jsonrpc: '2.0',
      id: 100,
      result: {foo: 'bar'}
    })
  })

  test('should return formatted response with error', () => {
    expect(formatResponse('foo', 'bar', 100)).toEqual({
      jsonrpc: '2.0',
      id: 'foo',
      error: {
        message: 'bar',
        code: 100
      }
    })
  })
})

describe('validateRequestObject', () => {
  const {validateRequestObject} = util

  test('should return false if response is not an object', () => {
    expect(validateRequestObject(true)).toBe(false)
  })

  test('should return false if response is null', () => {
    expect(validateRequestObject(null)).toBe(false)
  })

  test('should return false if version is not \'2.0\'', () => {
    expect(validateRequestObject({
      jsonrpc: '20',
      method: 'foo'
    })).toBe(false)
  })

  test('should return false if method is not a string', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 100
    })).toBe(false)
  })

  test('should return true if params does not exist', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo'
    })).toBe(true)
  })

  test('should return false if params is null', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: null
    })).toBe(false)
  })

  test('should return false if params is not an object', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: 100
    })).toBe(false)
  })

  test('should return true if params is an empty object', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: {}
    })).toBe(true)
  })

  test('should return true if params is an object', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: {foo: 'bar', status: 100}
    })).toBe(true)
  })

  test('should return true if params is an empty array', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: []
    })).toBe(true)
  })

  test('should return true if params is an array', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100]
    })).toBe(true)
  })

  test('should return true if id does not exist', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100]
    })).toBe(true)
  })

  test('should return true if id is a number', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100],
      id: 100
    })).toBe(true)
  })

  test('should return true if id is a string', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100],
      id: 'bar'
    })).toBe(true)
  })

  test('should return false if id is null', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100],
      id: null
    })).toBe(false)
  })

  test('should return false if id is an object', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100],
      id: {key: 'value'}
    })).toBe(false)
  })

  test('should return false if id is an array', () => {
    expect(validateRequestObject({
      jsonrpc: '2.0',
      method: 'foo',
      params: ['bar', 100],
      id: [1, 2, 3]
    })).toBe(false)
  })
})
