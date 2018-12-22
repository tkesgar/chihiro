class JSONRPCError extends Error {
  static get JSONParseError() {
    return JSONParseError
  }

  static get InvalidRequestError() {
    return InvalidRequestError
  }

  static get MethodNotFoundError() {
    return MethodNotFoundError
  }

  static get InvalidParamsError() {
    return InvalidParamsError
  }

  constructor(message, code, data) {
    super(message)

    this.code = code

    if (typeof data !== 'undefined') {
      this.data = data
    }
  }
}

module.exports = JSONRPCError

class JSONParseError extends JSONRPCError {
  constructor() {
    super('Parse error', -32700)
  }
}

class InvalidRequestError extends JSONRPCError {
  constructor() {
    super('Invalid Request', -32600)
  }
}

class MethodNotFoundError extends JSONRPCError {
  constructor() {
    super('Method not found', -32601)
  }
}

class InvalidParamsError extends JSONRPCError {
  constructor() {
    super('Invalid parameters', -32602)
  }
}
