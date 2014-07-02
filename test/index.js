/**
 * import(s)
 */

var expect = require('expect.js');
var format = require('util').format;
var http = require('http').Server;
var io = require('socket.io');
var ioc = require('socket.io-client');
var async = require('async');
var zmq = require('zmq');
var Adapter = require('../');


function client (srv, ns, opts) {
  if (typeof ns === 'object') {
    opts = ns;
    ns = null;
  }
  var addr = srv.address();
  if (!addr) {
    addr = srv.listen().address();
  }
  var url = format('ws://%s:%s%s', addr.address, addr.port, (ns || ''));
  return ioc(url, opts);
}


/**
 * test(s)
 */

describe('socket.io-zeromq', function () {
  describe('broadcast', function () {
    var pub_listener = 'tcp://127.0.0.1:5555';
    var sub_listener = 'tcp://127.0.0.1:5556';
    var publisher;
    var subscriber;

    beforeEach(function (done) {
      var self = this;

      async.times(2, function (n, next) {
        var pub = publisher = zmq.socket('pub');
        pub.connect(pub_listener);
        var sub = subscriber = zmq.socket('sub');
        sub.connect(sub_listener);
        var srv = http();
        var sio = io(srv, { adapter: Adapter({
          pubClient: pub,
          subClient: sub
        }) });

        srv.listen(function () {
          ['/', '/nsp'].forEach(function (name) {
            sio.of(name).on('connection', function (socket) {
              socket.on('join', function (fn) {
                socket.join('room', fn);
              });

              socket.on('socket broadcast', function (data) {
                socket.broadcast.to('room').emit('broadcast', data);
              });

              socket.on('namespace broadcast', function (data) {
                sio.of('/nsp').in('room').emit('broadcast', data);
              });
            });
          });
        
          async.parallel([
            function (fn) {
              async.times(2, function (n, next) {
                var socket = client(srv, '/nsp', { forceNew: true });
                socket.on('connect', function () {
                  socket.emit('join', function () { next(null, socket); });
                });
              }, fn);
            },
            function (fn) {
              var socket = client(srv, '/nsp', { forceNew: true });
              socket.on('connect', function () {
                socket.on('broadcast', function () {
                  throw new Error('Called unexpectedly: different room');
                });
                fn();
              });
            },
            function (fn) {
              var socket = client(srv, { forceNew: true });
              socket.on('connect', function () {
                socket.on('broadcast', function () {
                  throw new Error('Called unexpectedly: different room');
                });
              });
              socket.emit('join', function () { fn(); });
            }
          ], function (err, results) { next(err, results[0]); });
        });
      }, function (err, sockets) {
        self.sockets = sockets.reduce(function (a, b) { return a.concat(b); });
        done(err);
      });
    });

    afterEach(function (done) {
      publisher.disconnect(pub_listener);
      subscriber.disconnect(sub_listener);
      done();
    });


    it('should broadcast from a socket', function (done) {
      async.each(this.sockets.slice(1), function (socket, next) {
        socket.on('broadcast', function (msg) {
          expect(msg).to.equal('hi');
          next();
        });
      }, done);

      var socket = this.sockets[0];
      socket.on('broadcast', function () {
        throw new Error('Called unexpectedly: some socket');
      });
      
      // emit !!
      setTimeout(function () {
        socket.emit('socket broadcast', 'hi');
      }, 50);
    });

    it('should broadcast from a namespace', function (done) {
      async.each(this.sockets, function (socket, next) {
        socket.on('broadcast', function (msg) {
          expect(msg).to.equal('hi');
          next();
        });
      }, done);

      // emit !!
      var socket = this.sockets[0];
      setTimeout(function () {
        socket.emit('namespace broadcast', 'hi');
      }, 50);
    });
  });
});
