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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _utils = require('../utils');

var _utils2 = require('./utils');

var withSelection = function withSelection(getSelection) {
    return function (Component) {
        var WithSelection = (function (_React$Component) {
            _inherits(WithSelection, _React$Component);

            function WithSelection(props) {
                _classCallCheck(this, WithSelection);

                _React$Component.call(this, props);

                var _props = this.props;
                var node = _props.node;
                var tab = _props.tab;
                var dispatch = _props.dispatch;

                var _ref = tab || {};

                var id = _ref.id;

                if (typeof dispatch === 'function') {
                    // We have a redux dispatch so we use it
                    this.setState = function (data) {
                        return dispatch(_utils.EditorActions.tabModify(_extends({ id: id }, data)));
                    };
                }
            }

            WithSelection.prototype.componentDidMount = function componentDidMount() {
                var _this = this;

                var _props2 = this.props;
                var tab = _props2.tab;
                var node = _props2.node;
                var tabModify = _props2.tabModify;
                var id = tab.id;

                getSelection(node).then(function (_ref2) {
                    var selection = _ref2.selection;
                    var currentIndex = _ref2.currentIndex;
                    return _this.setState({ id: id, selection: new _model2['default'](selection, currentIndex) });
                });
            };

            WithSelection.prototype.render = function render() {
                var _this2 = this;

                var _props3 = this.props;
                var tab = _props3.tab;
                var dispatch = _props3.dispatch;

                var remainingProps = _objectWithoutProperties(_props3, ['tab', 'dispatch']);

                var id = tab.id;
                var selection = tab.selection;
                var playing = tab.playing;

                if (!selection) {
                    return _react2['default'].createElement(Component, remainingProps);
                }

                return _react2['default'].createElement(Component, _extends({}, remainingProps, {
                    node: selection.current(),
                    selection: selection,
                    selectionPlaying: playing,

                    onRequestSelectionPlay: function () {
                        return _this2.setState({ id: id, node: selection.nextOrFirst(), title: selection.current().getLabel() });
                    }
                }));
            };

            _createClass(WithSelection, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithSelection(' + _utils.getDisplayName(Component) + ')';
                }
            }, {
                key: 'propTypes',
                get: function get() {
                    return {
                        node: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired
                    };
                }
            }]);

            return WithSelection;
        })(_react2['default'].Component);

        return _reactRedux.connect(_utils2.mapStateToProps)(WithSelection);
    };
};

exports['default'] = withSelection;
module.exports = exports['default'];
