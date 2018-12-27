/* eslint-env jest */
const Dispatcher = require('../lib/dispatcher')

describe('examples from spec', () => {
  /* eslint-disable camelcase */
  const subtract = (minuend, subtrahend) => minuend - subtrahend
  subtract.mapParams = ({minuend, subtrahend}) => [minuend, subtrahend]

  const update = jest.fn()

  const foobar = jest.fn()

  const sum = (...values) => values.reduce((sum, value) => sum + value, 0)

  const notify_hello = jest.fn()

  const get_data = jest.fn(() => ['hello', 5])

  const notify_sum = jest.fn()

  const dispatcher = new Dispatcher({
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
    expect(await dispatcher.dispatchRaw(request)).toEqual(response)
  })

  test('rpc call with named parameters #1', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "subtract", "params": {"subtrahend": 23, "minuend": 42}, "id": 3}')
    const response = JSON.parse('{"jsonrpc": "2.0", "result": 19, "id": 3}')
    expect(await dispatcher.dispatchRaw(request)).toEqual(response)
  })

  test('rpc call with named parameters #2', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "subtract", "params": {"minuend": 42, "subtrahend": 23}, "id": 4}')
    const response = JSON.parse('{"jsonrpc": "2.0", "result": 19, "id": 4}')
    expect(await dispatcher.dispatchRaw(request)).toEqual(response)
  })

  test('a notification #1', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "update", "params": [1,2,3,4,5]}')
    const response = await dispatcher.dispatchRaw(request)

    expect(response).toBe(undefined)
    expect(update).toBeCalledWith(1, 2, 3, 4, 5)
  })

  test('a notification #2', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "foobar"}')
    const response = await dispatcher.dispatchRaw(request)

    expect(response).toBe(undefined)
    expect(foobar).toBeCalled()
  })

  test('rpc call of non-existent method', async () => {
    const emptyDispatcher = new Dispatcher({})
    const request = JSON.parse('{"jsonrpc": "2.0", "method": "foobar", "id": "1"}')
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "1"}')
    expect(await emptyDispatcher.dispatchRaw(request)).toEqual(response)
  })

  test('rpc call with invalid JSON', async () => {
    const requestJSON = '{"jsonrpc": "2.0", "method": "foobar, "params": "bar", "baz]'
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}')
    expect(JSON.parse(await dispatcher.dispatch(requestJSON))).toEqual(response)
  })

  test('rpc call with invalid Request object', async () => {
    const request = JSON.parse('{"jsonrpc": "2.0", "method": 1, "params": "bar"}')
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}')
    expect(await dispatcher.dispatchRaw(request)).toEqual(response)
  })

  test('rpc call Batch, invalid JSON', async () => {
    const requestJSON = `[
      {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},
      {"jsonrpc": "2.0", "method"
    ]`
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}')
    expect(JSON.parse(await dispatcher.dispatch(requestJSON))).toEqual(response)
  })

  test('rpc call with an empty Array', async () => {
    const request = JSON.parse('[]')
    const response = JSON.parse('{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}')
    expect(await dispatcher.dispatchRaw(request)).toEqual(response)
  })

  test('rpc call with an invalid Batch (but not empty)', async () => {
    const request = JSON.parse('[1]')
    const response = JSON.parse(`[
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
    ]`)
    expect(await dispatcher.dispatchRaw(request)).toEqual(response)
  })

  test('rpc call with invalid Batch', async () => {
    const request = JSON.parse('[1,2,3]')
    const response = JSON.parse(`[
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
      {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
    ]`)
    expect(await dispatcher.dispatchRaw(request)).toEqual(response)
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

    const dispatchResponse = await dispatcher.dispatchRaw(request)

    expect(dispatchResponse).toEqual(response)
    expect(notify_hello).toBeCalledWith(7)
    expect(get_data).toBeCalled()
  })

  test('rpc call Batch (all notifications)', async () => {
    const request = JSON.parse(`[
      {"jsonrpc": "2.0", "method": "notify_sum", "params": [1,2,4]},
      {"jsonrpc": "2.0", "method": "notify_hello", "params": [7]}
    ]`)
    const response = null

    const dispatchResponse = await dispatcher.dispatchRaw(request)

    expect(dispatchResponse).toEqual(response)
    expect(notify_sum).toBeCalledWith(1, 2, 4)
    expect(notify_hello).toBeCalledWith(7)
  })
  /* eslint-enable camelcase */
})
