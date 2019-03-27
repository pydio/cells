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

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _pydioHttpRestApi = require('pydio/http/rest-api');

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */

var MaskNodesProvider = (function (_MetaNodeProvider) {
    _inherits(MaskNodesProvider, _MetaNodeProvider);

    function MaskNodesProvider() {
        _classCallCheck(this, MaskNodesProvider);

        _get(Object.getPrototypeOf(MaskNodesProvider.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MaskNodesProvider, [{
        key: 'loadNode',

        /**
         * Load a node
         * @param node AjxpNode
         * @param nodeCallback Function On node loaded
         * @param childCallback Function On child added
         * @param recursive
         * @param depth
         * @param optionalParameters
         */
        value: function loadNode(node) {
            var nodeCallback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
            var childCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var recursive = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
            var depth = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
            var optionalParameters = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

            //console.log('MaskNodes', node);
            var api = new _pydioHttpRestApi.AdminTreeServiceApi(_pydioHttpApi2['default'].getRestClient());

            var listRequest = new _pydioHttpRestApi.TreeListNodesRequest();
            listRequest.Node = _pydioHttpRestApi.TreeNode.constructFromObject({ Path: node.getPath() });
            api.listAdminTree(listRequest).then(function (nodesColl) {
                var children = nodesColl.Children || [];
                children.forEach(function (c) {
                    var nodeChild = undefined;
                    try {
                        nodeChild = _pydioModelMetaNodeProvider2['default'].parseTreeNode(c, null);
                    } catch (e) {
                        console.log(e);
                        return;
                    }
                    if (childCallback) {
                        childCallback(nodeChild);
                    }
                    node.addChild(nodeChild);
                });
                if (nodeCallback !== null) {
                    nodeCallback(node);
                }
            })['catch'](function () {});
        }
    }]);

    return MaskNodesProvider;
})(_pydioModelMetaNodeProvider2['default']);

exports['default'] = MaskNodesProvider;
module.exports = exports['default'];
