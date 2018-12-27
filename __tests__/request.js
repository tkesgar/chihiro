/* eslint-env jest */
const {validateRequest} = require('../lib/request')

describe('validateRequest', () => {
  const requestBase = {
    jsonrpc: '2.0',
    method: 'foo',
    params: {
      key: 'abc',
      value: 123
    },
    id: 'bar'
  }

  describe('request', () => {
    test('falsy', () => {
      const request = null
      expect(validateRequest(request)).toBe(false)
    })

    test('truthy', () => {
      const request = true
      expect(validateRequest(request)).toBe(false)
    })

    test('empty', () => {
      const request = {}
      expect(validateRequest(request)).toBe(false)
    })

    test('valid', () => {
      const request = requestBase
      expect(validateRequest(request)).toBe(true)
    })
  })

  describe('jsonrpc', () => {
    test('without version', () => {
      const request = {...requestBase}
      delete request.jsonrpc
      expect(validateRequest(request)).toBe(false)
    })

    test('with invalid version', () => {
      const request = {...requestBase, jsonrpc: '20'}
      expect(validateRequest(request)).toBe(false)
    })
  })

  describe('method', () => {
    test('without method', () => {
      const request = {...requestBase}
      delete request.method
      expect(validateRequest(request)).toBe(false)
    })

    test('with non-string method', () => {
      const request = {...requestBase, method: 100}
      expect(validateRequest(request)).toBe(false)
    })
  })

  describe('params', () => {
    test('without params', () => {
      const request = {...requestBase}
      delete request.params
      expect(validateRequest(request)).toBe(true)
    })

    test('with array params', () => {
      const request = {...requestBase, params: ['abc', 123, false, {key: 'value'}]}
      expect(validateRequest(request)).toBe(true)
    })

    test('with object params', () => {
      const request = {...requestBase, params: {key: 'value', data: null}}
      expect(validateRequest(request)).toBe(true)
    })

    test('with null params', () => {
      const request = {...requestBase, params: null}
      expect(validateRequest(request)).toBe(false)
    })

    test('with non-object params', () => {
      const request = {...requestBase, params: true}
      expect(validateRequest(request)).toBe(false)
    })
  })

  describe('id', () => {
    test('without id', () => {
      const request = {...requestBase}
      delete request.id
      expect(validateRequest(request)).toBe(true)
    })

    test('with null id', () => {
      const request = {...requestBase, id: null}
      expect(validateRequest(request)).toBe(true)
    })

    test('with number id', () => {
      const request = {...requestBase, id: 123}
      expect(validateRequest(request)).toBe(true)
    })

    test('with non-integer number id', () => {
      const request = {...requestBase, id: 123.456}
      expect(validateRequest(request)).toBe(true)
    })

    test('with object id', () => {
      const request = {...requestBase, id: {key: 'value'}}
      expect(validateRequest(request)).toBe(false)
    })
  })
})
