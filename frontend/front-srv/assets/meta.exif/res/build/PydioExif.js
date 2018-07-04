(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioExif = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _PydioHOCs = PydioHOCs;
var SelectionControls = _PydioHOCs.SelectionControls;
var LocalisationControls = _PydioHOCs.LocalisationControls;
exports.SelectionControls = SelectionControls;
exports.LocalisationControls = LocalisationControls;

},{}],2:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _materialUi = require('material-ui');

var _PydioHOCs = PydioHOCs;
var withSelection = _PydioHOCs.withSelection;

var Editor = (function (_Component) {
    _inherits(Editor, _Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).call(this, props);

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
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node && nextProps.node !== this.props.node) {
                this.loadNodeContent(nextProps);
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
                        { style: { width: "calc(50% - 20px)", margin: 10, overflow: "auto" } },
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

    return Editor;
})(_react.Component);

var _PydioHOCs2 = PydioHOCs;
var withMenu = _PydioHOCs2.withMenu;
var withLoader = _PydioHOCs2.withLoader;
var withErrors = _PydioHOCs2.withErrors;
var withControls = _PydioHOCs2.withControls;

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

exports['default'] = (0, _redux.compose)(withSelection(getSelection), (0, _reactRedux.connect)())(Editor);
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react","react-redux":"react-redux","redux":"redux"}],3:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _controls = require('./controls');

var Controls = _interopRequireWildcard(_controls);

var _editor = require('./editor');

var _editor2 = _interopRequireDefault(_editor);

var _panel = require('./panel');

var _panel2 = _interopRequireDefault(_panel);

exports.Editor = _editor2['default'];
exports.Panel = _panel2['default'];
exports.Controls = Controls;

},{"./controls":1,"./editor":2,"./panel":4}],4:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Panel = (function (_Component) {
    _inherits(Panel, _Component);

    function Panel() {
        _classCallCheck(this, Panel);

        _get(Object.getPrototypeOf(Panel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Panel, [{
        key: 'parseValues',
        value: function parseValues(node) {
            var _this = this;

            var configs = this.props.pydio.getPluginConfigs('meta.exif');
            if (!configs.has('exif_meta_fields') || !configs.has('exif_meta_labels')) {
                return;
            }
            var fieldsLabels = {};
            var metaFields = configs.get('exif_meta_fields').split(',');
            var metaLabels = configs.get('exif_meta_labels').split(',');
            metaFields.map(function (k, i) {
                fieldsLabels[k] = metaLabels[i];
            });
            var nodeMeta = node.getMetadata();
            var items = metaFields.map(function (key) {
                return key.split('.');
            }).filter(function (secField) {
                return secField.length === 2 && nodeMeta.has(secField[0]) && nodeMeta.get(secField[0])[secField[1]];
            }).map(function (secField) {
                return {
                    key: secField.join('.'),
                    label: fieldsLabels[secField.join('.')],
                    value: nodeMeta.get(secField[0])[secField[1]]
                };
            });

            if (nodeMeta.has('GeoLocation') && nodeMeta.get('GeoLocation')['lat'] && nodeMeta.get('GeoLocation')['lon']) {
                ResourcesManager.loadClassesAndApply(['OpenLayers', 'PydioMaps'], function () {
                    return _this.setState({ gpsData: true });
                });
            }

            this.setState({ items: items });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.parseValues(this.props.node);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node !== this.props.node) {
                this.setState({ gpsData: null });
                this.parseValues(nextProps.node);
            }
        }
    }, {
        key: 'mapLoaded',
        value: function mapLoaded(map, error) {
            if (error && console) console.log(error);
        }
    }, {
        key: 'openInExifEditor',
        value: function openInExifEditor() {
            var _props = this.props;
            var pydio = _props.pydio;
            var node = _props.node;

            var editor = pydio.Registry.findEditorById("editor.exif");
            if (editor) {
                pydio.UI.openCurrentSelectionInEditor(editor, node);
            }
        }
    }, {
        key: 'openInMapEditor',
        value: function openInMapEditor() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var node = _props2.node;

            var editors = pydio.Registry.findEditorsForMime("ol_layer");
            if (editors.length) {
                pydio.UI.openCurrentSelectionInEditor(editors[0], node);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var items = [];
            var actions = [];
            var labelStyle = {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            };
            if (this.state && this.state.items && this.state.items.length) {

                var fields = this.state.items.map(function (object) {
                    return _react2['default'].createElement(
                        'div',
                        { key: object.key, className: 'infoPanelRow', style: { float: 'left', width: '50%', padding: '0 4px 12px', whiteSpace: 'nowrap' } },
                        _react2['default'].createElement(
                            'div',
                            { className: 'infoPanelLabel' },
                            object.label
                        ),
                        _react2['default'].createElement(
                            'div',
                            { className: 'infoPanelValue', title: object.value, style: labelStyle },
                            object.value
                        )
                    );
                });
                items.push(_react2['default'].createElement(
                    'div',
                    { style: { padding: '0 12px' } },
                    fields
                ));
                items.push(_react2['default'].createElement('div', { style: { clear: 'left' } }));

                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                        return _this2.openInExifEditor();
                    }, label: this.props.pydio.MessageHash['456'] }));
            }
            if (this.state && this.state.gpsData) {
                items.push(_react2['default'].createElement(PydioReactUI.AsyncComponent, {
                    namespace: 'PydioMaps',
                    componentName: 'OLMap',
                    key: 'map',
                    style: { height: 170, marginBottom: 0, padding: 0 },
                    centerNode: this.props.node,
                    mapLoaded: this.mapLoaded
                }));
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                        return _this2.openInMapEditor();
                    }, label: this.props.pydio.MessageHash['meta.exif.2'] }));
            }

            if (!items.length) {
                return null;
            }
            return _react2['default'].createElement(
                PydioWorkspaces.InfoPanelCard,
                { identifier: "meta-exif", style: this.props.style, title: this.props.pydio.MessageHash['meta.exif.3'], actions: actions, icon: 'camera', iconColor: '#607d8b' },
                items
            );
        }
    }]);

    return Panel;
})(_react.Component);

