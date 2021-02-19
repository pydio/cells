(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReactMeta = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var MetaClient = (function () {
    function MetaClient() {
        _classCallCheck(this, MetaClient);

        this.client = _pydioHttpApi2['default'].getRestClient();
    }

    /**
     * Save metas to server
     * @param nodes [{Node}]
     * @param values {Object}
     */

    _createClass(MetaClient, [{
        key: 'saveMeta',
        value: function saveMeta(nodes, values) {
            var _this = this;

            var api = new _cellsSdk.UserMetaServiceApi(this.client);
            return new Promise(function (resolve, reject) {
                _this.loadConfigs().then(function (configs) {
                    var proms = [];
                    nodes.map(function (node) {
                        var request = new _cellsSdk.IdmUpdateUserMetaRequest();
                        request.MetaDatas = [];
                        request.Operation = 'PUT';
                        configs.forEach(function (cData, cName) {
                            if (!values.has(cName)) {
                                return;
                            }
                            var meta = new _cellsSdk.IdmUserMeta();
                            meta.NodeUuid = node.getMetadata().get("uuid");
                            meta.Namespace = cName;
                            meta.JsonValue = JSON.stringify(values.get(cName));
                            meta.Policies = [_cellsSdk.ServiceResourcePolicy.constructFromObject({
                                Action: 'READ',
                                Subject: '*',
                                Effect: 'allow'
                            }), _cellsSdk.ServiceResourcePolicy.constructFromObject({
                                Action: 'WRITE',
                                Subject: '*',
                                Effect: 'allow'
                            })];
                            request.MetaDatas.push(meta);
                            node.getMetadata().set(cName, values.get(cName));
                        });
                        proms.push(api.updateUserMeta(request).then(function (resp) {
                            node.notify('node_replaced');
                        }));
                    });
                    Promise.all(proms).then(function () {
                        resolve();
                    })['catch'](function (e) {
                        reject(e);
                    });
                });
            });
        }
    }, {
        key: 'clearConfigs',
        value: function clearConfigs() {
            this.configs = null;
        }

        /**
         * @return {Promise<Map>}
         */
    }, {
        key: 'loadConfigs',
        value: function loadConfigs() {
            var _this2 = this;

            if (this.configs) {
                return Promise.resolve(this.configs);
            }

            if (this.promise) {
                return this.promise;
            }

            this.promise = new Promise(function (resolve) {
                var defs = {};
                var configMap = new Map();
                var api = new _cellsSdk.UserMetaServiceApi(_this2.client);
                api.listUserMetaNamespace().then(function (result) {
                    result.Namespaces.map(function (ns) {
                        var name = ns.Namespace;
                        var base = {
                            label: ns.Label,
                            indexable: ns.Indexable,
                            order: ns.Order,
                            visible: true
                        };
                        if (ns.JsonDefinition) {
                            (function () {
                                var jDef = JSON.parse(ns.JsonDefinition);
                                Object.keys(jDef).map(function (k) {
                                    base[k] = jDef[k];
                                });
                            })();
                        }
                        if (ns.Policies) {
                            ns.Policies.map(function (p) {
                                if (p.Action === 'READ') {
                                    base['readSubject'] = p.Subject;
                                } else if (p.Action === 'WRITE') {
                                    base['writeSubject'] = p.Subject;
                                }
                            });
                        }
                        defs[name] = base;
                    });
                    var arrConfigs = Object.entries(defs).map(function (entry) {
                        entry[1].ns = entry[0];
                        return entry[1];
                    });
                    arrConfigs.sort(function (a, b) {
                        var orderA = a.order || 0;
                        var orderB = b.order || 0;
                        return orderA > orderB ? 1 : orderA === orderB ? 0 : -1;
                    });
                    arrConfigs.map(function (value) {
                        var type = value.type;
                        if (type === 'json') {
                            return;
                        }
                        if (type === 'choice' && value.data) {
                            (function () {
                                var values = new Map();
                                value.data.split(",").map(function (keyLabel) {
                                    var parts = keyLabel.split("|");
                                    values.set(parts[0], parts[1]);
                                });
                                value.data = values;
                            })();
                        }
                        configMap.set(value.ns, value);
                    });
                    _this2.configs = configMap;
                    resolve(configMap);
                    _this2.promise = null;
                })['catch'](function () {
                    resolve(new Map());
                    _this2.promise = null;
                });
            });

            return this.promise;
        }

        /**
         * @param namespace String
         * @return {Promise<Array>}
         */
    }, {
        key: 'listTags',
        value: function listTags(namespace) {
            var _this3 = this;

            return new Promise(function (resolve) {

                var api = new _cellsSdk.UserMetaServiceApi(_this3.client);
                api.listUserMetaTags(namespace).then(function (response) {
                    if (response.Tags) {
                        resolve(response.Tags);
                    } else {
                        resolve([]);
                    }
                })['catch'](function (e) {
                    resolve([]);
                });
            });
        }

        /**
         *
         * @param namespace string
         * @param newTag string
         * @return {Promise}
         */
    }, {
        key: 'createTag',
        value: function createTag(namespace, newTag) {

            var api = new _cellsSdk.UserMetaServiceApi(this.client);
            return api.putUserMetaTag(namespace, _cellsSdk.RestPutUserMetaTagRequest.constructFromObject({
                Namespace: namespace,
                Tag: newTag
            }));
        }
    }]);

    return MetaClient;
})();

exports['default'] = MetaClient;
module.exports = exports['default'];

},{"cells-sdk":"cells-sdk","pydio/http/api":"pydio/http/api"}],2:[function(require,module,exports){
/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _MetaClient = require('./MetaClient');

var _MetaClient2 = _interopRequireDefault(_MetaClient);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;
var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernStyles = _Pydio$requireLib.ModernStyles;

var colorsCache = {};

function colorsFromString(s) {
    if (s.length === 0) {
        return {};
    }
    if (colorsCache[s]) {
        return colorsCache[s];
    }
    var hash = 0,
        i = undefined,
        chr = undefined,
        len = undefined;
    for (i = 0, len = s.length; i < len; i++) {
        chr = s.charCodeAt(i) * 1000;
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    var c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    var hex = "00000".substring(0, 6 - c.length) + c;
    var color = new _color2['default']('#' + hex).hsl();
    var hue = color.hue();
    var bg = new _color2['default']({ h: hue, s: color.saturationl(), l: 90 });
    var fg = new _color2['default']({ h: hue, s: color.saturationl(), l: 40 });
    var result = { color: fg.string(), backgroundColor: bg.string() };
    colorsCache[s] = result;
    return result;
}

var Renderer = (function () {
    function Renderer() {
        _classCallCheck(this, Renderer);
    }

    _createClass(Renderer, null, [{
        key: 'getMetadataConfigs',
        value: function getMetadataConfigs() {
            return Renderer.getClient().loadConfigs();
        }

        /**
         *
         * @return {MetaClient}
         */
    }, {
        key: 'getClient',
        value: function getClient() {
            if (!Renderer.Client) {
                Renderer.Client = new _MetaClient2['default']();
            }
            return Renderer.Client;
        }
    }, {
        key: 'renderStars',
        value: function renderStars(node, column) {
            if (!node.getMetadata().get(column.name)) {
                return null;
            }
            return _react2['default'].createElement(MetaStarsRenderer, { node: node, column: column, size: 'small' });
        }
    }, {
        key: 'renderSelector',
        value: function renderSelector(node, column) {
            if (!node.getMetadata().get(column.name)) {
                return null;
            }
            return _react2['default'].createElement(SelectorFilter, { node: node, column: column });
        }
    }, {
        key: 'renderCSSLabel',
        value: function renderCSSLabel(node, column) {
            if (!node.getMetadata().get(column.name)) {
                return null;
            }
            return _react2['default'].createElement(CSSLabelsFilter, { node: node, column: column });
        }
    }, {
        key: 'renderTagsCloud',
        value: function renderTagsCloud(node, column) {
            if (!node.getMetadata().get(column.name)) {
                return null;
            }
            var tagStyle = {
                display: 'inline-block',
                backgroundColor: '#E1BEE7',
                borderRadius: '3px 10px 10px 3px',
                height: 16,
                lineHeight: '17px',
                padding: '0 10px 0 5px',
                color: '#9C27B0',
                fontWeight: 500,
                fontSize: 12,
                marginRight: 6
            };
            var value = node.getMetadata().get(column.name);
            if (!value || !value.split) return null;
            return _react2['default'].createElement(
                'span',
                null,
                value.split(',').map(function (tag) {
                    return _react2['default'].createElement(
                        'span',
                        { style: _extends({}, tagStyle, colorsFromString(tag)) },
                        tag
                    );
                })
            );
        }
    }, {
        key: 'formPanelStars',
        value: function formPanelStars(props) {
            return _react2['default'].createElement(StarsFormPanel, props);
        }
    }, {
        key: 'formPanelCssLabels',
        value: function formPanelCssLabels(props) {

            var menuItems = Object.keys(CSSLabelsFilter.CSS_LABELS).map((function (id) {
                var label = CSSLabelsFilter.CSS_LABELS[id];
                return _react2['default'].createElement(_materialUi.MenuItem, { value: id, primaryText: label.label });
            }).bind(this));

            return _react2['default'].createElement(MetaSelectorFormPanel, _extends({}, props, { menuItems: menuItems }));
        }
    }, {
        key: 'formPanelSelectorFilter',
        value: function formPanelSelectorFilter(props) {

            var itemsLoader = function itemsLoader(callback) {
                Renderer.getMetadataConfigs().then(function (metaConfigs) {
                    var configs = metaConfigs.get(props.fieldname);
                    var menuItems = [];
                    if (configs && configs.data) {
                        configs.data.forEach(function (value, key) {
                            menuItems.push(_react2['default'].createElement(_materialUi.MenuItem, { value: key, primaryText: value }));
                        });
                    }
                    callback(menuItems);
                });
            };

            return _react2['default'].createElement(MetaSelectorFormPanel, _extends({}, props, { menuItems: [], itemsLoader: itemsLoader }));
        }
    }, {
        key: 'formPanelTags',
        value: function formPanelTags(props) {
            return _react2['default'].createElement(TagsCloud, _extends({}, props, { editMode: true }));
        }
    }]);

    return Renderer;
})();

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'editMeta',
        value: function editMeta() {
            pydio.UI.openComponentInModal('ReactMeta', 'UserMetaDialog', {
                dialogTitleId: 489,
                selection: pydio.getUserSelection()
            });
        }
    }]);

    return Callbacks;
})();

