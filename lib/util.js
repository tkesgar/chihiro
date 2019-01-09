const {JSONRPC_VERSION} = require('./const')

function formatError(error) {
  const {message, code, data} = error

  return {
    message,
    code,
    ...(typeof data === 'undefined' ? {} : {data})
  }
}
exports.formatError = formatError

function formatResponse(id, ...args) {
  if (args.length === 1) {
    const [result] = args
    return {
      jsonrpc: JSONRPC_VERSION,
      id,
      result
    }
  }

  const [message, code, data] = args
  return {
    jsonrpc: JSONRPC_VERSION,
    id,
    error: formatError({message, code, data})
  }
}
exports.formatResponse = formatResponse

function validateRequestObject(request) {
  if (typeof request !== 'object') {
    return false
  }

  if (request === null) {
    return false
  }

  const {jsonrpc, method, params, id} = request

  if (jsonrpc !== '2.0') {
    return false
  }

  if (typeof method !== 'string') {
    return false
  }

  if (typeof params !== 'undefined') {
    if (typeof params !== 'object') {
      return false
    }

    if (params === null) {
      return false
    }
  }

  if (typeof id !== 'undefined') {
    if (typeof id !== 'string' && typeof id !== 'number') {
      return false
    }
  }

  return true
}
exports.validateRequestObject = validateRequestObject
