"use strict";

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PydioStorage = (function () {
    PydioStorage.getSessionIdStorage = function getSessionIdStorage() {
        return pydio.Parameters.has("UNIQUE_SESSION_PER_BROWSER") ? window.localStorage : window.sessionStorage;
    };

    PydioStorage.getSessionStorage = function getSessionStorage() {
        return pydio.Parameters.has("UNIQUE_SESSION_PER_BROWSER") ? window.localStorage : storage;
    };

    function PydioStorage(props) {
        _classCallCheck(this, PydioStorage);

        this.aKeys = [];
        this.oStorage = {};
    }

    PydioStorage.prototype.getItem = function getItem(sKey) {
        var sValue = this.oStorage[sKey];
        return sValue || null;
    };

    PydioStorage.prototype.key = function key(nKeyId) {
        if (nKeyId >= this.aKeys.length) {
            return null;
        }

        return this.aKeys[nKeyId];
    };

    PydioStorage.prototype.setItem = function setItem(sKey, sValue) {
        if (!sKey) {
            return;
        }

        this.oStorage[sKey] = sValue;

        // Need to add or reset the key
        for (var i = 0; i < this.aKeys.length; i++) {
            if (sKey == this.aKeys[i]) {
                return;
            }
        }

        this.aKeys.push(sKey);
    };

    PydioStorage.prototype.removeItem = function removeItem(sKey) {
        if (!sKey) {
            return;
        }

        delete this.oStorage[sKey];

        // Need to add or reset the key
        for (var i = 0; i < this.aKeys.length; i++) {
            if (sKey == this.aKeys[i]) {
                this.aKeys.splice(i, 1);
            }
        }
    };

    _createClass(PydioStorage, [{
        key: "length",
        get: function get() {
            return this.aKeys.length;
        }
    }]);

    return PydioStorage;
})();

var storage = new PydioStorage();

exports["default"] = PydioStorage;
module.exports = exports["default"];
