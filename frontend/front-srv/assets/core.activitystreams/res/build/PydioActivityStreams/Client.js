/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var AS2Client = (function () {
    function AS2Client() {
        _classCallCheck(this, AS2Client);
    }

    _createClass(AS2Client, null, [{
        key: 'loadActivityStreams',
        value: function loadActivityStreams() {
            var context = arguments.length <= 0 || arguments[0] === undefined ? 'USER_ID' : arguments[0];
            var contextData = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            var boxName = arguments.length <= 2 || arguments[2] === undefined ? 'outbox' : arguments[2];
            var pointOfView = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
            var offset = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
            var limit = arguments.length <= 5 || arguments[5] === undefined ? -1 : arguments[5];

            if (!contextData) {
                return Promise.resolve([]);
            }
            var api = new _pydioHttpRestApi.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _pydioHttpRestApi.ActivityStreamActivitiesRequest();
            req.Context = context;
            req.ContextData = contextData;
            req.BoxName = boxName;
            if (offset > -1) {
                req.Offset = offset;
            }
            if (limit > -1) {
                req.Limit = limit;
            }
            req.Language = pydio.user.getPreference("lang") || '';
            if (pointOfView) {
                req.PointOfView = pointOfView;
            }
            return api.stream(req);
        }
    }, {
        key: 'UnreadInbox',
        value: function UnreadInbox(userId) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function (count) {} : arguments[1];

            var api = new _pydioHttpRestApi.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _pydioHttpRestApi.ActivityStreamActivitiesRequest();
            req.Context = 'USER_ID';
            req.ContextData = userId;
            req.BoxName = 'inbox';
            req.UnreadCountOnly = true;
            return api.stream(req).then(function (data) {
                return data.totalItems || 0;
            });
        }
    }]);

    return AS2Client;
})();

exports['default'] = AS2Client;
module.exports = exports['default'];
