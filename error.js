const PARSE_ERROR = {
  message: 'Parse error',
  code: -32700
}

const INVALID_REQUEST = {
  message: 'Invalid Request',
  code: -32600
}

const METHOD_NOT_FOUND = {
  message: 'Method not found',
  code: -32601
}

const INVALID_PARAMS = {
  message: 'Invalid params',
  code: -32602
}

const INTERNAL_ERROR = {
  message: 'Internal error',
  code: -32603
}

const AUTH_REQUIRED = {
  message: 'Authentication required',
  code: -32001
}

const UNAUTHORIZED = {
  message: 'Not authorized',
  code: -32003
}

class JSONRPCError extends Error {
  constructor(message, code, data) {
    super(message)

    this.code = code

    if (typeof data !== 'undefined') {
      this.data = data
    }
  }
}

class ParseError extends JSONRPCError {
  constructor() {
    super(
      PARSE_ERROR.message,
      PARSE_ERROR.code
    )
  }
}

class InvalidRequestError extends JSONRPCError {
  constructor() {
    super(
      INVALID_REQUEST.message,
      INVALID_REQUEST.code
    )
  }
}

class MethodNotFoundError extends JSONRPCError {
  constructor() {
    super(
      METHOD_NOT_FOUND.message,
      METHOD_NOT_FOUND.code
    )
  }
}

class InvalidParamsError extends JSONRPCError {
  constructor() {
    super(
      INVALID_PARAMS.message,
      INVALID_PARAMS.code
    )
  }
}

class InternalError extends JSONRPCError {
  constructor() {
    super(
      INTERNAL_ERROR.message,
      INTERNAL_ERROR.code
    )
  }
}

class AuthRequiredError extends JSONRPCError {
  constructor() {
    super(
      AUTH_REQUIRED.message,
      AUTH_REQUIRED.code
    )
  }
}

class UnauthorizedError extends JSONRPCError {
  constructor() {
    super(
      UNAUTHORIZED.message,
      UNAUTHORIZED.code
    )
  }
}

exports.PARSE_ERROR = PARSE_ERROR
exports.INVALID_REQUEST = INVALID_REQUEST
exports.METHOD_NOT_FOUND = METHOD_NOT_FOUND
exports.INVALID_PARAMS = INVALID_PARAMS
exports.INTERNAL_ERROR = INTERNAL_ERROR
exports.AUTH_REQUIRED = AUTH_REQUIRED
exports.UNAUTHORIZED = UNAUTHORIZED
exports.JSONRPCError = JSONRPCError
exports.ParseError = ParseError
exports.InvalidRequestError = InvalidRequestError
exports.MethodNotFoundError = MethodNotFoundError
exports.InvalidParamsError = InvalidParamsError
exports.InternalError = InternalError
exports.AuthRequiredError = AuthRequiredError
exports.UnauthorizedError = UnauthorizedError