exports['default'] = Panel;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9FeGlmL2NvbnRyb2xzLmpzIiwicmVzL2J1aWxkL1B5ZGlvRXhpZi9lZGl0b3IuanMiLCJyZXMvYnVpbGQvUHlkaW9FeGlmL2luZGV4LmpzIiwicmVzL2J1aWxkL1B5ZGlvRXhpZi9wYW5lbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBfUHlkaW9IT0NzID0gUHlkaW9IT0NzO1xudmFyIFNlbGVjdGlvbkNvbnRyb2xzID0gX1B5ZGlvSE9Dcy5TZWxlY3Rpb25Db250cm9scztcbnZhciBMb2NhbGlzYXRpb25Db250cm9scyA9IF9QeWRpb0hPQ3MuTG9jYWxpc2F0aW9uQ29udHJvbHM7XG5leHBvcnRzLlNlbGVjdGlvbkNvbnRyb2xzID0gU2VsZWN0aW9uQ29udHJvbHM7XG5leHBvcnRzLkxvY2FsaXNhdGlvbkNvbnRyb2xzID0gTG9jYWxpc2F0aW9uQ29udHJvbHM7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1B5ZGlvSE9DcyA9IFB5ZGlvSE9DcztcbnZhciB3aXRoU2VsZWN0aW9uID0gX1B5ZGlvSE9Dcy53aXRoU2VsZWN0aW9uO1xuXG52YXIgRWRpdG9yID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEVkaXRvciwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBFZGl0b3IocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVkaXRvcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoRWRpdG9yLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBkYXRhOiB7fVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFZGl0b3IsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5vZGVDb250ZW50KHRoaXMucHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLm5vZGUgJiYgbmV4dFByb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5vZGVDb250ZW50KG5leHRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWROb2RlQ29udGVudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkTm9kZUNvbnRlbnQocHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIGlmIChub2RlLmdldE1ldGFkYXRhKCkuaGFzKCdJbWFnZUV4aWYnKSkge1xuICAgICAgICAgICAgICAgIGRhdGFbJ0ltYWdlRXhpZiddID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgnSW1hZ2VFeGlmJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5nZXRNZXRhZGF0YSgpLmhhcygnR2VvTG9jYXRpb24nKSkge1xuICAgICAgICAgICAgICAgIGRhdGFbJ0dlb0xvY2F0aW9uJ10gPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdHZW9Mb2NhdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRhdGE6IGRhdGEgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgc2hvd0NvbnRyb2xzID0gdGhpcy5wcm9wcy5zaG93Q29udHJvbHM7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc3RhdGUuZGF0YTtcblxuICAgICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBWaWV3ZXIsXG4gICAgICAgICAgICAgICAgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgICAgICAgICAgb25Mb2NhdGU6IHNob3dDb250cm9scyAmJiBkYXRhLkdlb0xvY2F0aW9uID8gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLm9wZW5HcHNMb2NhdG9yKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBkaXNwbGF5OiBcImZsZXhcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYXJvdW5kXCIsIGZsZXhGbG93OiBcInJvdyB3cmFwXCIgfVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiBcImNhbGMoNTAlIC0gMjBweClcIiwgbWFyZ2luOiAxMCwgb3ZlcmZsb3c6IFwiYXV0b1wiIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNhcmRUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGtleToga2V5ICsgJy1oZWFkJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNhcmRUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHNlbGVjdGFibGU6IGZhbHNlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGVCb2R5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBkaXNwbGF5Um93Q2hlY2tib3g6IGZhbHNlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhkYXRhW2tleV0pLm1hcChmdW5jdGlvbiAoaXRlbUtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGVSb3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiBrZXkgKyAnLScgKyBpdGVtS2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGVSb3dDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUtleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYmxlUm93Q29sdW1uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XVtpdGVtS2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgICAga2V5OiAnY29udHJvbHMnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBsb2NhdGU6IGZ1bmN0aW9uIGxvY2F0ZShoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVyLCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1jcm9zc2hhaXJzLWdwcycsIHRvb2x0aXA6IFwiTG9jYXRlIG9uIGEgbWFwXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVkaXRvcjtcbn0pKF9yZWFjdC5Db21wb25lbnQpO1xuXG52YXIgX1B5ZGlvSE9DczIgPSBQeWRpb0hPQ3M7XG52YXIgd2l0aE1lbnUgPSBfUHlkaW9IT0NzMi53aXRoTWVudTtcbnZhciB3aXRoTG9hZGVyID0gX1B5ZGlvSE9DczIud2l0aExvYWRlcjtcbnZhciB3aXRoRXJyb3JzID0gX1B5ZGlvSE9DczIud2l0aEVycm9ycztcbnZhciB3aXRoQ29udHJvbHMgPSBfUHlkaW9IT0NzMi53aXRoQ29udHJvbHM7XG5cbnZhciBWaWV3ZXIgPSAoMCwgX3JlZHV4LmNvbXBvc2UpKHdpdGhNZW51LCB3aXRoTG9hZGVyLCB3aXRoRXJyb3JzKShmdW5jdGlvbiAocHJvcHMpIHtcbiAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHByb3BzKTtcbn0pO1xuXG52YXIgZ2V0U2VsZWN0aW9uRmlsdGVyID0gZnVuY3Rpb24gZ2V0U2VsZWN0aW9uRmlsdGVyKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgnaXNfaW1hZ2UnKSA9PT0gJzEnO1xufTtcblxudmFyIGdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uIGdldFNlbGVjdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IFtdO1xuXG4gICAgICAgIG5vZGUuZ2V0UGFyZW50KCkuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5maWx0ZXIoZ2V0U2VsZWN0aW9uRmlsdGVyKTtcblxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIHNlbGVjdGlvbjogc2VsZWN0aW9uLFxuICAgICAgICAgICAgY3VycmVudEluZGV4OiBzZWxlY3Rpb24ucmVkdWNlKGZ1bmN0aW9uIChjdXJyZW50SW5kZXgsIGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQgPT09IG5vZGUgJiYgaW5kZXggfHwgY3VycmVudEluZGV4O1xuICAgICAgICAgICAgfSwgMClcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSAoMCwgX3JlZHV4LmNvbXBvc2UpKHdpdGhTZWxlY3Rpb24oZ2V0U2VsZWN0aW9uKSwgKDAsIF9yZWFjdFJlZHV4LmNvbm5lY3QpKCkpKEVkaXRvcik7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqWydkZWZhdWx0J10gPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG52YXIgX2NvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scycpO1xuXG52YXIgQ29udHJvbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfY29udHJvbHMpO1xuXG52YXIgX2VkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbnZhciBfZWRpdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2VkaXRvcik7XG5cbnZhciBfcGFuZWwgPSByZXF1aXJlKCcuL3BhbmVsJyk7XG5cbnZhciBfcGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGFuZWwpO1xuXG5leHBvcnRzLkVkaXRvciA9IF9lZGl0b3IyWydkZWZhdWx0J107XG5leHBvcnRzLlBhbmVsID0gX3BhbmVsMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5Db250cm9scyA9IENvbnRyb2xzO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgUGFuZWwgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUGFuZWwsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUGFuZWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ3BhcnNlVmFsdWVzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhcnNlVmFsdWVzKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5wcm9wcy5weWRpby5nZXRQbHVnaW5Db25maWdzKCdtZXRhLmV4aWYnKTtcbiAgICAgICAgICAgIGlmICghY29uZmlncy5oYXMoJ2V4aWZfbWV0YV9maWVsZHMnKSB8fCAhY29uZmlncy5oYXMoJ2V4aWZfbWV0YV9sYWJlbHMnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmaWVsZHNMYWJlbHMgPSB7fTtcbiAgICAgICAgICAgIHZhciBtZXRhRmllbGRzID0gY29uZmlncy5nZXQoJ2V4aWZfbWV0YV9maWVsZHMnKS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgdmFyIG1ldGFMYWJlbHMgPSBjb25maWdzLmdldCgnZXhpZl9tZXRhX2xhYmVscycpLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICBtZXRhRmllbGRzLm1hcChmdW5jdGlvbiAoaywgaSkge1xuICAgICAgICAgICAgICAgIGZpZWxkc0xhYmVsc1trXSA9IG1ldGFMYWJlbHNbaV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBub2RlTWV0YSA9IG5vZGUuZ2V0TWV0YWRhdGEoKTtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IG1ldGFGaWVsZHMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnNwbGl0KCcuJyk7XG4gICAgICAgICAgICB9KS5maWx0ZXIoZnVuY3Rpb24gKHNlY0ZpZWxkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlY0ZpZWxkLmxlbmd0aCA9PT0gMiAmJiBub2RlTWV0YS5oYXMoc2VjRmllbGRbMF0pICYmIG5vZGVNZXRhLmdldChzZWNGaWVsZFswXSlbc2VjRmllbGRbMV1dO1xuICAgICAgICAgICAgfSkubWFwKGZ1bmN0aW9uIChzZWNGaWVsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogc2VjRmllbGQuam9pbignLicpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogZmllbGRzTGFiZWxzW3NlY0ZpZWxkLmpvaW4oJy4nKV0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBub2RlTWV0YS5nZXQoc2VjRmllbGRbMF0pW3NlY0ZpZWxkWzFdXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKG5vZGVNZXRhLmhhcygnR2VvTG9jYXRpb24nKSAmJiBub2RlTWV0YS5nZXQoJ0dlb0xvY2F0aW9uJylbJ2xhdCddICYmIG5vZGVNZXRhLmdldCgnR2VvTG9jYXRpb24nKVsnbG9uJ10pIHtcbiAgICAgICAgICAgICAgICBSZXNvdXJjZXNNYW5hZ2VyLmxvYWRDbGFzc2VzQW5kQXBwbHkoWydPcGVuTGF5ZXJzJywgJ1B5ZGlvTWFwcyddLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5zZXRTdGF0ZSh7IGdwc0RhdGE6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpdGVtczogaXRlbXMgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5wYXJzZVZhbHVlcyh0aGlzLnByb3BzLm5vZGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBncHNEYXRhOiBudWxsIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VWYWx1ZXMobmV4dFByb3BzLm5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdtYXBMb2FkZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbWFwTG9hZGVkKG1hcCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChlcnJvciAmJiBjb25zb2xlKSBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5JbkV4aWZFZGl0b3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkluRXhpZkVkaXRvcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgdmFyIGVkaXRvciA9IHB5ZGlvLlJlZ2lzdHJ5LmZpbmRFZGl0b3JCeUlkKFwiZWRpdG9yLmV4aWZcIik7XG4gICAgICAgICAgICBpZiAoZWRpdG9yKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8uVUkub3BlbkN1cnJlbnRTZWxlY3Rpb25JbkVkaXRvcihlZGl0b3IsIG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuSW5NYXBFZGl0b3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkluTWFwRWRpdG9yKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzMi5ub2RlO1xuXG4gICAgICAgICAgICB2YXIgZWRpdG9ycyA9IHB5ZGlvLlJlZ2lzdHJ5LmZpbmRFZGl0b3JzRm9yTWltZShcIm9sX2xheWVyXCIpO1xuICAgICAgICAgICAgaWYgKGVkaXRvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8uVUkub3BlbkN1cnJlbnRTZWxlY3Rpb25JbkVkaXRvcihlZGl0b3JzWzBdLCBub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgICAgICAgICB2YXIgbGFiZWxTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5pdGVtcyAmJiB0aGlzLnN0YXRlLml0ZW1zLmxlbmd0aCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpZWxkcyA9IHRoaXMuc3RhdGUuaXRlbXMubWFwKGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGtleTogb2JqZWN0LmtleSwgY2xhc3NOYW1lOiAnaW5mb1BhbmVsUm93Jywgc3R5bGU6IHsgZmxvYXQ6ICdsZWZ0Jywgd2lkdGg6ICc1MCUnLCBwYWRkaW5nOiAnMCA0cHggMTJweCcsIHdoaXRlU3BhY2U6ICdub3dyYXAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsTGFiZWwnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LmxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScsIHRpdGxlOiBvYmplY3QudmFsdWUsIHN0eWxlOiBsYWJlbFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMTJweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiB7IGNsZWFyOiAnbGVmdCcgfSB9KSk7XG5cbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMyLm9wZW5JbkV4aWZFZGl0b3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgbGFiZWw6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJzQ1NiddIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuZ3BzRGF0YSkge1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUHlkaW9SZWFjdFVJLkFzeW5jQ29tcG9uZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogJ1B5ZGlvTWFwcycsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6ICdPTE1hcCcsXG4gICAgICAgICAgICAgICAgICAgIGtleTogJ21hcCcsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGhlaWdodDogMTcwLCBtYXJnaW5Cb3R0b206IDAsIHBhZGRpbmc6IDAgfSxcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyTm9kZTogdGhpcy5wcm9wcy5ub2RlLFxuICAgICAgICAgICAgICAgICAgICBtYXBMb2FkZWQ6IHRoaXMubWFwTG9hZGVkXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczIub3BlbkluTWFwRWRpdG9yKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWydtZXRhLmV4aWYuMiddIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBQeWRpb1dvcmtzcGFjZXMuSW5mb1BhbmVsQ2FyZCxcbiAgICAgICAgICAgICAgICB7IGlkZW50aWZpZXI6IFwibWV0YS1leGlmXCIsIHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlLCB0aXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnbWV0YS5leGlmLjMnXSwgYWN0aW9uczogYWN0aW9ucywgaWNvbjogJ2NhbWVyYScsIGljb25Db2xvcjogJyM2MDdkOGInIH0sXG4gICAgICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUGFuZWw7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiJdfQ==
