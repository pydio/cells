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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _materialUi = require('material-ui');

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var PydioApi = require('pydio/http/api');

var _Pydio$requireLib = _pydio2['default'].requireLib("hoc");

var withSelection = _Pydio$requireLib.withSelection;
var EditorActions = _Pydio$requireLib.EditorActions;
var withMenu = _Pydio$requireLib.withMenu;
var withLoader = _Pydio$requireLib.withLoader;
var withErrors = _Pydio$requireLib.withErrors;
var withControls = _Pydio$requireLib.withControls;

var editors = _pydio2['default'].getInstance().Registry.getActiveExtensionByType("editor");
var conf = editors.filter(function (_ref) {
    var id = _ref.id;
    return id === 'editor.soundmanager';
})[0];

var getSelectionFilter = function getSelectionFilter(node) {
    return conf.mimes.indexOf(node.getAjxpMime()) > -1;
};

var getSelection = function getSelection(node) {
    return new Promise(function (resolve, reject) {
        var selection = [];

        node.getParent().getChildren().forEach(function (child) {
            return selection.push(child);
        });
        selection = selection.filter(getSelectionFilter).sort(function (a, b) {
            return a.getLabel().localeCompare(b.getLabel(), undefined, { numeric: true });
        });

        resolve({
            selection: selection,
            currentIndex: selection.reduce(function (currentIndex, current, index) {
                return current === node && index || currentIndex;
            }, 0)
        });
    });
};

var styles = {
    container: {
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1
    },
    player: {
        margin: "auto"
    },
    table: {
        width: 320
    }
};

var Editor = (function (_Component) {
    _inherits(Editor, _Component);

    function Editor() {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);
            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: false });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this = this;

            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: false });
            }
            if (nextProps.node !== this.props.node) {
                this.setState({ url: '' }, function () {
                    _this.loadNode(nextProps);
                });
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this2 = this;

            var node = props.node;

            PydioApi.getClient().buildPresignedGetUrl(node, function (url) {
                _this2.setState({
                    node: node,
                    url: url,
                    mimeType: "audio/" + node.getAjxpMime()
                });
            }, "audio/" + node.getAjxpMime());
        }
    }, {
        key: 'playNext',
        value: function playNext() {
            var selection = this.props.selection;
            var node = this.state.node;

            var index = selection.selection.indexOf(node);
            if (index < selection.selection.length - 1) {
                this.onRowSelection([index + 1]);
            }
        }
    }, {
        key: 'onRowSelection',
        value: function onRowSelection(data) {
            var _this3 = this;

            if (!data.length) return;
            var selection = this.props.selection;

            if (!selection) return;
            this.setState({ url: null }, function () {
                _this3.loadNode({ node: selection.selection[data[0]] });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _ref2 = this.state || {};

            var mimeType = _ref2.mimeType;
            var url = _ref2.url;
            var node = _ref2.node;

            return _react2['default'].createElement(
                'div',
                { style: styles.container },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 3, style: styles.player },
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 60px' } },
                        url && _react2['default'].createElement(
                            _Player2['default'],
                            { autoPlay: true, rich: !this.props.icon && this.props.rich, onReady: this.props.onLoad, onFinish: function () {
                                    _this4.playNext();
                                } },
                            _react2['default'].createElement('a', { type: mimeType, href: url })
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { clear: 'both' } },
                        _react2['default'].createElement(
                            _materialUi.Table,
                            {
                                style: styles.table,
                                selectable: true,
                                multiSelectable: false,
                                height: 250,
                                onRowSelection: function (data) {
                                    _this4.onRowSelection(data);
                                }
                            },
                            _react2['default'].createElement(
                                _materialUi.TableBody,
                                {
                                    displayRowCheckbox: false,
                                    stripedRows: false,
                                    deselectOnClickaway: false
                                },
                                this.props.selection && this.props.selection.selection.map(function (n, index) {
                                    return _react2['default'].createElement(
                                        _materialUi.TableRow,
                                        { key: index },
                                        _react2['default'].createElement(
                                            _materialUi.TableRowColumn,
                                            { style: { width: 16, backgroundColor: 'white' } },
                                            node && n.getPath() === node.getPath() ? _react2['default'].createElement('span', { className: "mdi mdi-play" }) : index
                                        ),
                                        _react2['default'].createElement(
                                            _materialUi.TableRowColumn,
                                            { style: { backgroundColor: 'white' } },
                                            n.getLabel()
                                        )
                                    );
                                })
                            )
                        )
                    )
                )
            );
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    Editor = withSelection(getSelection)(Editor) || Editor;
    return Editor;
})(_react.Component);

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

exports['default'] = Editor;
module.exports = exports['default'];
