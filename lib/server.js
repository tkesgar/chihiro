const {
  INVALID_REQUEST,
  METHOD_ERROR,
  PARSE_ERROR
} = require('../error')
const {
  JSONRPCError,
  formatResponse,
  validateRequestObject
} = require('./util')

class Server {
  constructor(handler) {
    this.handler = handler
  }

  async dispatch(method, ...args) {
    try {
      const result = await this.handler(method, ...args)
      return result
    } catch (error) {
      const {message, code} = error
      if (typeof message === 'string' && typeof code === 'number') {
        throw error
      }

      throw new JSONRPCError(METHOD_ERROR.message, METHOD_ERROR.code)
    }
  }

  async dispatchRequest(request) {
    if (Array.isArray(request)) {
      if (request.length === 0) {
        return formatResponse(null, INVALID_REQUEST.message, INVALID_REQUEST.code)
      }

      const subResponses = (await Promise.all(request.map(r => this.dispatchRequest(r)))).filter(r => r !== null)
      return subResponses.length === 0 ? null : subResponses
    }

    if (!validateRequestObject(request)) {
      return formatResponse(null, INVALID_REQUEST.message, INVALID_REQUEST.code)
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
        return formatResponse(null, PARSE_ERROR.message, PARSE_ERROR.code)
      }

      return this.dispatchRequest(request)
    })()

    return response === null ? null : JSON.stringify(response)
  }
}

module.exports = Server
