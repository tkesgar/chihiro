const Server = require('./lib/server')

function createServer(handler) {
  return new Server(handler)
}
exports.createServer = createServer
