function validateRequest(request) {
  if (request === null || typeof request !== 'object') {
    return false
  }

  const {jsonrpc, method, params, id} = request

  if (jsonrpc !== '2.0') {
    return false
  }

  if (typeof method !== 'string') {
    return false
  }

  if (typeof params !== 'undefined' && (params === null || typeof params !== 'object')) {
    return false
  }

  if (typeof id !== 'undefined' && (typeof id !== 'string' && typeof id !== 'number' && id !== null)) {
    return false
  }

  return true
}
exports.validateRequest = validateRequest
