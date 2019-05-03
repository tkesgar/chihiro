const err = require('./error')
const isValidRequest = require('./lib/valid-request')

const VERSION = '2.0'

class Server {
  constructor(handler) {
    this.handler = handler
  }

  async dispatch(method, params, ctx) {
    try {
      return this.handler(method, params, ctx)
    } catch (error) {
      if (typeof error.message === 'string' && typeof error.code === 'number') {
        throw error
      }

      throw new err.InternalError()
    }
  }

  async dispatchRequest(request, ctx) {
    if (Array.isArray(request)) {
      if (request.length === 0) {
        return createResponse(null, {
          error: err.INVALID_REQUEST
        })
      }

      const allResponses = await Promise.all(request.map(r => this.dispatchRequest(r, ctx)))
      const responses = allResponses.filter(response => Boolean(response))

      return responses.length > 0 ? responses : null
    }

    if (!isValidRequest(request)) {
      return createResponse(null, {
        error: err.INVALID_REQUEST
      })
    }

    const {id, method, params} = request

    try {
      const result = await this.handler(method, params, ctx)

      if (typeof id === 'undefined') {
        return
      }

      return createResponse(id, {
        result: typeof result === 'undefined' ? null : result
      })
    } catch (error) {
      const {message, code} = error

      if (typeof id === 'undefined') {
        return
      }

      return createResponse(id, {
        error: {message, code}
      })
    }
  }

  async dispatchJSON(json, ctx) {
    let request
    try {
      request = JSON.parse(json)
    } catch (error) {
      return createResponse(null, {
        error: err.PARSE_ERROR
      })
    }

    const response = await this.dispatchRequest(request, ctx)
    return response ? JSON.stringify(response) : null
  }
}

module.exports = Server

function createResponse(id, data) {
  return {
    jsonrpc: VERSION,
    id,
    ...data
  }
}
