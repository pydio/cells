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
