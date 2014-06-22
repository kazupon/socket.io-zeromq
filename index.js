/**
 * import(s)
 */

var Adapter = require('socket.io-adapter');
var debug = require('debug')('socket.io-zeromq');


/**
 * export(s)
 */

module.exports = adapter;

function adapter (opts) {
  opts = opts || {};

  // TODO: implements !!

  function ZeroMQ () {
  }

  return ZeroMQ;
}
