# chihiro

> Implementation of JSON-RPC 2.0

chihiro is an implementation of JSON-RPC 2.0, as specified [here][jsonrpc-spec].

## Installation

## Usage

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

## Todo

[ ] Add tests for `validateParams` and `mapParams`
[ ] Create wrapper for Express
[ ] Load all methods from modules

## License

Licensed under [MIT License][license].

[jsonrpc-spec]: https://www.jsonrpc.org/specification#extensions
[license]: https://github.com/tkesgar/chihiro/blob/master/LICENSE