var MetaFieldFormPanelMixin = {

    propTypes: {
        label: _propTypes2['default'].string,
        fieldname: _propTypes2['default'].string,
        onChange: _propTypes2['default'].func,
        onValueChange: _propTypes2['default'].func
    },

    getInitialState: function getInitialState() {
        return { configs: new Map() };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        Renderer.getMetadataConfigs().then(function (c) {
            _this.setState({ configs: c });
        });
    },

    updateValue: function updateValue(value) {
        var submit = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        this.setState({ value: value });
        if (this.props.onChange) {
            var object = {};
            object['ajxp_meta_' + this.props.fieldname] = value;
            this.props.onChange(object, submit);
        } else if (this.props.onValueChange) {
            this.props.onValueChange(this.props.fieldname, value, submit);
        }
    }

};

var MetaFieldRendererMixin = {

    propTypes: {
        node: _propTypes2['default'].instanceOf(AjxpNode),
        column: _propTypes2['default'].object
    },

    getInitialState: function getInitialState() {
        return {
            value: this.props.value || 0,
            configs: new Map()
        };
    },

    componentDidMount: function componentDidMount() {
        var _this2 = this;

        Renderer.getMetadataConfigs().then(function (configs) {
            _this2.setState({ configs: configs });
        });
    },

    getRealValue: function getRealValue() {
        return this.props.node.getMetadata().get(this.props.column.name);
    }

};

var starsStyle = { fontSize: 20, color: '#FBC02D', marginTop: 6, marginBottom: 6 };

var StarsFormPanel = (0, _createReactClass2['default'])({
    displayName: 'StarsFormPanel',
    mixins: [MetaFieldFormPanelMixin],

    getInitialState: function getInitialState() {
        return { value: this.props.value || 0 };
    },

    render: function render() {
        var value = this.state.value;
        var stars = [-1, 0, 1, 2, 3, 4].map((function (v) {
            var _this3 = this;

            var ic = 'star' + (v === -1 ? '-off' : value > v ? '' : '-outline');
            var style = v === -1 ? { marginRight: 5, cursor: 'pointer' } : { cursor: 'pointer' };
            return _react2['default'].createElement('span', { key: "star-" + v, onClick: function () {
                    return _this3.updateValue(v + 1, true);
                }, className: "mdi mdi-" + ic, style: style });
        }).bind(this));
        return _react2['default'].createElement(
            'div',
            { className: 'advanced-search-stars', style: _extends({}, ModernStyles.div, starsStyle) },
            _react2['default'].createElement(
                'div',
                null,
                stars
            )
        );
    }
});

var MetaStarsRenderer = (0, _createReactClass2['default'])({
    displayName: 'MetaStarsRenderer',
    mixins: [MetaFieldRendererMixin],

    render: function render() {
        var value = this.getRealValue() || 0;
        var stars = [0, 1, 2, 3, 4].map(function (v) {
            return _react2['default'].createElement('span', { key: "star-" + v, className: "mdi mdi-star" + (value > v ? '' : '-outline') });
        });
        var style = this.props.size === 'small' ? { color: starsStyle.color } : starsStyle;
        return _react2['default'].createElement(
            'span',
            { style: style },
            stars
        );
    }
});

var SelectorFilter = (0, _createReactClass2['default'])({
    displayName: 'SelectorFilter',
    mixins: [MetaFieldRendererMixin],

    render: function render() {
        var configs = this.state.configs;

        var value = undefined;
        var displayValue = value = this.getRealValue();
        var fieldConfig = configs.get(this.props.column.name);
        if (fieldConfig && fieldConfig.data) {
            displayValue = fieldConfig.data.get(value);
        }
        return _react2['default'].createElement(
            'span',
            null,
            displayValue
        );
    }
});

var CSSLabelsFilter = (0, _createReactClass2['default'])({
    displayName: 'CSSLabelsFilter',
    mixins: [MetaFieldRendererMixin],

    statics: {
        CSS_LABELS: {
            'low': { label: MessageHash['meta.user.4'], sortValue: '5', color: '#66c' },
            'todo': { label: MessageHash['meta.user.5'], sortValue: '4', color: '#69c' },
            'personal': { label: MessageHash['meta.user.6'], sortValue: '3', color: '#6c6' },
            'work': { label: MessageHash['meta.user.7'], sortValue: '2', color: '#c96' },
            'important': { label: MessageHash['meta.user.8'], sortValue: '1', color: '#c66' }
        }
    },

    render: function render() {
        var value = this.getRealValue();
        var data = CSSLabelsFilter.CSS_LABELS;
        if (value && data[value]) {
            var dV = data[value];
            return _react2['default'].createElement(
                'span',
                null,
                _react2['default'].createElement('span', { className: 'mdi mdi-label', style: { color: dV.color } }),
                ' ',
                dV.label
            );
        } else {
            return _react2['default'].createElement(
                'span',
                null,
                value
            );
        }
    }
});

var MetaSelectorFormPanel = (0, _createReactClass2['default'])({
    displayName: 'MetaSelectorFormPanel',
    mixins: [MetaFieldFormPanelMixin],

    changeSelector: function changeSelector(e, selectedIndex, payload) {
        this.updateValue(payload, true);
    },

    componentDidMount: function componentDidMount() {
        var _this4 = this;

        if (this.props.itemsLoader) {
            this.props.itemsLoader(function (items) {
                _this4.setState({ menuItems: items });
            });
        }
    },

    getInitialState: function getInitialState() {
        return { value: this.props.value };
    },

    render: function render() {
        var index = 0,
            i = 1;
        var menuItems = undefined;
        if (this.state.menuItems === undefined) {
            menuItems = [].concat(_toConsumableArray(this.props.menuItems));
        } else {
            menuItems = [].concat(_toConsumableArray(this.state.menuItems));
        }
        menuItems.unshift(_react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: '' }));
        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                ModernSelectField,
                {
                    style: { width: '100%' },
                    value: this.state.value,
                    hintText: this.props.label,
                    onChange: this.changeSelector },
                menuItems
            )
        );
    }
});

