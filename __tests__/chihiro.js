/* eslint-env jest */
const Chihiro = require('..')
const {InvalidRequestError} = require('../error')

describe('errorToResponse', () => {
  test('no id', () => {
    const error = {}
    expect(Chihiro.errorToResponse(error)).toBe(undefined)
  })

  test('with id', () => {
    const error = {
      code: 100,
      message: 'An error has occured'
    }

    expect(Chihiro.errorToResponse(error, 'foo')).toMatchSnapshot()
  })

  test('with data', () => {
    const error = {
      code: 100,
      message: 'An error has occured',
      data: {
        key: 'abc',
        value: 123
      }
    }

    expect(Chihiro.errorToResponse(error, 'foo')).toMatchSnapshot()
  })

  test('with falsy data', () => {
    const error = {
      code: 100,
      message: 'An error has occured',
      data: null
    }

    expect(Chihiro.errorToResponse(error, 'foo')).toMatchSnapshot()
  })
})

describe('resultToResponse', () => {
  test('no id', () => {
    const result = {
      key: 'abc',
      value: 123
    }

    expect(Chihiro.resultToResponse(result)).toBe(undefined)
  })

  test('with id', () => {
    const result = {
      key: 'abc',
      value: 123
    }

    expect(Chihiro.resultToResponse(result, 'foo')).toMatchSnapshot()
  })
})

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
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })

    test('truthy', () => {
      const request = true
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })

    test('empty', () => {
      const request = {}
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })

    test('valid', () => {
      const request = requestBase
      expect(() => Chihiro.validateRequest(request)).not.toThrow()
    })
  })

  describe('jsonrpc', () => {
    test('without version', () => {
      const request = {...requestBase}
      delete request.jsonrpc
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })

    test('with invalid version', () => {
      const request = {...requestBase, jsonrpc: '20'}
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })
  })

  describe('method', () => {
    test('without method', () => {
      const request = {...requestBase}
      delete request.method
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })

    test('with non-string method', () => {
      const request = {...requestBase, method: 100}
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })
  })

  describe('params', () => {
    test('without params', () => {
      const request = {...requestBase}
      delete request.params
      expect(() => Chihiro.validateRequest(request)).not.toThrow(InvalidRequestError)
    })

    test('with array params', () => {
      const request = {...requestBase, params: ['abc', 123, false, {key: 'value'}]}
      expect(() => Chihiro.validateRequest(request)).not.toThrow()
    })

    test('with object params', () => {
      const request = {...requestBase, params: {key: 'value', data: null}}
      expect(() => Chihiro.validateRequest(request)).not.toThrow()
    })

    test('with null params', () => {
      const request = {...requestBase, params: null}
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })

    test('with non-object params', () => {
      const request = {...requestBase, params: true}
      expect(() => Chihiro.validateRequest(request)).toThrow(InvalidRequestError)
    })
  })

  describe('id', () => {
    test('without id', () => {
      const request = {...requestBase}
      delete request.id
      expect(() => Chihiro.validateRequest(request)).not.toThrow()
    })

    test('with null id', () => {
      const request = {...requestBase, id: null}
      expect(() => Chihiro.validateRequest(request)).not.toThrow()
    })

    test('with number id', () => {
      const request = {...requestBase, id: 123}
      expect(() => Chihiro.validateRequest(request)).not.toThrow()
    })

    test('with non-integer number id', () => {
      const request = {...requestBase, id: 123.456}
      expect(() => Chihiro.validateRequest(request)).not.toThrow()
    })
  })
})

