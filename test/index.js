/**
 * import(s)
 */

var expect = require('expect.js');
var zeromqAdapter = require('../');


/**
 * test(s)
 */

describe('socket.io-zeromq', function () {
  it('should be ok', function (done) {
    expect(zeromqAdapter()).to.be.ok;
    done();
  });
});