var TagsCloud = (0, _createReactClass2['default'])({
    displayName: 'TagsCloud',
    mixins: [MetaFieldFormPanelMixin],

    propTypes: {
        node: _propTypes2['default'].instanceOf(AjxpNode),
        column: _propTypes2['default'].object
    },

    componentDidMount: function componentDidMount() {
        this.getRealValue();
        if (this.props.editMode) {
            this.load();
        }
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var node = nextProps.node;
        var value = nextProps.value;
        var column = nextProps.column;

        if (node && node !== this.props.node) {
            this.setState({ tags: node.getMetadata().get(column.name) });
        } else if (value) {
            this.setState({ tags: value });
        }
        if (nextProps.editMode && !this.state.loaded) {
            this.load();
        }
    },

    getRealValue: function getRealValue() {
        var _props = this.props;
        var node = _props.node;
        var value = _props.value;
        var column = _props.column;

        if (node == null) {
            this.setState({ tags: value });
        } else {
            this.setState({ tags: node.getMetadata().get(column.name) });
        }
    },

    getInitialState: function getInitialState() {
        var _props2 = this.props;
        var node = _props2.node;
        var value = _props2.value;

        return {
            loading: false,
            dataSource: [],
            tags: node ? node.getMetadata().get(this.props.column.name) : value,
            searchText: ''
        };
    },

    suggestionLoader: function suggestionLoader(callback) {
        var _this5 = this;

        this.setState({ loading: this.state.loading + 1 });

        Renderer.getClient().listTags(this.props.fieldname || this.props.column.name).then(function (tags) {
            _this5.setState({ loading: _this5.state.loading - 1 });
            callback(tags);
        });
    },

    load: function load() {
        this.setState({ loading: true });
        this.suggestionLoader((function (tags) {
            var crtValueFound = false;
            var values = tags.map((function (tag) {
                var component = _react2['default'].createElement(
                    _materialUi.MenuItem,
                    null,
                    tag
                );
                return {
                    text: tag,
                    value: component
                };
            }).bind(this));
            this.setState({ dataSource: values, loading: false, loaded: true });
        }).bind(this));
    },

    handleRequestDelete: function handleRequestDelete(tag) {
        var _this6 = this;

        var tags = this.state.tags.split(',');
        var index = tags.indexOf(tag);
        tags.splice(index, 1);
        this.setState({
            tags: tags.toString() }, function () {
            _this6.updateValue(_this6.state.tags, true);
        });
    },

    handleUpdateInput: function handleUpdateInput(searchText) {
        this.setState({ searchText: searchText });
    },

    handleNewRequest: function handleNewRequest() {
        var _this7 = this;

        if (!this.state.searchText) {
            return;
        }
        var tags = [];
        if (this.state.tags && this.state.tags.split) {
            tags = this.state.tags.split(',');
        }
        tags.push(this.state.searchText);
        this.setState({
            tags: tags.toString() }, function () {
            _this7.updateValue(_this7.state.tags, true);
        });
        this.setState({
            searchText: ''
        });
    },

    renderChip: function renderChip(tag) {
        var _colorsFromString = colorsFromString(tag);

        var color = _colorsFromString.color;
        var backgroundColor = _colorsFromString.backgroundColor;

        var chipStyle = { margin: 2, borderRadius: '4px 16px 16px 4px' };
        var labelStyle = { color: color, fontWeight: 500, paddingLeft: 10, paddingRight: 16 };
        if (this.props.editMode) {
            return _react2['default'].createElement(
                _materialUi.Chip,
                { key: tag, backgroundColor: backgroundColor, labelStyle: labelStyle, style: chipStyle, onRequestDelete: this.handleRequestDelete.bind(this, tag) },
                tag
            );
        } else {
            return _react2['default'].createElement(
                _materialUi.Chip,
                { key: tag, backgroundColor: backgroundColor, labelStyle: labelStyle, style: chipStyle },
                tag
            );
        }
    },

    render: function render() {
        var _this8 = this;

        var tags = undefined;
        if (this.state.tags && this.state.tags.split) {
            tags = this.state.tags.split(",").map((function (tag) {
                tag = LangUtils.trim(tag, ' ');
                if (!tag) return null;
                return this.renderChip(tag);
            }).bind(this));
        } else {
            tags = _react2['default'].createElement('div', null);
        }
        var autoCompleter = undefined;
        if (this.props.editMode) {
            autoCompleter = _react2['default'].createElement(_materialUi.AutoComplete, _extends({
                fullWidth: true,
                hintText: pydio.MessageHash['meta.user.10'],
                searchText: this.state.searchText,
                onUpdateInput: this.handleUpdateInput,
                onNewRequest: this.handleNewRequest,
                dataSource: this.state.dataSource,
                filter: function (searchText, key) {
                    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                },
                openOnFocus: true,
                menuProps: { maxHeight: 200 },
                style: { marginBottom: -8 },
                onClose: function () {
                    if (_this8.state.searchText) {
                        _this8.handleNewRequest();
                    }
                }
            }, ModernStyles.textField));
        } else {
            autoCompleter = _react2['default'].createElement('div', null);
        }

        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                'div',
                { style: { display: 'flex', flexWrap: 'wrap' } },
                tags
            ),
            autoCompleter
        );
    }
});

var UserMetaDialog = (0, _createReactClass2['default'])({
    displayName: 'UserMetaDialog',

    propsTypes: {
        selection: _propTypes2['default'].instanceOf(PydioDataModel)
    },

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    saveMeta: function saveMeta() {
        var values = this.refs.panel.getUpdateData();
        var params = {};
        values.forEach(function (v, k) {
            params[k] = v;
        });
        return Renderer.getClient().saveMeta(this.props.selection.getSelectedNodes(), values);
    },

    submit: function submit() {
        var _this9 = this;

        this.saveMeta().then(function () {
            _this9.dismiss();
        });
    },

    render: function render() {
        return _react2['default'].createElement(UserMetaPanel, {
            pydio: this.props.pydio,
            multiple: !this.props.selection.isUnique(),
            ref: 'panel',
            node: this.props.selection.isUnique() ? this.props.selection.getUniqueNode() : new AjxpNode(),
            editMode: true
        });
    }
});

var UserMetaPanel = (function (_React$Component) {
    _inherits(UserMetaPanel, _React$Component);

    function UserMetaPanel(props) {
        _classCallCheck(this, UserMetaPanel);

        if (props.editMode === undefined) {
            props.editMode = false;
        }
        _get(Object.getPrototypeOf(UserMetaPanel.prototype), 'constructor', this).call(this, props);
        this.state = {
            updateMeta: new Map(),
            isChecked: false,
            fields: [],
            configs: new Map()
        };
    }

    _createClass(UserMetaPanel, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this10 = this;

            Renderer.getMetadataConfigs().then(function (configs) {
                _this10.setState({ configs: configs });
            });
        }
    }, {
        key: 'updateValue',
        value: function updateValue(name, value) {
            var submit = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            this.state.updateMeta.set(name, value);
            this.setState({
                updateMeta: this.state.updateMeta
            });
            if (this.props.onChangeUpdateData) {
                this.props.onChangeUpdateData(this.state.updateMeta);
            }
            if (submit && this.props.autoSave) {
                this.props.autoSave();
            }
        }
    }, {
        key: 'deleteValue',
        value: function deleteValue(name) {
            this.state.updateMeta['delete'](name);
            this.setState({
                updateMeta: this.state.updateMeta
            });
            if (this.props.onChangeUpdateData) {
                this.props.onChangeUpdateData(this.state.updateMeta);
            }
        }
    }, {
        key: 'getUpdateData',
        value: function getUpdateData() {
            return this.state.updateMeta;
        }
    }, {
        key: 'resetUpdateData',
        value: function resetUpdateData() {
            this.setState({
                updateMeta: new Map()
            });
            if (this.props.onChangeUpdateData) {
                this.props.onChangeUpdateData(new Map());
            }
        }
    }, {
        key: 'onCheck',
        value: function onCheck(e, isInputChecked, value) {
            var state = this.state;
            state['fields'][e.target.value] = isInputChecked;
            if (isInputChecked === false) {
                this.deleteValue(e.target.value);
            }
            this.setState(state);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this11 = this;

            var configs = this.state.configs;

            var data = [];
            var node = this.props.node;
            var metadata = this.props.node.getMetadata();
            var updateMeta = this.state.updateMeta;
            var nonEmptyDataCount = 0;
            var isAdmin = pydio.user.isAdmin;

            configs.forEach(function (meta, key) {
                var readonly = false,
                    value = undefined;
                var label = meta.label;
                var type = meta.type;
                var writeSubject = meta.writeSubject;
                var readSubject = meta.readSubject;

                if (readSubject === 'profile:admin' && !isAdmin) {
                    return;
                }
                if (writeSubject === 'profile:admin' && !isAdmin) {
                    readonly = true;
                }
                value = metadata.get(key);
                if (updateMeta.has(key)) {
                    value = updateMeta.get(key);
                }
                var realValue = value;

                if (_this11.props.editMode && !readonly) {
                    var field = undefined;
                    var baseProps = {
                        isChecked: _this11.state.isChecked,
                        fieldname: key,
                        label: label,
                        value: value,
                        onValueChange: function onValueChange(name, value, submit) {
                            return _this11.updateValue(name, value, submit);
                        }
                    };
                    if (type === 'stars_rate') {
                        field = _react2['default'].createElement(StarsFormPanel, baseProps);
                    } else if (type === 'choice') {
                        field = Renderer.formPanelSelectorFilter(baseProps, configs);
                    } else if (type === 'css_label') {
                        field = Renderer.formPanelCssLabels(baseProps, configs);
                    } else if (type === 'tags') {
                        field = Renderer.formPanelTags(baseProps, configs);
                    } else {
                        field = _react2['default'].createElement(ModernTextField, {
                            value: value,
                            fullWidth: true,
                            disabled: readonly,
                            hintText: label,
                            multiLine: type === 'textarea',
                            onChange: function (event, value) {
                                _this11.updateValue(key, value);
                            }
                        });
                    }
                    if (_this11.props.multiple) {
                        data.push(_react2['default'].createElement(
                            'div',
                            { className: "infoPanelRow", key: key, style: { marginBottom: 20 } },
                            _react2['default'].createElement(_materialUi.Checkbox, { value: key, label: label, onCheck: _this11.onCheck.bind(_this11) }),
                            _this11.state['fields'][key] && _react2['default'].createElement(
                                'div',
                                { className: 'infoPanelValue' },
                                field
                            )
                        ));
                    } else {
                        data.push(_react2['default'].createElement(
                            'div',
                            { className: "infoPanelRow", key: key },
                            _react2['default'].createElement(
                                'div',
                                { className: 'infoPanelLabel' },
                                label
                            ),
                            _react2['default'].createElement(
                                'div',
                                { className: 'infoPanelValue' },
                                field
                            )
                        ));
                    }
                } else {
                    var column = { name: key };
                    if (type === 'stars_rate') {
                        value = _react2['default'].createElement(MetaStarsRenderer, { node: node, column: column });
                    } else if (type === 'css_label') {
                        value = _react2['default'].createElement(CSSLabelsFilter, { node: node, column: column });
                    } else if (type === 'choice') {
                        value = _react2['default'].createElement(SelectorFilter, { node: node, column: column });
                    } else if (type === 'tags') {
                        value = _react2['default'].createElement(TagsCloud, { node: node, column: column });
                    }
                    if (realValue) {
                        nonEmptyDataCount++;
                    }
                    data.push(_react2['default'].createElement(
                        'div',
                        { className: "infoPanelRow" + (!realValue ? ' no-value' : ''), key: key },
                        _react2['default'].createElement(
                            'div',
                            { className: 'infoPanelLabel' },
                            label
                        ),
                        _react2['default'].createElement(
                            'div',
                            { className: 'infoPanelValue' },
                            value
                        )
                    ));
                }
            });
            var mess = this.props.pydio.MessageHash;
            if (!this.props.editMode && !nonEmptyDataCount) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { color: 'rgba(0,0,0,0.23)', paddingBottom: 10 }, onTouchTap: this.props.onRequestEditMode },
                        mess['meta.user.11']
                    ),
                    data
                );
            } else {
                var legend = undefined;
                if (this.props.multiple) {
                    legend = _react2['default'].createElement(
                        'div',
                        { style: { paddingBottom: 16 } },
                        _react2['default'].createElement(
                            'em',
                            null,
                            mess['meta.user.12']
                        ),
                        ' ',
                        mess['meta.user.13']
                    );
                }
                return _react2['default'].createElement(
                    'div',
                    { style: { width: '100%', overflowY: 'scroll' } },
                    legend,
                    data
                );
            }
        }
    }]);

    return UserMetaPanel;
})(_react2['default'].Component);

