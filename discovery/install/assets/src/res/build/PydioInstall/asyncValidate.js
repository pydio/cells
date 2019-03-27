'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var sleep = function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var asyncValidate = function asyncValidate(values /*, dispatch */) {
  return sleep(1000) // simulate server latency
  .then(function () {
    if (['foo@foo.com', 'bar@bar.com'].includes(values.email)) {
      throw { email: 'Email already Exists' };
    }
  });
};

exports.default = asyncValidate;