describe('examples', () => {
  /* eslint-disable camelcase */
  const subtract = (minuend, subtrahend) => minuend - subtrahend
  subtract.mapParams = ({minuend, subtrahend}) => [minuend, subtrahend]

  const update = jest.fn()

  const foobar = jest.fn()

  const sum = (...values) => values.reduce((sum, value) => sum + value, 0)

  const notify_hello = jest.fn()

  const get_data = jest.fn(() => ['hello', 5])

  const notify_sum = jest.fn()

  const dispatcher = new Chihiro({
    subtract,
    update,
    foobar,
    sum,
    notify_hello,
    get_data,
    notify_sum
  })

  test('rpc call with positional parameters', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": 1}')
    const response = JSON.parse('{"jsonrpc": "2.0", "result": 19, "id": 1}')
    expect(await dispatcher.dispatch(request)).toEqual(response)
  })

  test('rpc call with named parameters #1', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "subtract", "params": {"subtrahend": 23, "minuend": 42}, "id": 3}')
    const response = JSON.parse('{"jsonrpc": "2.0", "result": 19, "id": 3}')
    expect(await dispatcher.dispatch(request)).toEqual(response)
  })

  test('rpc call with named parameters #2', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "subtract", "params": {"minuend": 42, "subtrahend": 23}, "id": 4}')
    const response = JSON.parse('{"jsonrpc": "2.0", "result": 19, "id": 4}')
    expect(await dispatcher.dispatch(request)).toEqual(response)
  })

  test('a notification #1', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "update", "params": [1,2,3,4,5]}')
    const response = await dispatcher.dispatch(request)

    expect(response).toBe(undefined)
    expect(update).toBeCalledWith(1, 2, 3, 4, 5)
  })

  test('a notification #2', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "foobar"}')
    const response = await dispatcher.dispatch(request)

    expect(response).toBe(undefined)
    expect(foobar).toBeCalled()
  })

  test('rpc call of non-existent method', async () => {
    const emptyDispatcher = new Chihiro({})
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "foobar", "id": "1"}')
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "1"}')
    expect(await emptyDispatcher.dispatch(request)).toEqual(response)
  })

  test('rpc call with invalid JSON', async () => {
    const requestJSON = '{"jsonrpc": "2.0", "method": "foobar, "params": "bar", "baz]'
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}')
    expect(await dispatcher.dispatchJSON(requestJSON)).toEqual(response)
  })

  test('rpc call with invalid Request object', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": 1, "params": "bar"}')
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}')
    expect(await dispatcher.dispatch(request)).toEqual(response)
  })

  test('rpc call Batch, invalid JSON', async () => {
    const requestJSON = `[
      {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},
      {"jsonrpc": "2.0", "method"
    ]`
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}')
    expect(await dispatcher.dispatchJSON(requestJSON)).toEqual(response)
  })

  test('rpc call with an empty Array', async () => {
    const request = JSON.parse('[]')
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}')
    expect(await dispatcher.dispatch(request)).toEqual(response)
  })

  test('rpc call with an invalid Batch (but not empty)', async () => {
    const request = JSON.parse('[1]')
    const response = JSON.parse(`[
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
    ]`)
    expect(await dispatcher.dispatch(request)).toEqual(response)
  })

  test('rpc call with invalid Batch', async () => {
    const request = JSON.parse('[1,2,3]')
    const response = JSON.parse(`[
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
    ]`)
    expect(await dispatcher.dispatch(request)).toEqual(response)
  })

  test('rpc call Batch', async () => {
    const request = JSON.parse(`[
      {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},
      {"jsonrpc": "2.0", "method": "notify_hello", "params": [7]},
      {"jsonrpc": "2.0", "method": "subtract", "params": [42,23], "id": "2"},
      {"foo": "boo"},
      {"jsonrpc": "2.0", "method": "foo.get", "params": {"name": "myself"}, "id": "5"},
      {"jsonrpc": "2.0", "method": "get_data", "id": "9"}
    ]`)
    const response = JSON.parse(`[
      {"jsonrpc": "2.0", "result": 7, "id": "1"},
      {"jsonrpc": "2.0", "result": 19, "id": "2"},
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
      {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "5"},
      {"jsonrpc": "2.0", "result": ["hello", 5], "id": "9"}
    ]`)

    const dispatchResponse = await dispatcher.dispatch(request)

    expect(dispatchResponse).toEqual(response)
    expect(notify_hello).toBeCalledWith(7)
    expect(get_data).toBeCalled()
  })

  test('rpc call Batch (all notifications)', async () => {
    const request = JSON.parse(`[
      {"jsonrpc": "2.0", "method": "notify_sum", "params": [1,2,4]},
      {"jsonrpc": "2.0", "method": "notify_hello", "params": [7]}
    ]`)
    const response = undefined

    const dispatchResponse = await dispatcher.dispatch(request)

    expect(dispatchResponse).toEqual(response)
    expect(notify_sum).toBeCalledWith(1, 2, 4)
    expect(notify_hello).toBeCalledWith(7)
  })
  /* eslint-enable camelcase */
})