var InfoPanel = (function (_React$Component2) {
    _inherits(InfoPanel, _React$Component2);

    function InfoPanel(props) {
        var _this12 = this;

        _classCallCheck(this, InfoPanel);

        _get(Object.getPrototypeOf(InfoPanel.prototype), 'constructor', this).call(this, props);
        this.state = { editMode: false };
        this._nodeObserver = function () {
            if (_this12.refs.panel) {
                _this12.refs.panel.resetUpdateData();
            }
            _this12.forceUpdate();
            //this.setState({editMode: false}, ()=>{this.forceUpdate()});
        };
        if (props.node) {
            props.node.observe('node_replaced', this._nodeObserver);
        }
    }

    _createClass(InfoPanel, [{
        key: 'openEditMode',
        value: function openEditMode() {
            this.setState({ editMode: true });
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.refs.panel.resetUpdateData();
            this.setState({ editMode: false });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (this.props.node) {
                this.props.node.stopObserving('node_replaced', this._nodeObserver);
            }
            if (newProps.node !== this.props.node && this.refs.panel) {
                this.reset();
                newProps.node.observe('node_replaced', this._nodeObserver);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.node) {
                this.props.node.stopObserving('node_replaced', this._nodeObserver);
            }
        }
    }, {
        key: 'saveMeta',
        value: function saveMeta() {
            var values = this.refs.panel.getUpdateData();
            return Renderer.getClient().saveMeta(this.props.pydio.getContextHolder().getSelectedNodes(), values);
        }
    }, {
        key: 'saveAndClose',
        value: function saveAndClose() {
            var _this13 = this;

            this.saveMeta().then(function () {
                _this13.reset();
            });
        }
    }, {
        key: 'onChangeUpdateData',
        value: function onChangeUpdateData(updateData) {
            this.setState({ updateData: updateData });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this14 = this;

            var actions = [];
            var MessageHash = this.props.pydio.MessageHash;

            var values = this.state.updateData || new Map();

            if (this.state.editMode) {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'cancel',
                    label: values.size ? MessageHash['54'] : MessageHash['86'],
                    onClick: function () {
                        _this14.reset();
                    }
                }));
                if (!this.props.node.getMetadata().has('node_readonly') && values.size > 0) {
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                        key: 'edit',
                        label: this.state.editMode ? MessageHash['meta.user.15'] : MessageHash['meta.user.14'],
                        onClick: function () {
                            _this14.saveAndClose();
                        }
                    }));
                }
            } else {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'edit',
                    label: this.state.editMode ? MessageHash['meta.user.15'] : MessageHash['meta.user.14'],
                    onClick: function () {
                        _this14.openEditMode();
                    }
                }));
            }

            return _react2['default'].createElement(
                PydioWorkspaces.InfoPanelCard,
                {
                    identifier: "meta-user",
                    style: this.props.style,
                    title: this.props.pydio.MessageHash['meta.user.1'],
                    actions: actions.length ? actions : null,
                    icon: 'tag-multiple', iconColor: '#00ACC1'
                },
                _react2['default'].createElement(UserMetaPanel, {
                    ref: 'panel',
                    node: this.props.node,
                    editMode: this.state.editMode,
                    onRequestEditMode: this.openEditMode.bind(this),
                    pydio: this.props.pydio,
                    onChangeUpdateData: function (d) {
                        _this14.onChangeUpdateData(d);
                    },
                    autoSave: function () {
                        _this14.saveMeta().then(function () {
                            _this14.refs.panel.resetUpdateData();
                        });
                    }
                })
            );
        }
    }]);

    return InfoPanel;
})(_react2['default'].Component);

