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

  static get InternalError() {
    return InternalError
  }

  static get CircularStructureError() {
    return CircularStructureError
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
    super('Invalid params', -32602)
  }
}

class InternalError extends JSONRPCError {
  constructor() {
    super('Internal error', -32603)
  }
}

class CircularStructureError extends JSONRPCError {
  constructor() {
    super('Converting circular structure to JSON', -32000)
  }
}
