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

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var Editor = (function (_Component) {
    _inherits(Editor, _Component);

    function Editor() {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Editor, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.loadNode(this.props);
        }
    }, {
        key: 'compomentWillReceiveProps',
        value: function compomentWillReceiveProps(nextProps) {
            if (this.props.node !== nextProps.node) {
                this.loadNode(nextProps);
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _props = this.props;
            var pydio = _props.pydio;
            var node = _props.node;
            var tab = _props.tab;
            var dispatch = _props.dispatch;
            var id = tab.id;

            pydio.ApiClient.getPlainContent(node, function (content) {
                dispatch(EditorActions.tabModify({ id: id, content: content }));
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var tab = _props2.tab;
            var dispatch = _props2.dispatch;
            var id = tab.id;
            var content = tab.content;

            return _react2['default'].createElement('textarea', {
                style: Editor.styles.textarea,
                onChange: function (_ref) {
                    var target = _ref.target;
                    return dispatch(EditorActions.tabModify({ id: id, content: target.value }));
                },
                value: content
            });
        }
    }], [{
        key: 'styles',
        get: function get() {
            return {
                textarea: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#fff',
                    fontSize: 13
                }
            };
        }
    }]);

    return Editor;
})(_react.Component);

var _PydioHOCs = PydioHOCs;
var withMenu = _PydioHOCs.withMenu;
var withLoader = _PydioHOCs.withLoader;
var withErrors = _PydioHOCs.withErrors;
var withControls = _PydioHOCs.withControls;

var mapStateToProps = function mapStateToProps(state, props) {
    var tabs = state.tabs;

    var tab = tabs.filter(function (_ref2) {
        var editorData = _ref2.editorData;
        var node = _ref2.node;
        return (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath();
    })[0] || {};

    return _extends({
        id: tab.id,
        tab: tab
    }, props);
};

exports['default'] = (0, _redux.compose)((0, _reactRedux.connect)(mapStateToProps))(Editor);
module.exports = exports['default'];
