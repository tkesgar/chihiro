function errorToResponse(error, id) {
  if (typeof id === 'undefined') {
    return
  }

  const {code, message, data} = error

  if (!code) {
    throw new Error('error.code is required')
  }

  if (!message) {
    throw new Error('error.message is required')
  }

  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(typeof data === 'undefined' ? {} : {data})
    }
  }
}
exports.errorToResponse = errorToResponse

function resultToResponse(result, id) {
  if (typeof id === 'undefined') {
    return
  }

  return {
    jsonrpc: '2.0',
    id,
    result
  }
}
exports.resultToResponse = resultToResponse
