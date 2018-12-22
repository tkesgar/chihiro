const {JSONParseError, InvalidRequestError, MethodNotFoundError, InvalidParamsError} = require('./error')

class Chihiro {
  static errorToResponse(error, id) {
    if (typeof id === 'undefined') {
      return
    }

    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: error.code,
        message: error.message,
        ...(typeof error.data === 'undefined' ? {} : {data: error.data})
      }
    }
  }

  static resultToResponse(result, id) {
    if (typeof id === 'undefined') {
      return
    }

    return {
      jsonrpc: '2.0',
      id,
      result
    }
  }

  static validateRequest(request) {
    if (request === null || typeof request !== 'object') {
      throw new InvalidRequestError()
    }

    const {jsonrpc, method, params, id} = request

    if (jsonrpc !== '2.0') {
      throw new InvalidRequestError()
    }

    if (typeof method !== 'string') {
      throw new InvalidRequestError()
    }

    if (typeof params !== 'undefined' && (params === null || typeof params !== 'object')) {
      throw new InvalidRequestError()
    }

    if (typeof id !== 'undefined' && (typeof id !== 'string' && typeof id !== 'number' && id !== null)) {
      throw new InvalidRequestError()
    }
  }

  constructor(methods) {
    this.methods = methods
  }

  async dispatch(request) {
    function errorToResponse(error) {
      return Chihiro.errorToResponse(error, request.id || null)
    }

    function resultToResponse(result) {
      return Chihiro.resultToResponse(result, request.id)
    }

    if (Array.isArray(request)) {
      if (request.length === 0) {
        return Chihiro.errorToResponse(new InvalidRequestError(), null)
      }

      const results = (await Promise.all(request.map(req => this.dispatch(req)))).filter(x => typeof x !== 'undefined')
      return results.length === 0 ? undefined : results
    }

    try {
      Chihiro.validateRequest(request)
    } catch (error) {
      return errorToResponse(error)
    }

    const {method: methodName} = request
    const method = this.methods[methodName]
    if (!method) {
      return errorToResponse(new MethodNotFoundError())
    }

    const {validateParams} = method
    if (validateParams) {
      try {
        const {params} = request
        if (!params) {
          throw new Error('Field \'params\' does not exist in request object')
        }

        (() => {
          if (Array.isArray(params)) {
            return validateParams(...params)
          }

          const {mapParams} = method
          if (mapParams) {
            return validateParams(...mapParams(params))
          }

          return validateParams(params)
        })()
      } catch (error) {
        return errorToResponse(new InvalidParamsError())
      }
    }

    try {
      const {params, id} = request

      const result = await (() => {
        if (typeof params === 'undefined') {
          return method()
        }

        if (Array.isArray(params)) {
          return method(...params)
        }

        if (method.mapParams) {
          return method(...method.mapParams(params))
        }

        return method(params)
      })()

      return resultToResponse(result, id)
    } catch (error) {
      return errorToResponse(error)
    }
  }

  async dispatchJSON(json) {
    try {
      const request = JSON.parse(json)
      return this.dispatch(request)
    } catch (error) {
      return Chihiro.errorToResponse(new JSONParseError(), null)
    }
  }
}

module.exports = Chihiro
