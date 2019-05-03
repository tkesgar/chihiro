/* eslint-env jest */
const Server = require('../util/server')

function createServer() {
  const handler = jest.fn((method, params) => {
    if (method === 'subtract') {
      if (Array.isArray(params)) {
        const [minuend, subtrahend] = params
        return minuend - subtrahend
      }

      const {minuend, subtrahend} = params
      return minuend - subtrahend
    }

    if (method === 'sum') {
      return params.reduce((sum, value) => sum + value, 0)
    }

    if (method === 'get_data') {
      return ['hello', 5]
    }

    throw Object.assign(new Error('Method not found'), {code: -32601})
  })

  return new Server(handler)
}

test('rpc call with positional parameters', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": 1}'
  const specResponse = '{"jsonrpc": "2.0", "result": 19, "id": 1}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).toBeCalledWith('subtract', [42, 23])
})

test('rpc call with named parameters #1', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": "subtract", "params": {"subtrahend": 23, "minuend": 42}, "id": 3}'
  const specResponse = '{"jsonrpc": "2.0", "result": 19, "id": 3}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).toBeCalledWith('subtract', {subtrahend: 23, minuend: 42})
})

test('rpc call with named parameters #2', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": "subtract", "params": {"minuend": 42, "subtrahend": 23}, "id": 4}'
  const specResponse = '{"jsonrpc": "2.0", "result": 19, "id": 4}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).toBeCalledWith('subtract', {minuend: 42, subtrahend: 23})
})

test('a notification #1', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": "update", "params": [1,2,3,4,5]}'

  const response = await server.dispatchJSON(specRequest)

  expect(response).toBe(null)
  expect(handler).toBeCalledWith('update', [1, 2, 3, 4, 5])
})

test('a notification #2', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": "foobar"}'

  const response = await server.dispatchJSON(specRequest)

  expect(response).toBe(null)
  expect(handler).toBeCalledWith('foobar')
})

test('rpc call of non-existent method', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": "foobar", "id": "1"}'
  const specResponse = '{"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "1"}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).toBeCalledWith('foobar')
})

test('rpc call with invalid JSON', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": "foobar, "params": "bar", "baz]'
  const specResponse = '{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).not.toBeCalled()
})

test('rpc call with invalid Request object', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '{"jsonrpc": "2.0", "method": 1, "params": "bar"}'
  const specResponse = '{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).not.toBeCalled()
})

test('rpc call Batch, invalid JSON', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '[{"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},{"jsonrpc": "2.0", "method"]'
  const specResponse = '{"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}, "id": null}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).not.toBeCalled()
})

test('rpc call with an empty Array', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '[]'
  const specResponse = '{"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}'

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).not.toBeCalled()
})

test('rpc call with an invalid Batch (but not empty)', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '[1]'
  const specResponse = `[
    {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
  ]`

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).not.toBeCalled()
})

test('rpc call with invalid Batch', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = '[1,2,3]'
  const specResponse = `[
    {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
    {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
    {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null}
  ]`

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).not.toBeCalled()
})

test('rpc call Batch', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = `[
    {"jsonrpc": "2.0", "method": "sum", "params": [1,2,4], "id": "1"},
    {"jsonrpc": "2.0", "method": "notify_hello", "params": [7]},
    {"jsonrpc": "2.0", "method": "subtract", "params": [42,23], "id": "2"},
    {"foo": "boo"},
    {"jsonrpc": "2.0", "method": "foo.get", "params": {"name": "myself"}, "id": "5"},
    {"jsonrpc": "2.0", "method": "get_data", "id": "9"}
  ]`
  const specResponse = `[
    {"jsonrpc": "2.0", "result": 7, "id": "1"},
    {"jsonrpc": "2.0", "result": 19, "id": "2"},
    {"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid Request"}, "id": null},
    {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "5"},
    {"jsonrpc": "2.0", "result": ["hello", 5], "id": "9"}
  ]`

  const responseJSON = await server.dispatchJSON(specRequest)
  const response = JSON.parse(responseJSON)

  expect(response).toEqual(JSON.parse(specResponse))
  expect(handler).toBeCalledWith('sum', [1, 2, 4])
  expect(handler).toBeCalledWith('notify_hello', [7])
  expect(handler).toBeCalledWith('subtract', [42, 23])
  expect(handler).toBeCalledWith('foo.get', {name: 'myself'})
  expect(handler).toBeCalledWith('get_data')
})

test('rpc call Batch (all notifications)', async () => {
  const server = createServer()
  const {handler} = server

  const specRequest = `[
    {"jsonrpc": "2.0", "method": "notify_sum", "params": [1,2,4]},
    {"jsonrpc": "2.0", "method": "notify_hello", "params": [7]}
  ]`

  const response = await server.dispatchJSON(specRequest)

  expect(response).toBe(null)
  expect(handler).toBeCalledWith('notify_sum', [1, 2, 4])
  expect(handler).toBeCalledWith('notify_hello', [7])
})
