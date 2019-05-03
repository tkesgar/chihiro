function isValidRequest(request) {
  if (Array.isArray(request)) {
    if (Array.length === 0) {
      return false
    }

    return true
  }

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

module.exports = isValidRequest
