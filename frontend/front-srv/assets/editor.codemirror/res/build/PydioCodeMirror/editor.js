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

var _CodeMirrorLoader = require('./CodeMirrorLoader');

var _CodeMirrorLoader2 = _interopRequireDefault(_CodeMirrorLoader);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).call(this, props);

        var _props = this.props;
        var node = _props.node;
        var tab = _props.tab;
        var dispatch = _props.dispatch;
        var id = tab.id;

        if (!id) dispatch(EditorActions.tabCreate({ id: node.getLabel(), node: node }));
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var node = _props2.node;
            var tab = _props2.tab;
            var dispatch = _props2.dispatch;
            var id = tab.id;

            pydio.ApiClient.getPlainContent(node, function (content) {
                dispatch(EditorActions.tabModify({ id: id || node.getLabel(), editable: true, searchable: true, content: content }));
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var editorModify = this.props.editorModify;

            if (editorModify && nextProps.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props;
            var node = _props3.node;
            var tab = _props3.tab;
            var error = _props3.error;
            var dispatch = _props3.dispatch;

            if (!tab) return null;

            var id = tab.id;
            var codemirror = tab.codemirror;
            var content = tab.content;
            var lineWrapping = tab.lineWrapping;
            var lineNumbers = tab.lineNumbers;

            return _react2['default'].createElement(_CodeMirrorLoader2['default'], _extends({}, this.props, {
                url: node.getPath(),
                content: content,
                options: { lineNumbers: lineNumbers, lineWrapping: lineWrapping },
                error: error,

                onLoad: function (codemirror) {
                    return dispatch(EditorActions.tabModify({ id: id, codemirror: codemirror }));
                },
                onChange: function (content) {
                    return dispatch(EditorActions.tabModify({ id: id, content: content }));
                },
                onCursorChange: function (cursor) {
                    return dispatch(EditorActions.tabModify({ id: id, cursor: cursor }));
                }
            }));
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    return Editor;
})(_react2['default'].Component);

var mapStateToProps = function mapStateToProps(state, props) {
    var tabs = state.tabs;

    var tab = tabs.filter(function (_ref) {
        var editorData = _ref.editorData;
        var node = _ref.node;
        return (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath();
    })[0] || {};

    return _extends({
        id: tab.id,
        tab: tab
    }, props);
};

exports.mapStateToProps = mapStateToProps;
exports['default'] = (0, _reactRedux.connect)(mapStateToProps)(Editor);