exports.Renderer = Renderer;
exports.InfoPanel = InfoPanel;
exports.Callbacks = Callbacks;
exports.UserMetaDialog = UserMetaDialog;
exports.UserMetaPanel = UserMetaPanel;

},{"./MetaClient":1,"color":"color","create-react-class":"create-react-class","material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _components = require('./components');

exports.Renderer = _components.Renderer;
exports.InfoPanel = _components.InfoPanel;
exports.Callbacks = _components.Callbacks;
exports.UserMetaDialog = _components.UserMetaDialog;
exports.UserMetaPanel = _components.UserMetaPanel;

},{"./components":2}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9NZXRhQ2xpZW50LmpzIiwianMvYnVpbGQvY29tcG9uZW50cy5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBNZXRhQ2xpZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNZXRhQ2xpZW50KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWV0YUNsaWVudCk7XG5cbiAgICAgICAgdGhpcy5jbGllbnQgPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIG1ldGFzIHRvIHNlcnZlclxuICAgICAqIEBwYXJhbSBub2RlcyBbe05vZGV9XVxuICAgICAqIEBwYXJhbSB2YWx1ZXMge09iamVjdH1cbiAgICAgKi9cblxuICAgIF9jcmVhdGVDbGFzcyhNZXRhQ2xpZW50LCBbe1xuICAgICAgICBrZXk6ICdzYXZlTWV0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlTWV0YShub2RlcywgdmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5Vc2VyTWV0YVNlcnZpY2VBcGkodGhpcy5jbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5sb2FkQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21zID0gW107XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX2NlbGxzU2RrLklkbVVwZGF0ZVVzZXJNZXRhUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5NZXRhRGF0YXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuT3BlcmF0aW9uID0gJ1BVVCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNEYXRhLCBjTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWVzLmhhcyhjTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWV0YSA9IG5ldyBfY2VsbHNTZGsuSWRtVXNlck1ldGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLk5vZGVVdWlkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldChcInV1aWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5OYW1lc3BhY2UgPSBjTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLkpzb25WYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlcy5nZXQoY05hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLlBvbGljaWVzID0gW19jZWxsc1Nkay5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbjogJ1JFQUQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdWJqZWN0OiAnKicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ2FsbG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBfY2VsbHNTZGsuU2VydmljZVJlc291cmNlUG9saWN5LmNvbnN0cnVjdEZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY3Rpb246ICdXUklURScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN1YmplY3Q6ICcqJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRWZmZWN0OiAnYWxsb3cnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuTWV0YURhdGFzLnB1c2gobWV0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldChjTmFtZSwgdmFsdWVzLmdldChjTmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKGFwaS51cGRhdGVVc2VyTWV0YShyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5ub3RpZnkoJ25vZGVfcmVwbGFjZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21zKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2xlYXJDb25maWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyQ29uZmlncygpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlncyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZTxNYXA+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWRDb25maWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRDb25maWdzKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuY29uZmlncyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgIHZhciBkZWZzID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGNvbmZpZ01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5Vc2VyTWV0YVNlcnZpY2VBcGkoX3RoaXMyLmNsaWVudCk7XG4gICAgICAgICAgICAgICAgYXBpLmxpc3RVc2VyTWV0YU5hbWVzcGFjZSgpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuTmFtZXNwYWNlcy5tYXAoZnVuY3Rpb24gKG5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG5zLk5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiYXNlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBucy5MYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleGFibGU6IG5zLkluZGV4YWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogbnMuT3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChucy5Kc29uRGVmaW5pdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBqRGVmID0gSlNPTi5wYXJzZShucy5Kc29uRGVmaW5pdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpEZWYpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVtrXSA9IGpEZWZba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnMuUG9saWNpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBucy5Qb2xpY2llcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHAuQWN0aW9uID09PSAnUkVBRCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VbJ3JlYWRTdWJqZWN0J10gPSBwLlN1YmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocC5BY3Rpb24gPT09ICdXUklURScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VbJ3dyaXRlU3ViamVjdCddID0gcC5TdWJqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZzW25hbWVdID0gYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnJDb25maWdzID0gT2JqZWN0LmVudHJpZXMoZGVmcykubWFwKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlbMV0ubnMgPSBlbnRyeVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRyeVsxXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFyckNvbmZpZ3Muc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yZGVyQSA9IGEub3JkZXIgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmRlckIgPSBiLm9yZGVyIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3JkZXJBID4gb3JkZXJCID8gMSA6IG9yZGVyQSA9PT0gb3JkZXJCID8gMCA6IC0xO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYXJyQ29uZmlncy5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHZhbHVlLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjaG9pY2UnICYmIHZhbHVlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhLnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24gKGtleUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBrZXlMYWJlbC5zcGxpdChcInxcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc2V0KHBhcnRzWzBdLCBwYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhID0gdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdNYXAuc2V0KHZhbHVlLm5zLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuY29uZmlncyA9IGNvbmZpZ01hcDtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb25maWdNYXApO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBNYXAoKSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lc3BhY2UgU3RyaW5nXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2U8QXJyYXk+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xpc3RUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxpc3RUYWdzKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuVXNlck1ldGFTZXJ2aWNlQXBpKF90aGlzMy5jbGllbnQpO1xuICAgICAgICAgICAgICAgIGFwaS5saXN0VXNlck1ldGFUYWdzKG5hbWVzcGFjZSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLlRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UuVGFncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5hbWVzcGFjZSBzdHJpbmdcbiAgICAgICAgICogQHBhcmFtIG5ld1RhZyBzdHJpbmdcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjcmVhdGVUYWcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlVGFnKG5hbWVzcGFjZSwgbmV3VGFnKSB7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLlVzZXJNZXRhU2VydmljZUFwaSh0aGlzLmNsaWVudCk7XG4gICAgICAgICAgICByZXR1cm4gYXBpLnB1dFVzZXJNZXRhVGFnKG5hbWVzcGFjZSwgX2NlbGxzU2RrLlJlc3RQdXRVc2VyTWV0YVRhZ1JlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgTmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgVGFnOiBuZXdUYWdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNZXRhQ2xpZW50O1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTWV0YUNsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMjEgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MywgX3g0LCBfeDUpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gzLCBwcm9wZXJ0eSA9IF94NCwgcmVjZWl2ZXIgPSBfeDU7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gzID0gcGFyZW50OyBfeDQgPSBwcm9wZXJ0eTsgX3g1ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX01ldGFDbGllbnQgPSByZXF1aXJlKCcuL01ldGFDbGllbnQnKTtcblxudmFyIF9NZXRhQ2xpZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX01ldGFDbGllbnQpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xuXG52YXIgX2NyZWF0ZVJlYWN0Q2xhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlUmVhY3RDbGFzcyk7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKCdjb2xvcicpO1xuXG52YXIgX2NvbG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbG9yKTtcblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblNlbGVjdEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU2VsZWN0RmllbGQ7XG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xudmFyIE1vZGVyblN0eWxlcyA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblN0eWxlcztcblxudmFyIGNvbG9yc0NhY2hlID0ge307XG5cbmZ1bmN0aW9uIGNvbG9yc0Zyb21TdHJpbmcocykge1xuICAgIGlmIChzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGlmIChjb2xvcnNDYWNoZVtzXSkge1xuICAgICAgICByZXR1cm4gY29sb3JzQ2FjaGVbc107XG4gICAgfVxuICAgIHZhciBoYXNoID0gMCxcbiAgICAgICAgaSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY2hyID0gdW5kZWZpbmVkLFxuICAgICAgICBsZW4gPSB1bmRlZmluZWQ7XG4gICAgZm9yIChpID0gMCwgbGVuID0gcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjaHIgPSBzLmNoYXJDb2RlQXQoaSkgKiAxMDAwO1xuICAgICAgICBoYXNoID0gKGhhc2ggPDwgNSkgLSBoYXNoICsgY2hyO1xuICAgICAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICAgIH1cbiAgICB2YXIgYyA9IChoYXNoICYgMHgwMEZGRkZGRikudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gICAgdmFyIGhleCA9IFwiMDAwMDBcIi5zdWJzdHJpbmcoMCwgNiAtIGMubGVuZ3RoKSArIGM7XG4gICAgdmFyIGNvbG9yID0gbmV3IF9jb2xvcjJbJ2RlZmF1bHQnXSgnIycgKyBoZXgpLmhzbCgpO1xuICAgIHZhciBodWUgPSBjb2xvci5odWUoKTtcbiAgICB2YXIgYmcgPSBuZXcgX2NvbG9yMlsnZGVmYXVsdCddKHsgaDogaHVlLCBzOiBjb2xvci5zYXR1cmF0aW9ubCgpLCBsOiA5MCB9KTtcbiAgICB2YXIgZmcgPSBuZXcgX2NvbG9yMlsnZGVmYXVsdCddKHsgaDogaHVlLCBzOiBjb2xvci5zYXR1cmF0aW9ubCgpLCBsOiA0MCB9KTtcbiAgICB2YXIgcmVzdWx0ID0geyBjb2xvcjogZmcuc3RyaW5nKCksIGJhY2tncm91bmRDb2xvcjogYmcuc3RyaW5nKCkgfTtcbiAgICBjb2xvcnNDYWNoZVtzXSA9IHJlc3VsdDtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgUmVuZGVyZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlbmRlcmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVuZGVyZXIpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhSZW5kZXJlciwgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnZ2V0TWV0YWRhdGFDb25maWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1ldGFkYXRhQ29uZmlncygpIHtcbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJlci5nZXRDbGllbnQoKS5sb2FkQ29uZmlncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm4ge01ldGFDbGllbnR9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0Q2xpZW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENsaWVudCgpIHtcbiAgICAgICAgICAgIGlmICghUmVuZGVyZXIuQ2xpZW50KSB7XG4gICAgICAgICAgICAgICAgUmVuZGVyZXIuQ2xpZW50ID0gbmV3IF9NZXRhQ2xpZW50MlsnZGVmYXVsdCddKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVuZGVyZXIuQ2xpZW50O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJTdGFycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJTdGFycyhub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU3RhcnNSZW5kZXJlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiwgc2l6ZTogJ3NtYWxsJyB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyU2VsZWN0b3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyU2VsZWN0b3Iobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2VsZWN0b3JGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlckNTU0xhYmVsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlckNTU0xhYmVsKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KENTU0xhYmVsc0ZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyVGFnc0Nsb3VkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlclRhZ3NDbG91ZChub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0YWdTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTFCRUU3JyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICczcHggMTBweCAxMHB4IDNweCcsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMTdweCcsXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzAgMTBweCAwIDVweCcsXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjOUMyN0IwJyxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA1MDAsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiA2XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICF2YWx1ZS5zcGxpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWUuc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgdGFnU3R5bGUsIGNvbG9yc0Zyb21TdHJpbmcodGFnKSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxTdGFycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxTdGFycyhwcm9wcykge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFN0YXJzRm9ybVBhbmVsLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbENzc0xhYmVscycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxDc3NMYWJlbHMocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IE9iamVjdC5rZXlzKENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTKS5tYXAoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTW2lkXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IGlkLCBwcmltYXJ5VGV4dDogbGFiZWwubGFiZWwgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTZWxlY3RvckZvcm1QYW5lbCwgX2V4dGVuZHMoe30sIHByb3BzLCB7IG1lbnVJdGVtczogbWVudUl0ZW1zIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXIocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zTG9hZGVyID0gZnVuY3Rpb24gaXRlbXNMb2FkZXIoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChtZXRhQ29uZmlncykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZmlncyA9IG1ldGFDb25maWdzLmdldChwcm9wcy5maWVsZG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWdzICYmIGNvbmZpZ3MuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlncy5kYXRhLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobWVudUl0ZW1zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU2VsZWN0b3JGb3JtUGFuZWwsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBtZW51SXRlbXM6IFtdLCBpdGVtc0xvYWRlcjogaXRlbXNMb2FkZXIgfSkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFRhZ3MocHJvcHMpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUYWdzQ2xvdWQsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBlZGl0TW9kZTogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVuZGVyZXI7XG59KSgpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2VkaXRNZXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRNZXRhKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1JlYWN0TWV0YScsICdVc2VyTWV0YURpYWxvZycsIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dUaXRsZUlkOiA0ODksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiBweWRpby5nZXRVc2VyU2VsZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBNZXRhRmllbGRGb3JtUGFuZWxNaXhpbiA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsYWJlbDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5zdHJpbmcsXG4gICAgICAgIGZpZWxkbmFtZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5zdHJpbmcsXG4gICAgICAgIG9uQ2hhbmdlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmZ1bmMsXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuY1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgY29uZmlnczogbmV3IE1hcCgpIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGMgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZTogZnVuY3Rpb24gdXBkYXRlVmFsdWUodmFsdWUpIHtcbiAgICAgICAgdmFyIHN1Ym1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICAgICAgICAgIG9iamVjdFsnYWp4cF9tZXRhXycgKyB0aGlzLnByb3BzLmZpZWxkbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uob2JqZWN0LCBzdWJtaXQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMub25WYWx1ZUNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbHVlQ2hhbmdlKHRoaXMucHJvcHMuZmllbGRuYW1lLCB2YWx1ZSwgc3VibWl0KTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcblxudmFyIE1ldGFGaWVsZFJlbmRlcmVyTWl4aW4gPSB7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbm9kZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5pbnN0YW5jZU9mKEFqeHBOb2RlKSxcbiAgICAgICAgY29sdW1uOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLm9iamVjdFxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIHx8IDAsXG4gICAgICAgICAgICBjb25maWdzOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjb25maWdzKSB7XG4gICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBjb25maWdzOiBjb25maWdzIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0UmVhbFZhbHVlOiBmdW5jdGlvbiBnZXRSZWFsVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQodGhpcy5wcm9wcy5jb2x1bW4ubmFtZSk7XG4gICAgfVxuXG59O1xuXG52YXIgc3RhcnNTdHlsZSA9IHsgZm9udFNpemU6IDIwLCBjb2xvcjogJyNGQkMwMkQnLCBtYXJnaW5Ub3A6IDYsIG1hcmdpbkJvdHRvbTogNiB9O1xuXG52YXIgU3RhcnNGb3JtUGFuZWwgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcbiAgICBkaXNwbGF5TmFtZTogJ1N0YXJzRm9ybVBhbmVsJyxcbiAgICBtaXhpbnM6IFtNZXRhRmllbGRGb3JtUGFuZWxNaXhpbl0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfHwgMCB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgdmFyIHN0YXJzID0gWy0xLCAwLCAxLCAyLCAzLCA0XS5tYXAoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGljID0gJ3N0YXInICsgKHYgPT09IC0xID8gJy1vZmYnIDogdmFsdWUgPiB2ID8gJycgOiAnLW91dGxpbmUnKTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IHYgPT09IC0xID8geyBtYXJnaW5SaWdodDogNSwgY3Vyc29yOiAncG9pbnRlcicgfSA6IHsgY3Vyc29yOiAncG9pbnRlcicgfTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiBcInN0YXItXCIgKyB2LCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMudXBkYXRlVmFsdWUodiArIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0sIGNsYXNzTmFtZTogXCJtZGkgbWRpLVwiICsgaWMsIHN0eWxlOiBzdHlsZSB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdhZHZhbmNlZC1zZWFyY2gtc3RhcnMnLCBzdHlsZTogX2V4dGVuZHMoe30sIE1vZGVyblN0eWxlcy5kaXYsIHN0YXJzU3R5bGUpIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBNZXRhU3RhcnNSZW5kZXJlciA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVN0YXJzUmVuZGVyZXInLFxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCkgfHwgMDtcbiAgICAgICAgdmFyIHN0YXJzID0gWzAsIDEsIDIsIDMsIDRdLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBrZXk6IFwic3Rhci1cIiArIHYsIGNsYXNzTmFtZTogXCJtZGkgbWRpLXN0YXJcIiArICh2YWx1ZSA+IHYgPyAnJyA6ICctb3V0bGluZScpIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHN0eWxlID0gdGhpcy5wcm9wcy5zaXplID09PSAnc21hbGwnID8geyBjb2xvcjogc3RhcnNTdHlsZS5jb2xvciB9IDogc3RhcnNTdHlsZTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBzdHlsZTogc3R5bGUgfSxcbiAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBTZWxlY3RvckZpbHRlciA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuICAgIGRpc3BsYXlOYW1lOiAnU2VsZWN0b3JGaWx0ZXInLFxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBjb25maWdzID0gdGhpcy5zdGF0ZS5jb25maWdzO1xuXG4gICAgICAgIHZhciB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGRpc3BsYXlWYWx1ZSA9IHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKTtcbiAgICAgICAgdmFyIGZpZWxkQ29uZmlnID0gY29uZmlncy5nZXQodGhpcy5wcm9wcy5jb2x1bW4ubmFtZSk7XG4gICAgICAgIGlmIChmaWVsZENvbmZpZyAmJiBmaWVsZENvbmZpZy5kYXRhKSB7XG4gICAgICAgICAgICBkaXNwbGF5VmFsdWUgPSBmaWVsZENvbmZpZy5kYXRhLmdldCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIGRpc3BsYXlWYWx1ZVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgQ1NTTGFiZWxzRmlsdGVyID0gKDAsIF9jcmVhdGVSZWFjdENsYXNzMlsnZGVmYXVsdCddKSh7XG4gICAgZGlzcGxheU5hbWU6ICdDU1NMYWJlbHNGaWx0ZXInLFxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICBDU1NfTEFCRUxTOiB7XG4gICAgICAgICAgICAnbG93JzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci40J10sIHNvcnRWYWx1ZTogJzUnLCBjb2xvcjogJyM2NmMnIH0sXG4gICAgICAgICAgICAndG9kbyc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNSddLCBzb3J0VmFsdWU6ICc0JywgY29sb3I6ICcjNjljJyB9LFxuICAgICAgICAgICAgJ3BlcnNvbmFsJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci42J10sIHNvcnRWYWx1ZTogJzMnLCBjb2xvcjogJyM2YzYnIH0sXG4gICAgICAgICAgICAnd29yayc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNyddLCBzb3J0VmFsdWU6ICcyJywgY29sb3I6ICcjYzk2JyB9LFxuICAgICAgICAgICAgJ2ltcG9ydGFudCc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuOCddLCBzb3J0VmFsdWU6ICcxJywgY29sb3I6ICcjYzY2JyB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIHZhciBkYXRhID0gQ1NTTGFiZWxzRmlsdGVyLkNTU19MQUJFTFM7XG4gICAgICAgIGlmICh2YWx1ZSAmJiBkYXRhW3ZhbHVlXSkge1xuICAgICAgICAgICAgdmFyIGRWID0gZGF0YVt2YWx1ZV07XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktbGFiZWwnLCBzdHlsZTogeyBjb2xvcjogZFYuY29sb3IgfSB9KSxcbiAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgZFYubGFiZWxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxudmFyIE1ldGFTZWxlY3RvckZvcm1QYW5lbCA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVNlbGVjdG9yRm9ybVBhbmVsJyxcbiAgICBtaXhpbnM6IFtNZXRhRmllbGRGb3JtUGFuZWxNaXhpbl0sXG5cbiAgICBjaGFuZ2VTZWxlY3RvcjogZnVuY3Rpb24gY2hhbmdlU2VsZWN0b3IoZSwgc2VsZWN0ZWRJbmRleCwgcGF5bG9hZCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHBheWxvYWQsIHRydWUpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLml0ZW1zTG9hZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLml0ZW1zTG9hZGVyKGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICAgICAgICAgIF90aGlzNC5zZXRTdGF0ZSh7IG1lbnVJdGVtczogaXRlbXMgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICBpID0gMTtcbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVudUl0ZW1zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5wcm9wcy5tZW51SXRlbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zdGF0ZS5tZW51SXRlbXMpKTtcbiAgICAgICAgfVxuICAgICAgICBtZW51SXRlbXMudW5zaGlmdChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogJycsIHByaW1hcnlUZXh0OiAnJyB9KSk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJyB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGludFRleHQ6IHRoaXMucHJvcHMubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZVNlbGVjdG9yIH0sXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBUYWdzQ2xvdWQgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcbiAgICBkaXNwbGF5TmFtZTogJ1RhZ3NDbG91ZCcsXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG5vZGU6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihBanhwTm9kZSksXG4gICAgICAgIGNvbHVtbjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3RcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmdldFJlYWxWYWx1ZSgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBuZXh0UHJvcHMubm9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gbmV4dFByb3BzLnZhbHVlO1xuICAgICAgICB2YXIgY29sdW1uID0gbmV4dFByb3BzLmNvbHVtbjtcblxuICAgICAgICBpZiAobm9kZSAmJiBub2RlICE9PSB0aGlzLnByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWdzOiBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhZ3M6IHZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXh0UHJvcHMuZWRpdE1vZGUgJiYgIXRoaXMuc3RhdGUubG9hZGVkKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRSZWFsVmFsdWU6IGZ1bmN0aW9uIGdldFJlYWxWYWx1ZSgpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBub2RlID0gX3Byb3BzLm5vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9wcm9wcy52YWx1ZTtcbiAgICAgICAgdmFyIGNvbHVtbiA9IF9wcm9wcy5jb2x1bW47XG5cbiAgICAgICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhZ3M6IHZhbHVlIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhZ3M6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBub2RlID0gX3Byb3BzMi5ub2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBfcHJvcHMyLnZhbHVlO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGFTb3VyY2U6IFtdLFxuICAgICAgICAgICAgdGFnczogbm9kZSA/IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQodGhpcy5wcm9wcy5jb2x1bW4ubmFtZSkgOiB2YWx1ZSxcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHN1Z2dlc3Rpb25Mb2FkZXI6IGZ1bmN0aW9uIHN1Z2dlc3Rpb25Mb2FkZXIoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRoaXMuc3RhdGUubG9hZGluZyArIDEgfSk7XG5cbiAgICAgICAgUmVuZGVyZXIuZ2V0Q2xpZW50KCkubGlzdFRhZ3ModGhpcy5wcm9wcy5maWVsZG5hbWUgfHwgdGhpcy5wcm9wcy5jb2x1bW4ubmFtZSkudGhlbihmdW5jdGlvbiAodGFncykge1xuICAgICAgICAgICAgX3RoaXM1LnNldFN0YXRlKHsgbG9hZGluZzogX3RoaXM1LnN0YXRlLmxvYWRpbmcgLSAxIH0pO1xuICAgICAgICAgICAgY2FsbGJhY2sodGFncyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsb2FkOiBmdW5jdGlvbiBsb2FkKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5zdWdnZXN0aW9uTG9hZGVyKChmdW5jdGlvbiAodGFncykge1xuICAgICAgICAgICAgdmFyIGNydFZhbHVlRm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0YWdzLm1hcCgoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogdGFnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY29tcG9uZW50XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRhdGFTb3VyY2U6IHZhbHVlcywgbG9hZGluZzogZmFsc2UsIGxvYWRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGhhbmRsZVJlcXVlc3REZWxldGU6IGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3REZWxldGUodGFnKSB7XG4gICAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YWdzID0gdGhpcy5zdGF0ZS50YWdzLnNwbGl0KCcsJyk7XG4gICAgICAgIHZhciBpbmRleCA9IHRhZ3MuaW5kZXhPZih0YWcpO1xuICAgICAgICB0YWdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGFnczogdGFncy50b1N0cmluZygpIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNi51cGRhdGVWYWx1ZShfdGhpczYuc3RhdGUudGFncywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVVcGRhdGVJbnB1dDogZnVuY3Rpb24gaGFuZGxlVXBkYXRlSW5wdXQoc2VhcmNoVGV4dCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VhcmNoVGV4dDogc2VhcmNoVGV4dCB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3UmVxdWVzdDogZnVuY3Rpb24gaGFuZGxlTmV3UmVxdWVzdCgpIHtcbiAgICAgICAgdmFyIF90aGlzNyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGFncyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS50YWdzICYmIHRoaXMuc3RhdGUudGFncy5zcGxpdCkge1xuICAgICAgICAgICAgdGFncyA9IHRoaXMuc3RhdGUudGFncy5zcGxpdCgnLCcpO1xuICAgICAgICB9XG4gICAgICAgIHRhZ3MucHVzaCh0aGlzLnN0YXRlLnNlYXJjaFRleHQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhZ3M6IHRhZ3MudG9TdHJpbmcoKSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczcudXBkYXRlVmFsdWUoX3RoaXM3LnN0YXRlLnRhZ3MsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hUZXh0OiAnJ1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyQ2hpcDogZnVuY3Rpb24gcmVuZGVyQ2hpcCh0YWcpIHtcbiAgICAgICAgdmFyIF9jb2xvcnNGcm9tU3RyaW5nID0gY29sb3JzRnJvbVN0cmluZyh0YWcpO1xuXG4gICAgICAgIHZhciBjb2xvciA9IF9jb2xvcnNGcm9tU3RyaW5nLmNvbG9yO1xuICAgICAgICB2YXIgYmFja2dyb3VuZENvbG9yID0gX2NvbG9yc0Zyb21TdHJpbmcuYmFja2dyb3VuZENvbG9yO1xuXG4gICAgICAgIHZhciBjaGlwU3R5bGUgPSB7IG1hcmdpbjogMiwgYm9yZGVyUmFkaXVzOiAnNHB4IDE2cHggMTZweCA0cHgnIH07XG4gICAgICAgIHZhciBsYWJlbFN0eWxlID0geyBjb2xvcjogY29sb3IsIGZvbnRXZWlnaHQ6IDUwMCwgcGFkZGluZ0xlZnQ6IDEwLCBwYWRkaW5nUmlnaHQ6IDE2IH07XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2hpcCxcbiAgICAgICAgICAgICAgICB7IGtleTogdGFnLCBiYWNrZ3JvdW5kQ29sb3I6IGJhY2tncm91bmRDb2xvciwgbGFiZWxTdHlsZTogbGFiZWxTdHlsZSwgc3R5bGU6IGNoaXBTdHlsZSwgb25SZXF1ZXN0RGVsZXRlOiB0aGlzLmhhbmRsZVJlcXVlc3REZWxldGUuYmluZCh0aGlzLCB0YWcpIH0sXG4gICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNoaXAsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHRhZywgYmFja2dyb3VuZENvbG9yOiBiYWNrZ3JvdW5kQ29sb3IsIGxhYmVsU3R5bGU6IGxhYmVsU3R5bGUsIHN0eWxlOiBjaGlwU3R5bGUgfSxcbiAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YWdzID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS50YWdzICYmIHRoaXMuc3RhdGUudGFncy5zcGxpdCkge1xuICAgICAgICAgICAgdGFncyA9IHRoaXMuc3RhdGUudGFncy5zcGxpdChcIixcIikubWFwKChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgICAgICAgdGFnID0gTGFuZ1V0aWxzLnRyaW0odGFnLCAnICcpO1xuICAgICAgICAgICAgICAgIGlmICghdGFnKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJDaGlwKHRhZyk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhZ3MgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF1dG9Db21wbGV0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQXV0b0NvbXBsZXRlLCBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBweWRpby5NZXNzYWdlSGFzaFsnbWV0YS51c2VyLjEwJ10sXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dDogdGhpcy5zdGF0ZS5zZWFyY2hUZXh0LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlSW5wdXQ6IHRoaXMuaGFuZGxlVXBkYXRlSW5wdXQsXG4gICAgICAgICAgICAgICAgb25OZXdSZXF1ZXN0OiB0aGlzLmhhbmRsZU5ld1JlcXVlc3QsXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZTogdGhpcy5zdGF0ZS5kYXRhU291cmNlLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKHNlYXJjaFRleHQsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH0sXG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAtOCB9LFxuICAgICAgICAgICAgICAgIG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzOC5zdGF0ZS5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczguaGFuZGxlTmV3UmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgTW9kZXJuU3R5bGVzLnRleHRGaWVsZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXV0b0NvbXBsZXRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnIH0gfSxcbiAgICAgICAgICAgICAgICB0YWdzXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYXV0b0NvbXBsZXRlclxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG52YXIgVXNlck1ldGFEaWFsb2cgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcbiAgICBkaXNwbGF5TmFtZTogJ1VzZXJNZXRhRGlhbG9nJyxcblxuICAgIHByb3BzVHlwZXM6IHtcbiAgICAgICAgc2VsZWN0aW9uOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmluc3RhbmNlT2YoUHlkaW9EYXRhTW9kZWwpXG4gICAgfSxcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHNhdmVNZXRhOiBmdW5jdGlvbiBzYXZlTWV0YSgpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMucmVmcy5wYW5lbC5nZXRVcGRhdGVEYXRhKCk7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgIHBhcmFtc1trXSA9IHY7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUmVuZGVyZXIuZ2V0Q2xpZW50KCkuc2F2ZU1ldGEodGhpcy5wcm9wcy5zZWxlY3Rpb24uZ2V0U2VsZWN0ZWROb2RlcygpLCB2YWx1ZXMpO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzOSA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zYXZlTWV0YSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM5LmRpc21pc3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVXNlck1ldGFQYW5lbCwge1xuICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICBtdWx0aXBsZTogIXRoaXMucHJvcHMuc2VsZWN0aW9uLmlzVW5pcXVlKCksXG4gICAgICAgICAgICByZWY6ICdwYW5lbCcsXG4gICAgICAgICAgICBub2RlOiB0aGlzLnByb3BzLnNlbGVjdGlvbi5pc1VuaXF1ZSgpID8gdGhpcy5wcm9wcy5zZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpIDogbmV3IEFqeHBOb2RlKCksXG4gICAgICAgICAgICBlZGl0TW9kZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxudmFyIFVzZXJNZXRhUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVXNlck1ldGFQYW5lbCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVc2VyTWV0YVBhbmVsKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyTWV0YVBhbmVsKTtcblxuICAgICAgICBpZiAocHJvcHMuZWRpdE1vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvcHMuZWRpdE1vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihVc2VyTWV0YVBhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdXBkYXRlTWV0YTogbmV3IE1hcCgpLFxuICAgICAgICAgICAgaXNDaGVja2VkOiBmYWxzZSxcbiAgICAgICAgICAgIGZpZWxkczogW10sXG4gICAgICAgICAgICBjb25maWdzOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXNlck1ldGFQYW5lbCwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMxMCA9IHRoaXM7XG5cbiAgICAgICAgICAgIFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpczEwLnNldFN0YXRlKHsgY29uZmlnczogY29uZmlncyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVWYWx1ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVWYWx1ZShuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHN1Ym1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVwZGF0ZU1ldGEuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU1ldGE6IHRoaXMuc3RhdGUudXBkYXRlTWV0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZVVwZGF0ZURhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlVXBkYXRlRGF0YSh0aGlzLnN0YXRlLnVwZGF0ZU1ldGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN1Ym1pdCAmJiB0aGlzLnByb3BzLmF1dG9TYXZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hdXRvU2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWxldGVWYWx1ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVWYWx1ZShuYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVwZGF0ZU1ldGFbJ2RlbGV0ZSddKG5hbWUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBkYXRlTWV0YTogdGhpcy5zdGF0ZS51cGRhdGVNZXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlVXBkYXRlRGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VVcGRhdGVEYXRhKHRoaXMuc3RhdGUudXBkYXRlTWV0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFVwZGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VXBkYXRlRGF0YSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnVwZGF0ZU1ldGE7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc2V0VXBkYXRlRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldFVwZGF0ZURhdGEoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cGRhdGVNZXRhOiBuZXcgTWFwKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VVcGRhdGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZVVwZGF0ZURhdGEobmV3IE1hcCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25DaGVjaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkNoZWNrKGUsIGlzSW5wdXRDaGVja2VkLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHN0YXRlWydmaWVsZHMnXVtlLnRhcmdldC52YWx1ZV0gPSBpc0lucHV0Q2hlY2tlZDtcbiAgICAgICAgICAgIGlmIChpc0lucHV0Q2hlY2tlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTEgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMuc3RhdGUuY29uZmlncztcblxuICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICAgICAgdmFyIG1ldGFkYXRhID0gdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCk7XG4gICAgICAgICAgICB2YXIgdXBkYXRlTWV0YSA9IHRoaXMuc3RhdGUudXBkYXRlTWV0YTtcbiAgICAgICAgICAgIHZhciBub25FbXB0eURhdGFDb3VudCA9IDA7XG4gICAgICAgICAgICB2YXIgaXNBZG1pbiA9IHB5ZGlvLnVzZXIuaXNBZG1pbjtcblxuICAgICAgICAgICAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChtZXRhLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZG9ubHkgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gbWV0YS5sYWJlbDtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IG1ldGEudHlwZTtcbiAgICAgICAgICAgICAgICB2YXIgd3JpdGVTdWJqZWN0ID0gbWV0YS53cml0ZVN1YmplY3Q7XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRTdWJqZWN0ID0gbWV0YS5yZWFkU3ViamVjdDtcblxuICAgICAgICAgICAgICAgIGlmIChyZWFkU3ViamVjdCA9PT0gJ3Byb2ZpbGU6YWRtaW4nICYmICFpc0FkbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHdyaXRlU3ViamVjdCA9PT0gJ3Byb2ZpbGU6YWRtaW4nICYmICFpc0FkbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtZXRhZGF0YS5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlTWV0YS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHVwZGF0ZU1ldGEuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZWFsVmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmIChfdGhpczExLnByb3BzLmVkaXRNb2RlICYmICFyZWFkb25seSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUHJvcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0NoZWNrZWQ6IF90aGlzMTEuc3RhdGUuaXNDaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiBvblZhbHVlQ2hhbmdlKG5hbWUsIHZhbHVlLCBzdWJtaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMxMS51cGRhdGVWYWx1ZShuYW1lLCB2YWx1ZSwgc3VibWl0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdGFyc19yYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTdGFyc0Zvcm1QYW5lbCwgYmFzZVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2hvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxTZWxlY3RvckZpbHRlcihiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjc3NfbGFiZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlbmRlcmVyLmZvcm1QYW5lbENzc0xhYmVscyhiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd0YWdzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxUYWdzKGJhc2VQcm9wcywgY29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHJlYWRvbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IHR5cGUgPT09ICd0ZXh0YXJlYScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxMS51cGRhdGVWYWx1ZShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMxMS5wcm9wcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiLCBrZXk6IGtleSwgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgdmFsdWU6IGtleSwgbGFiZWw6IGxhYmVsLCBvbkNoZWNrOiBfdGhpczExLm9uQ2hlY2suYmluZChfdGhpczExKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczExLnN0YXRlWydmaWVsZHMnXVtrZXldICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJpbmZvUGFuZWxSb3dcIiwga2V5OiBrZXkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsTGFiZWwnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29sdW1uID0geyBuYW1lOiBrZXkgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdGFyc19yYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU3RhcnNSZW5kZXJlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY3NzX2xhYmVsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChDU1NMYWJlbHNGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2VsZWN0b3JGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRhZ3NDbG91ZCwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhbFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub25FbXB0eURhdGFDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiaW5mb1BhbmVsUm93XCIgKyAoIXJlYWxWYWx1ZSA/ICcgbm8tdmFsdWUnIDogJycpLCBrZXk6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxMYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuZWRpdE1vZGUgJiYgIW5vbkVtcHR5RGF0YUNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMjMpJywgcGFkZGluZ0JvdHRvbTogMTAgfSwgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5vblJlcXVlc3RFZGl0TW9kZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjExJ11cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsZWdlbmQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2VtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NbJ21ldGEudXNlci4xMiddXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjEzJ11cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBvdmVyZmxvd1k6ICdzY3JvbGwnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kLFxuICAgICAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVc2VyTWV0YVBhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBJbmZvUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKEluZm9QYW5lbCwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gSW5mb1BhbmVsKHByb3BzKSB7XG4gICAgICAgIHZhciBfdGhpczEyID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5mb1BhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihJbmZvUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IGVkaXRNb2RlOiBmYWxzZSB9O1xuICAgICAgICB0aGlzLl9ub2RlT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMxMi5yZWZzLnBhbmVsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMxMi5yZWZzLnBhbmVsLnJlc2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMxMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgLy90aGlzLnNldFN0YXRlKHtlZGl0TW9kZTogZmFsc2V9LCAoKT0+e3RoaXMuZm9yY2VVcGRhdGUoKX0pO1xuICAgICAgICB9O1xuICAgICAgICBpZiAocHJvcHMubm9kZSkge1xuICAgICAgICAgICAgcHJvcHMubm9kZS5vYnNlcnZlKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhJbmZvUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ29wZW5FZGl0TW9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuRWRpdE1vZGUoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc2V0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICAgICAgdGhpcy5yZWZzLnBhbmVsLnJlc2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5ub2RlLnN0b3BPYnNlcnZpbmcoJ25vZGVfcmVwbGFjZWQnLCB0aGlzLl9ub2RlT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5ld1Byb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSAmJiB0aGlzLnJlZnMucGFuZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgbmV3UHJvcHMubm9kZS5vYnNlcnZlKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5ub2RlLnN0b3BPYnNlcnZpbmcoJ25vZGVfcmVwbGFjZWQnLCB0aGlzLl9ub2RlT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzYXZlTWV0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlTWV0YSgpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLnJlZnMucGFuZWwuZ2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgcmV0dXJuIFJlbmRlcmVyLmdldENsaWVudCgpLnNhdmVNZXRhKHRoaXMucHJvcHMucHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldFNlbGVjdGVkTm9kZXMoKSwgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2F2ZUFuZENsb3NlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNhdmVBbmRDbG9zZSgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczEzID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5zYXZlTWV0YSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMTMucmVzZXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkNoYW5nZVVwZGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25DaGFuZ2VVcGRhdGVEYXRhKHVwZGF0ZURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1cGRhdGVEYXRhOiB1cGRhdGVEYXRhIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcblxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMuc3RhdGUudXBkYXRlRGF0YSB8fCBuZXcgTWFwKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHZhbHVlcy5zaXplID8gTWVzc2FnZUhhc2hbJzU0J10gOiBNZXNzYWdlSGFzaFsnODYnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxNC5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuaGFzKCdub2RlX3JlYWRvbmx5JykgJiYgdmFsdWVzLnNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6ICdlZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnN0YXRlLmVkaXRNb2RlID8gTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xNSddIDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xNCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQuc2F2ZUFuZENsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2VkaXQnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5zdGF0ZS5lZGl0TW9kZSA/IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTUnXSA6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTQnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxNC5vcGVuRWRpdE1vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllcjogXCJtZXRhLXVzZXJcIixcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMSddLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBhY3Rpb25zLmxlbmd0aCA/IGFjdGlvbnMgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAndGFnLW11bHRpcGxlJywgaWNvbkNvbG9yOiAnIzAwQUNDMSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJNZXRhUGFuZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICBub2RlOiB0aGlzLnByb3BzLm5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGVkaXRNb2RlOiB0aGlzLnN0YXRlLmVkaXRNb2RlLFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RFZGl0TW9kZTogdGhpcy5vcGVuRWRpdE1vZGUuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlVXBkYXRlRGF0YTogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQub25DaGFuZ2VVcGRhdGVEYXRhKGQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhdXRvU2F2ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxNC5zYXZlTWV0YSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQucmVmcy5wYW5lbC5yZXNldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbmV4cG9ydHMuSW5mb1BhbmVsID0gSW5mb1BhbmVsO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLlVzZXJNZXRhRGlhbG9nID0gVXNlck1ldGFEaWFsb2c7XG5leHBvcnRzLlVzZXJNZXRhUGFuZWwgPSBVc2VyTWV0YVBhbmVsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jb21wb25lbnRzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzJyk7XG5cbmV4cG9ydHMuUmVuZGVyZXIgPSBfY29tcG9uZW50cy5SZW5kZXJlcjtcbmV4cG9ydHMuSW5mb1BhbmVsID0gX2NvbXBvbmVudHMuSW5mb1BhbmVsO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBfY29tcG9uZW50cy5DYWxsYmFja3M7XG5leHBvcnRzLlVzZXJNZXRhRGlhbG9nID0gX2NvbXBvbmVudHMuVXNlck1ldGFEaWFsb2c7XG5leHBvcnRzLlVzZXJNZXRhUGFuZWwgPSBfY29tcG9uZW50cy5Vc2VyTWV0YVBhbmVsO1xuIl19
