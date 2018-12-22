# chihiro

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![Build Status](https://travis-ci.org/tkesgar/chihiro.svg?branch=master)](https://travis-ci.org/tkesgar/chihiro)
[![codecov](https://codecov.io/gh/tkesgar/chihiro/branch/master/graph/badge.svg)](https://codecov.io/gh/tkesgar/chihiro)
[![Greenkeeper badge](https://badges.greenkeeper.io/tkesgar/chihiro.svg)](https://greenkeeper.io/)

> Implementation of JSON-RPC 2.0

chihiro is an implementation of JSON-RPC 2.0, as specified [here][jsonrpc-spec].

## Installation

```sh
npm i @tkesgar/chihiro
```

## Usage

Instantiate a dispatcher, providing methods to use:

```js
const Chihiro = require('@tkesgar/chihiro')

const dispatcher = new Chihiro({
  ping: () => 'pong',
  foo: async () => 'bar'
})
```

Once instantiated, use `dispatch` to call methods by providing a correct
JSON request object according to spec:

```js
await dispatcher.dispatch('{"jsonrpc": "2.0", "id": 100, "method": "ping"}')
// -> '{"jsonrpc":"2.0","id":100,"result":"pong"}'
```

Alternatively, use `dispatchRaw` to skip the JSON parsing. This is useful in
environments where JSON parsing is handled externally:

```js
await dispatcher.dispatchRaw({
  jsonrpc: '2.0',
  id: 101,
  method: 'foo'
})
// -> {
//      jsonrpc: '2.0',
//      id: 101,
//      result: 'bar'
//    }
```

Batch calls and notification calls works as expected.

The spec does not specify the transport method to use, and currently chihiro
does not provide any server implementation. Here is a simple example using
Express:

```js
const express = require('express')
const Chihiro = require('@tkesgar/chihiro')

const dispatcher = new Chihiro({ping: () => 'pong'})

app.post(
  express.json(),
  (req, res, next) => {
    dispatcher.dispatch(req.body)
      .then(data => res.send(data))
      .catch(next)
  }
)

app.listen(3000)

// $ curl -XPOST -H "Content-type: application/json" -d '{"jsonrpc": "2.0", "id": 100, "method": "ping"}' 'http://localhost:3000'
// {"jsonrpc":"2.0","id":100,"result":"pong"}
```

### Method details

chihiro requires a map of methods to be dispatched in the application. A method
is just a standard function. It can also be an async function (function that
returns a `Promise`).

```js
function add(a, b) {
  return a + b
}

async function addAll(...args) {
  return args.reduce((sum, arg) => sum + arg, 0)
}

const dispatcher = new Chihiro({add, addAsync})

await dispatcher.dispatch({
  jsonrpc: '2.0',
  id: 1,
  method: 'add',
  params: [100, 200]
}) // {jsonrpc: '2.0', id: 1, result: 300}

console.log(await dispatcher.dispatch({
  jsonrpc: '2.0',
  id: 2,
  method: 'addAll',
  params: [1, 2, 3, 4]
}))
```

Array parameters will be spread as arguments. To comply with the spec, define
a `mapParams` function that receives a single object parameter and returns an
array containing the arguments in order. If `mapParams` is not specified, the
parameter object will be provided as-is.

```js
function greaterThan(left, right) {
  return left > right
}
greaterThan.mapParams = ({left, right}) => [left, right]

const dispatcher = new Chihiro({dispatcher})
```

Method return values should not be `undefined` or anything that returns
`undefined` by `JSON.stringify()`, such as `Symbols`, functions, or circular
structures. See [here][stringify] for more information on `JSON.stringify`.

## Contributions

Feel free to submit issues and pull requests.

## Todo

Before `v1.0`:

[ ] Better docs
[ ] `dispatchRaw` should not handle JSON conversions, while `dispatch` should
[ ] Add tests for `validateParams` and `mapParams`
[ ] Create wrapper for Express
[ ] Load all methods from modules

## License

Licensed under [MIT License][license].

[jsonrpc-spec]: https://www.jsonrpc.org/specification#extensions
[license]: https://github.com/tkesgar/chihiro/blob/master/LICENSE
[stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
