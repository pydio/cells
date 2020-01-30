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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Search input building a set of query parameters and calling
 * the callbacks to display / hide results
 */

var UsersSearchBox = (function (_React$Component) {
    _inherits(UsersSearchBox, _React$Component);

    function UsersSearchBox(props) {
        _classCallCheck(this, UsersSearchBox);

        _get(Object.getPrototypeOf(UsersSearchBox.prototype), 'constructor', this).call(this, props);
        var dm = new _pydioModelDataModel2['default']();
        dm.setRootNode(new _pydioModelNode2['default']());
        this.state = {
            dataModel: dm,
            displayResult: props.displayResultsState,
            crtValue: ''
        };
        this.searchDebounced = (0, _lodashDebounce2['default'])(this.triggerSearch, 350);
    }

    _createClass(UsersSearchBox, [{
        key: 'displayResultsState',
        value: function displayResultsState() {
            this.setState({
                displayResult: true
            });
        }
    }, {
        key: 'hideResultsState',
        value: function hideResultsState() {
            this.setState({
                displayResult: false
            });
            this.props.hideResults();
        }
    }, {
        key: 'triggerSearch',
        value: function triggerSearch() {
            var _this = this;

            var value = this.state.crtValue;
            if (!value) {
                this.hideResultsState();
                this.refs.query.blur();
                return;
            }
            var dm = this.state.dataModel;
            var limit = this.props.limit || 100;
            dm.getRootNode().setChildren([]);
            var p1 = _pydioHttpApi2['default'].getRestClient().getIdmApi().listGroups('/', value, true, 0, limit);
            var p2 = _pydioHttpApi2['default'].getRestClient().getIdmApi().listUsers('/', value, true, 0, limit);
            Promise.all([p1, p2]).then(function (result) {
                var groups = result[0];
                var users = result[1];
                groups.Groups.map(function (group) {
                    var label = group.Attributes && group.Attributes['displayName'] ? group.Attributes['displayName'] : group.GroupLabel;
                    var gNode = new _pydioModelNode2['default']('/idm/users' + _pydioUtilLang2['default'].trimRight(group.GroupPath, '/') + '/' + group.GroupLabel, false, label);
                    gNode.getMetadata().set('IdmUser', group);
                    gNode.getMetadata().set('ajxp_mime', 'group');
                    dm.getRootNode().addChild(gNode);
                });
                users.Users.map(function (user) {
                    var label = user.Attributes && user.Attributes['displayName'] ? user.Attributes['displayName'] : user.Login;
                    var uNode = new _pydioModelNode2['default']('/idm/users' + user.Login, true, label);
                    uNode.getMetadata().set('IdmUser', user);
                    uNode.getMetadata().set('ajxp_mime', 'user_editable');
                    dm.getRootNode().addChild(uNode);
                });
                dm.getRootNode().setLoaded(true);
                _this.displayResultsState();
                _this.props.displayResults(value, dm);
            });
        }
    }, {
        key: 'keyDown',
        value: function keyDown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.triggerSearch();
            } else {
                this.searchDebounced();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var crtValue = this.state.crtValue;

            return _react2['default'].createElement(
                'div',
                { className: this.props.className ? this.props.className : '', style: _extends({ display: 'flex', alignItems: 'center' }, this.props.style) },
                _react2['default'].createElement('div', { style: { flex: 1 } }),
                _react2['default'].createElement(
                    'div',
                    { style: { maxWidth: 190 } },
                    _react2['default'].createElement(
                        'form',
                        { autoComplete: "off" },
                        _react2['default'].createElement(ModernTextField, {
                            ref: "query",
                            onKeyDown: this.keyDown.bind(this),
                            hintText: this.props.textLabel,
                            fullWidth: true,
                            value: crtValue,
                            onChange: function (e, v) {
                                _this2.setState({ crtValue: v });
                            }
                        })
                    )
                )
            );
        }
    }]);

    return UsersSearchBox;
})(_react2['default'].Component);

UsersSearchBox.PropTypes = {
    textLabel: _react2['default'].PropTypes.string,
    displayResults: _react2['default'].PropTypes.func,
    hideResults: _react2['default'].PropTypes.func,
    displayResultsState: _react2['default'].PropTypes.bool,
    limit: _react2['default'].PropTypes.number,
    style: _react2['default'].PropTypes.object
};

exports['default'] = UsersSearchBox;
module.exports = exports['default'];
