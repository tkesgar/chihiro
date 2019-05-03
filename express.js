function chihiroMiddleware(server, opts = {}) {
  const {
    request: getRequestFromReq = defaultGetRequestFromReq,
    ctx: getContext = defaultGetContext,
    send: sendResponse = defaultSendResponse
  } = opts

  return (req, res, next) => {
    (async () => {
      const request = getRequestFromReq(req)
      const ctx = getContext(req)

      const response = await server.dispatchRequest(request, ctx)

      if (!response) {
        sendResponse(res, 204)
      }

      sendResponse(res, 200, response)
    })().catch(next)
  }
}

module.exports = chihiroMiddleware

function defaultGetRequestFromReq(req) {
  return req.body
}

function defaultGetContext() {
  return null
}

function defaultSendResponse(res, statusCode, response) {
  return response ? res.status(statusCode).json(response) : res.sendStatus(statusCode)
}
