const C = require('./const')
const {formatResponse, validateRequestObject} = require('./util')

class Server {
  constructor(handler) {
    this.handler = handler
  }

  async dispatch(method, ...args) {
    try {
      const result = await this.handler(method, ...args)
      return result
    } catch (error) {
      if (typeof error.message === 'string' && typeof error.code === 'number') {
        throw error
      }

      throw Object.assign(new Error(C.METHOD_ERROR_MESSAGE), {code: C.METHOD_ERROR})
    }
  }

  async dispatchRequest(request) {
    if (Array.isArray(request)) {
      if (request.length === 0) {
        return formatResponse(null, C.INVALID_REQUEST_MESSAGE, C.INVALID_REQUEST)
      }

      const subResponses = (await Promise.all(request.map(r => this.dispatchRequest(r)))).filter(r => r !== null)
      return subResponses.length === 0 ? null : subResponses
    }

    if (!validateRequestObject(request)) {
      return formatResponse(null, C.INVALID_REQUEST_MESSAGE, C.INVALID_REQUEST)
    }

    const {id, method, params} = request

    try {
      const dispatchResult = await this.dispatch(...(typeof params === 'undefined' ? [method] : [method, params]))
      const result = typeof dispatchResult === 'undefined' ? null : dispatchResult
      return id ? formatResponse(id, result) : null
    } catch (error) {
      const {message, code, data} = error
      return id ? formatResponse(id, message, code, data) : null
    }
  }

  async dispatchJSON(json) {
    const response = await (async () => {
      let request
      try {
        request = JSON.parse(json)
      } catch (error) {
        return formatResponse(null, C.PARSE_ERROR_MESSAGE, C.PARSE_ERROR)
      }

      return this.dispatchRequest(request)
    })()

    return response === null ? null : JSON.stringify(response)
  }
}

module.exports = Server
