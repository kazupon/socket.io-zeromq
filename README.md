# socket.io-zeromq

[![NPM version](https://badge.fury.io/js/socket.io-zeromq.svg)](http://badge.fury.io/js/socket.io-zeromq)
[![Build Status](https://travis-ci.org/kazupon/socket.io-zeromq.svg?branch=master)](https://travis-ci.org/kazupon/socket.io-zeromq)
[![Coverage Status](https://img.shields.io/coveralls/kazupon/socket.io-zeromq.svg)](https://coveralls.io/r/kazupon/socket.io-zeromq)
[![Dependency Status](https://david-dm.org/kazupon/socket.io-zeromq.svg)](https://david-dm.org/kazupon/socket.io-zeromq)

socket.io adapter [zeromq](http://zeromq.org/) implementation.


# Installing

```
$ npm install socket.io-zeromq
```

required the following:

- zeromq >= 4.0.4
- [socket.io-zeromq-server](https://github.com/kazupon/socket.io-zeromq-server)


# Usage

```js
var io = require('socket.io')(3000);
var zmq = require('socket.io-zeromq');
io.adapter(zmq({
  host: '127.0.0.1',
  pubPort: 5555,
  subPort: 5556
}));
```


# API

## adapter(opts)

The following options are allowed:

- `key`: the name of the key to pub/sub events on as prefix (`socket.io-zmq`)
- `host`: host to connect to zeromq pub/sub server on (`127.0.0.1`)
- `pubPort`: port to connect to publisher of zeromq pub/sub server on (`5555`)
- `subPort`: port to connect to subscriber of zeromq pub/sub server on (`5556`)
- `pubClient`: optional, the zeromq client to publish events on
- `subClient`: optional, the zeromq client to subscribe to events on

If you decide to supply `pubClient` and `subClient`, make sure you use [node-zeromq](https://github.com/JustinTulloss/zeromq.node) as a client or one with an equivalent API.


# Testing

First, run the socket.io zeromq server

```shell
$ socket.io-zeromq-server
```

after that, run the test.

```shell
$ make test
```


# License

[MIT license](http://www.opensource.org/licenses/mit-license.php).

See the `LICENSE`.
