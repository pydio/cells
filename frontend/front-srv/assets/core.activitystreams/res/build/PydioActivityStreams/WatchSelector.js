/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var WatchSelector = (function (_React$Component) {
    _inherits(WatchSelector, _React$Component);

    function WatchSelector(props) {
        _classCallCheck(this, WatchSelector);

        _get(Object.getPrototypeOf(WatchSelector.prototype), 'constructor', this).call(this, props);
        var nodes = this.props.nodes;

        this.state = this.valueFromNodes(nodes);
    }

    _createClass(WatchSelector, [{
        key: 'valueFromNodes',
        value: function valueFromNodes() {
            var nodes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            var mixed = false,
                value = undefined;
            nodes.forEach(function (n) {
                var nVal = n.getMetadata().get('meta_watched') || '';
                if (value !== undefined && nVal !== value) {
                    mixed = true;
                }
                value = nVal;
            });
            return { value: value, mixed: mixed };
        }
    }, {
        key: 'onSelectorChange',
        value: function onSelectorChange(value) {
            var _this = this;

            if (value === 'mixed') {
                return;
            }

            var _props = this.props;
            var pydio = _props.pydio;
            var nodes = _props.nodes;

            this.setState({ saving: true });

            var proms = nodes.map(function (node) {
                var nodeUuid = node.getMetadata().get('uuid');
                var userId = pydio.user.id;
                var subscription = new _pydioHttpRestApi.ActivitySubscription();
                var type = new _pydioHttpRestApi.ActivityOwnerType();
                subscription.UserId = userId;
                subscription.ObjectId = nodeUuid;
                subscription.ObjectType = type.NODE;
                var events = [];
                if (value === 'META_WATCH_CHANGE' || value === 'META_WATCH_BOTH') {
                    events.push('change');
                }
                if (value === 'META_WATCH_READ' || value === 'META_WATCH_BOTH') {
                    events.push('read');
                }
                subscription.Events = events;
                var api = new _pydioHttpRestApi.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
                return api.subscribe(subscription).then(function (outSub) {
                    var overlay = node.getMetadata().get('overlay_class') || '';
                    if (value === '') {
                        node.getMetadata()['delete']('meta_watched');
                        node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-bell', ''));
                    } else {
                        node.getMetadata().set('meta_watched', value);
                        var overlays = overlay.replace('mdi mdi-bell', '').split(',');
                        overlays.push('mdi mdi-bell');
                        node.getMetadata().set('overlay_class', overlays.join(','));
                    }
                    node.notify('node_replaced');
                });
            });
            Promise.all(proms).then(function () {
                _this.setState({ value: value, mixed: false });
                window.setTimeout(function () {
                    _this.setState({ saving: false });
                }, 250);
            })['catch'](function () {
                _this.setState({ saving: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var value = _state.value;
            var mixed = _state.mixed;
            var saving = _state.saving;

            var mm = _pydio2['default'].getInstance().MessageHash;

            if (saving) {
                return _react2['default'].createElement(
                    ModernSelectField,
                    { value: "saving", onChange: function (e, i, v) {}, disabled: true },
                    _react2['default'].createElement(_materialUi.MenuItem, { value: "saving", primaryText: mm['meta.watch.selector.saving'] + "..." })
                );
            }

            return _react2['default'].createElement(
                ModernSelectField,
                { value: mixed ? 'mixed' : value, onChange: function (e, i, v) {
                        _this2.onSelectorChange(v);
                    } },
                mixed && _react2['default'].createElement(_materialUi.MenuItem, { value: "mixed", primaryText: mm['meta.watch.selector.mixed'] + "..." }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "", primaryText: mm['meta.watch.selector.ignore'] }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "META_WATCH_READ", primaryText: mm['meta.watch.selector.read'] }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "META_WATCH_CHANGE", primaryText: mm['meta.watch.selector.change'] }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "META_WATCH_BOTH", primaryText: mm['meta.watch.selector.both'] })
            );
        }
    }]);

    return WatchSelector;
})(_react2['default'].Component);

exports['default'] = WatchSelector;
module.exports = exports['default'];
