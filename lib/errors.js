class JSONRPCError extends Error {
  constructor(message, code, data) {
    super(message)

    this.code = code

    if (typeof data !== 'undefined') {
      this.data = data
    }
  }
}
exports.JSONRPCError = JSONRPCError

class JSONParseError extends JSONRPCError {
  constructor() {
    super('Parse error', -32700)
  }
}
exports.JSONParseError = JSONParseError

class InvalidRequestError extends JSONRPCError {
  constructor() {
    super('Invalid Request', -32600)
  }
}
exports.InvalidRequestError = InvalidRequestError

class MethodNotFoundError extends JSONRPCError {
  constructor() {
    super('Method not found', -32601)
  }
}
exports.MethodNotFoundError = MethodNotFoundError

class InvalidParamsError extends JSONRPCError {
  constructor() {
    super('Invalid params', -32602)
  }
}
exports.InvalidParamsError = InvalidParamsError

class InternalError extends JSONRPCError {
  constructor() {
    super('Internal error', -32603)
  }
}
exports.InternalError = InternalError
