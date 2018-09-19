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

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var withSelection = _Pydio$requireLib.withSelection;
var withMenu = _Pydio$requireLib.withMenu;
var withLoader = _Pydio$requireLib.withLoader;
var withErrors = _Pydio$requireLib.withErrors;
var EditorActions = _Pydio$requireLib.EditorActions;

var Viewer = (0, _redux.compose)(withMenu, withLoader, withErrors)(function (props) {
    return _react2['default'].createElement('div', props);
});

var getSelectionFilter = function getSelectionFilter(node) {
    return node.getMetadata().get('is_image') === '1';
};

var getSelection = function getSelection(node) {
    return new Promise(function (resolve, reject) {
        var selection = [];

        node.getParent().getChildren().forEach(function (child) {
            return selection.push(child);
        });
        selection = selection.filter(getSelectionFilter);

        resolve({
            selection: selection,
            currentIndex: selection.reduce(function (currentIndex, current, index) {
                return current === node && index || currentIndex;
            }, 0)
        });
    });
};

var Editor = (function (_Component) {
    _inherits(Editor, _Component);

    function Editor(props) {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).call(this, props);
        this.state = {
            data: {}
        };
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.node) {
                this.loadNodeContent(this.props);
            }
            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node && nextProps.node !== this.props.node) {
                this.loadNodeContent(nextProps);
            }
            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'loadNodeContent',
        value: function loadNodeContent(props) {
            var node = props.node;

            var data = {};
            if (node.getMetadata().has('ImageExif')) {
                data['ImageExif'] = node.getMetadata().get('ImageExif');
            }
            if (node.getMetadata().has('GeoLocation')) {
                data['GeoLocation'] = node.getMetadata().get('GeoLocation');
            }
            this.setState({ data: data });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var showControls = this.props.showControls;
            var data = this.state.data;

            if (!data) {
                return null;
            }

            return _react2['default'].createElement(
                Viewer,
                _extends({}, this.props, {
                    onLocate: showControls && data.GeoLocation ? function () {
                        return _this.openGpsLocator();
                    } : null,
                    style: { display: "flex", justifyContent: "space-around", flexFlow: "row wrap" }
                }),
                Object.keys(data).map(function (key) {
                    return _react2['default'].createElement(
                        _materialUi.Card,
                        { style: { margin: 10, overflow: "auto" } },
                        _react2['default'].createElement(
                            _materialUi.CardTitle,
                            { key: key + '-head' },
                            key
                        ),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            null,
                            _react2['default'].createElement(
                                _materialUi.Table,
                                { selectable: false },
                                _react2['default'].createElement(
                                    _materialUi.TableBody,
                                    { displayRowCheckbox: false },
                                    Object.keys(data[key]).map(function (itemKey) {
                                        return _react2['default'].createElement(
                                            _materialUi.TableRow,
                                            { key: key + '-' + itemKey },
                                            _react2['default'].createElement(
                                                _materialUi.TableRowColumn,
                                                null,
                                                itemKey
                                            ),
                                            _react2['default'].createElement(
                                                _materialUi.TableRowColumn,
                                                null,
                                                data[key][itemKey]
                                            )
                                        );
                                    })
                                )
                            )
                        )
                    );
                })
            );
        }
    }], [{
        key: 'controls',
        get: function get() {
            return {
                options: {
                    locate: function locate(handler) {
                        return _react2['default'].createElement(_materialUi.IconButton, { onClick: handler, iconClassName: 'mdi mdi-crosshairs-gps', tooltip: "Locate on a map" });
                    }
                }
            };
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    Editor = withSelection(getSelection)(Editor) || Editor;
    return Editor;
})(_react.Component);

exports['default'] = Editor;
module.exports = exports['default'];
