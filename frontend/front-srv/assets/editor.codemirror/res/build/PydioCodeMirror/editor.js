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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _CodeMirrorLoader = require('./CodeMirrorLoader');

var _CodeMirrorLoader2 = _interopRequireDefault(_CodeMirrorLoader);

var _reactMarkdown = require("react-markdown");

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var MdStyle = '\n.react-mui-context .mdviewer{\n    flex:1; \n    border-left:2px solid #e0e0e0; \n    padding:20px; \n    background-color:#fafafa;\n    overflow-y: auto;\n}\n.react-mui-context .mdviewer ul, .react-mui-context .mdviewer ol{\n    margin-left: 15px;\n}\n.react-mui-context .mdviewer code {\n    margin: 10px 0;\n    border-radius: 2px;\n    padding: 5px 10px;\n    background-color: #CFD8DC;\n}\n.react-mui-context .mdviewer pre code {\n    display: block;\n}\n';

function mapStateToProps(state, props) {
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
}

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).call(this, props);

        var _props = this.props;
        var node = _props.node;
        var _props$tab = _props.tab;
        var tab = _props$tab === undefined ? {} : _props$tab;
        var tabCreate = _props.tabCreate;
        var id = tab.id;

        if (!id) {
            tabCreate({ id: node.getLabel(), node: node });
        }
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var node = _props2.node;
            var tab = _props2.tab;
            var tabModify = _props2.tabModify;
            var id = tab.id;

            pydio.ApiClient.getPlainContent(node, function (content) {
                tabModify({ id: id || node.getLabel(), editable: true, editortools: true, searchable: true, lineNumbers: true, content: content });
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
            var tabModify = _props3.tabModify;

            if (!tab) return null;

            var id = tab.id;
            var content = tab.content;
            var lineWrapping = tab.lineWrapping;
            var lineNumbers = tab.lineNumbers;

            if (node.getAjxpMime() === 'md') {
                var show = _pydioUtilDom2['default'].getViewportWidth() > 480;
                return _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', flex: 1, width: '100%', backgroundColor: 'white' } },
                    _react2['default'].createElement(_CodeMirrorLoader2['default'], _extends({}, this.props, {
                        url: node.getPath(),
                        content: content,
                        options: { lineNumbers: lineNumbers, lineWrapping: lineWrapping },
                        error: error,

                        onLoad: function (codemirror) {
                            return tabModify({ id: id, codemirror: codemirror });
                        },
                        onChange: function (content) {
                            return tabModify({ id: id, content: content });
                        },
                        onCursorChange: function (cursor) {
                            return tabModify({ id: id, cursor: cursor });
                        },

                        cmStyle: { flex: 1, width: show ? '60%' : '100%' }
                    })),
                    show && _react2['default'].createElement(_reactMarkdown2['default'], { source: content, className: "mdviewer" }),
                    show && _react2['default'].createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: MdStyle } })
                );
            } else {
                return _react2['default'].createElement(_CodeMirrorLoader2['default'], _extends({}, this.props, {
                    url: node.getPath(),
                    content: content,
                    options: { lineNumbers: lineNumbers, lineWrapping: lineWrapping },
                    error: error,

                    onLoad: function (codemirror) {
                        return tabModify({ id: id, codemirror: codemirror });
                    },
                    onChange: function (content) {
                        return tabModify({ id: id, content: content });
                    },
                    onCursorChange: function (cursor) {
                        return tabModify({ id: id, cursor: cursor });
                    }
                }));
            }
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(mapStateToProps, EditorActions)(Editor) || Editor;
    return Editor;
})(_react2['default'].Component);

exports['default'] = Editor;
module.exports = exports['default'];
