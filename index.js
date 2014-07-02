/**
 * import(s)
 */

var debug = require('debug')('socket.io-zeromq');
var Adapter = require('socket.io-adapter');
var format = require('util').format;
var zmq = require('zmq');
var msgpack = require('msgpack-js');
var uid2 = require('uid2');


/**
 * export(s)
 */

module.exports = adapter;

function adapter (opts) {
  opts = opts || {};
  opts.host = opts.host || '127.0.0.1';
  opts.pubPort = opts.pubPort || 5555;
  opts.subPort = opts.subPort || 5556;

  var pub = opts.pubClient;
  var sub = opts.subClient;
  var prefix = opts.key || 'socket.io-zmq';

  if (!pub) {
    pub = zmq.socket('pub');
    pub.connect(format('tcp://%s:%s', opts.host, opts.pubPort));
  }
  
  if (!sub) {
    sub = zmq.socket('sub');
    sub.connect(format('tcp://%s:%s', opts.host, opts.subPort));
  }

  var uid = uid2(6);
  var key = prefix + '#' + uid;


  /*
   * define ZeroMQ Adapter
   */

  function ZeroMQ (nsp) {
    Adapter.call(this, nsp);

    var self = this;
    sub.subscribe('');
    sub.on('message', this.onMessage.bind(this));
  }

  ZeroMQ.prototype.__proto__ = Adapter.prototype;

  ZeroMQ.prototype.onMessage = function (msg) {
    var offset = channelOffset(msg);
    var channel = msg.slice(0, offset);
    debug('ZeroMQ#onMessage: channel = %s', channel.toString());

    var pieces = channel.toString().split('#');
    if (uid == pieces.pop()) {
      return debug('ZeroMQ#onMessage: ignore same uid');
    }

    var payload = msgpack.decode(msg.slice(offset + 1, msg.length));
    debug('ZeroMQ#onMessage: payload = %j', payload);
    if (payload[0] && payload[0].nsp === undefined) {
      payload[0].nsp = '/';
    }

    if (!payload[0] || payload[0].nsp != this.nsp.name) {
      return debug('ZeroMQ#onMessage: ignore different namespace');
    }

    payload.push(true);
    this.broadcast.apply(this, payload);
  };

  ZeroMQ.prototype.broadcast = function (packet, opts, remote) {
    Adapter.prototype.broadcast.call(this, packet, opts);
    if (!remote) {
      var channel = new Buffer(format('%s ', key), 'binary');
      var payload = msgpack.encode([packet, opts]);
      var data = Buffer.concat([channel, payload]);
      debug('ZeroMQ#broadcast: send data length -> channel = %d, payload = %d, data = %d', channel.length, payload.length, data.length);
      pub.send(data);
    }
  };

  return ZeroMQ;
}

function channelOffset (msg) {
  var offset = 0;
  for (var i = 0; i < msg.length; i++) {
    if (msg[i] === 0x20) { // space
      offset = i;
      break;
    }
  }
  return offset;
}
