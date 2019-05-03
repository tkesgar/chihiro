const err = require('./error')

function methodMap(methods) {
  return async (method, params, ctx) => {
    const methodData = methods[method]
    if (!methodData) {
      throw new err.MethodNotFoundError()
    }

    const {fn, mapParams, validateParams, auth} = methodData

    if (!Array.isArray(params)) {
      if (!mapParams) {
        throw new err.InvalidParamsError()
      }

      params = mapParams(params)
    }

    if (validateParams) {
      try {
        validateParams(...params)
      } catch (error) {
        throw new err.InvalidParamsError()
      }
    }

    if (auth) {
      const {user} = (ctx || {})

      if (!user) {
        throw new err.AuthRequiredError()
      }

      const isAllowed = await auth(user)
      if (!isAllowed) {
        throw new err.UnauthorizedError()
      }
    }

    const result = await fn.call(ctx, ...params)
    return result
  }
}

module.exports = methodMap
