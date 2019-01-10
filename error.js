exports.PARSE_ERROR = {
  message: 'Parse error',
  code: -32700,
  httpCode: 400
}

exports.INVALID_REQUEST = {
  message: 'Invalid Request',
  code: -32600,
  httpCode: 400
}

exports.METHOD_NOT_FOUND = {
  message: 'Method not found',
  code: -32601,
  httpCode: 404
}

exports.INVALID_PARAMS = {
  message: 'Invalid params',
  code: -32602,
  httpCode: 400
}

exports.INTERNAL_ERROR = {
  message: 'Internal error',
  code: -32603,
  httpCode: 500
}

exports.METHOD_ERROR = {
  message: 'Method error',
  code: -32000,
  httpCode: 500
}

exports.AUTH_REQUIRED = {
  message: 'Authentication required',
  code: -32001,
  httpCode: 401
}

exports.AUTH_INVALID = {
  message: 'Not authorized',
  code: -32002,
  httpCode: 403
}
