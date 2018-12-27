const err = require('./errors')
const {errorToResponse, resultToResponse} = require('./response')
const {validateRequest} = require('./request')

class Dispatcher {
  constructor(methods, opts = {}) {
    const {
      stringify = JSON.stringify,
      parse = JSON.parse
    } = opts

    this.methods = methods
    this.stringify = stringify
    this.parse = parse
  }

  async dispatchRaw(request) {
    const etores = err => errorToResponse(err, request.id || null)
    const rtores = res => resultToResponse(res, request.id)

    if (Array.isArray(request)) {
      if (request.length === 0) {
        return etores(new err.InvalidRequestError(), null)
      }

      const results = (await Promise.all(request.map(r => this.dispatchRaw(r)))).filter(r => r)
      return results.length > 0 ? results : null
    }

    if (!validateRequest(request)) {
      return etores(new err.InvalidRequestError())
    }

    const method = this.methods[request.method]
    if (!method) {
      return etores(new err.MethodNotFoundError())
    }

    const {params} = request

    const {validateParams} = method
    if (validateParams) {
      try {
        if (!params) {
          return etores(new err.InvalidParamsError())
        }

        if (!call(validateParams, params, method.mapParams)) {
          return etores(new err.InvalidParamsError())
        }
      } catch (error) {
        return etores(new err.InternalError())
      }
    }

    let result
    try {
      result = await call(method, params, method.mapParams)
    } catch (error) {
      const {code, message} = error
      if (typeof code === 'number' && typeof message === 'string') {
        return etores(error)
      }

      return etores(new err.InternalError())
    }

    return rtores(result)
  }

  async dispatch(text) {
    let request
    try {
      request = this.parse(text)
    } catch (error) {
      return this.stringify(errorToResponse(new err.JSONParseError(), null))
    }

    let response
    try {
      response = await this.dispatchRaw(request)
    } catch (error) {
      return this.stringify(errorToResponse(new err.InternalError(), request.id || null))
    }

    return this.stringify(response)
  }
}

module.exports = Dispatcher

function call(fn, params, map) {
  if (Array.isArray(params)) {
    return fn(...params)
  }

  if (map) {
    return fn(...map(params))
  }

  return fn(params)
}
