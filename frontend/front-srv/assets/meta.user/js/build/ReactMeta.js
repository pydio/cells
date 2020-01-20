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

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioHttpRestApi = require('pydio/http/rest-api');

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

            var api = new _pydioHttpRestApi.UserMetaServiceApi(this.client);
            return new Promise(function (resolve, reject) {
                _this.loadConfigs().then(function (configs) {
                    var proms = [];
                    nodes.map(function (node) {
                        var request = new _pydioHttpRestApi.IdmUpdateUserMetaRequest();
                        request.MetaDatas = [];
                        request.Operation = 'PUT';
                        configs.forEach(function (cData, cName) {
                            if (!values.has(cName)) {
                                return;
                            }
                            var meta = new _pydioHttpRestApi.IdmUserMeta();
                            meta.NodeUuid = node.getMetadata().get("uuid");
                            meta.Namespace = cName;
                            meta.JsonValue = JSON.stringify(values.get(cName));
                            meta.Policies = [_pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({
                                Action: 'READ',
                                Subject: '*',
                                Effect: 'allow'
                            }), _pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({
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
                var api = new _pydioHttpRestApi.UserMetaServiceApi(_this2.client);
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

                var api = new _pydioHttpRestApi.UserMetaServiceApi(_this3.client);
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

            var api = new _pydioHttpRestApi.UserMetaServiceApi(this.client);
            return api.putUserMetaTag(namespace, _pydioHttpRestApi.RestPutUserMetaTagRequest.constructFromObject({
                Namespace: namespace,
                Tag: newTag
            }));
        }
    }]);

    return MetaClient;
})();

exports['default'] = MetaClient;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/node":"pydio/model/node"}],2:[function(require,module,exports){
/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _MetaClient = require('./MetaClient');

var _MetaClient2 = _interopRequireDefault(_MetaClient);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

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
        label: _react2['default'].PropTypes.string,
        fieldname: _react2['default'].PropTypes.string,
        onChange: _react2['default'].PropTypes.func,
        onValueChange: _react2['default'].PropTypes.func
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
        node: _react2['default'].PropTypes.instanceOf(AjxpNode),
        column: _react2['default'].PropTypes.object
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

var StarsFormPanel = _react2['default'].createClass({
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

var MetaStarsRenderer = _react2['default'].createClass({
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

var SelectorFilter = _react2['default'].createClass({
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

var CSSLabelsFilter = _react2['default'].createClass({
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

var MetaSelectorFormPanel = _react2['default'].createClass({
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

var TagsCloud = _react2['default'].createClass({
    displayName: 'TagsCloud',

    mixins: [MetaFieldFormPanelMixin],

    propTypes: {
        node: _react2['default'].PropTypes.instanceOf(AjxpNode),
        column: _react2['default'].PropTypes.object
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

var UserMetaDialog = _react2['default'].createClass({
    displayName: 'UserMetaDialog',

    propsTypes: {
        selection: _react2['default'].PropTypes.instanceOf(PydioDataModel)
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

},{"./MetaClient":1,"color":"color","material-ui":"material-ui","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _components = require('./components');

exports.Renderer = _components.Renderer;
exports.InfoPanel = _components.InfoPanel;
exports.Callbacks = _components.Callbacks;
exports.UserMetaDialog = _components.UserMetaDialog;

},{"./components":2}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9NZXRhQ2xpZW50LmpzIiwianMvYnVpbGQvY29tcG9uZW50cy5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbE5vZGUpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBNZXRhQ2xpZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNZXRhQ2xpZW50KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWV0YUNsaWVudCk7XG5cbiAgICAgICAgdGhpcy5jbGllbnQgPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIG1ldGFzIHRvIHNlcnZlclxuICAgICAqIEBwYXJhbSBub2RlcyBbe05vZGV9XVxuICAgICAqIEBwYXJhbSB2YWx1ZXMge09iamVjdH1cbiAgICAgKi9cblxuICAgIF9jcmVhdGVDbGFzcyhNZXRhQ2xpZW50LCBbe1xuICAgICAgICBrZXk6ICdzYXZlTWV0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlTWV0YShub2RlcywgdmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlVzZXJNZXRhU2VydmljZUFwaSh0aGlzLmNsaWVudCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmxvYWRDb25maWdzKCkudGhlbihmdW5jdGlvbiAoY29uZmlncykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5JZG1VcGRhdGVVc2VyTWV0YVJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuTWV0YURhdGFzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk9wZXJhdGlvbiA9ICdQVVQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjRGF0YSwgY05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXMoY05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1ldGEgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuSWRtVXNlck1ldGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLk5vZGVVdWlkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldChcInV1aWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5OYW1lc3BhY2UgPSBjTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLkpzb25WYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlcy5nZXQoY05hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLlBvbGljaWVzID0gW19weWRpb0h0dHBSZXN0QXBpLlNlcnZpY2VSZXNvdXJjZVBvbGljeS5jb25zdHJ1Y3RGcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWN0aW9uOiAnUkVBRCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN1YmplY3Q6ICcqJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRWZmZWN0OiAnYWxsb3cnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIF9weWRpb0h0dHBSZXN0QXBpLlNlcnZpY2VSZXNvdXJjZVBvbGljeS5jb25zdHJ1Y3RGcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWN0aW9uOiAnV1JJVEUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdWJqZWN0OiAnKicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ2FsbG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk1ldGFEYXRhcy5wdXNoKG1ldGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoY05hbWUsIHZhbHVlcy5nZXQoY05hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChhcGkudXBkYXRlVXNlck1ldGEocmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubm90aWZ5KCdub2RlX3JlcGxhY2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9tcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NsZWFyQ29uZmlncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckNvbmZpZ3MoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3MgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2U8TWFwPn1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkQ29uZmlncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQ29uZmlncygpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWdzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmNvbmZpZ3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvbWlzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVmcyA9IHt9O1xuICAgICAgICAgICAgICAgIHZhciBjb25maWdNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkoX3RoaXMyLmNsaWVudCk7XG4gICAgICAgICAgICAgICAgYXBpLmxpc3RVc2VyTWV0YU5hbWVzcGFjZSgpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuTmFtZXNwYWNlcy5tYXAoZnVuY3Rpb24gKG5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG5zLk5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiYXNlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBucy5MYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleGFibGU6IG5zLkluZGV4YWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogbnMuT3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChucy5Kc29uRGVmaW5pdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBqRGVmID0gSlNPTi5wYXJzZShucy5Kc29uRGVmaW5pdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpEZWYpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVtrXSA9IGpEZWZba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnMuUG9saWNpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBucy5Qb2xpY2llcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHAuQWN0aW9uID09PSAnUkVBRCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VbJ3JlYWRTdWJqZWN0J10gPSBwLlN1YmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocC5BY3Rpb24gPT09ICdXUklURScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VbJ3dyaXRlU3ViamVjdCddID0gcC5TdWJqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZzW25hbWVdID0gYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnJDb25maWdzID0gT2JqZWN0LmVudHJpZXMoZGVmcykubWFwKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlbMV0ubnMgPSBlbnRyeVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRyeVsxXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFyckNvbmZpZ3Muc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yZGVyQSA9IGEub3JkZXIgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmRlckIgPSBiLm9yZGVyIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3JkZXJBID4gb3JkZXJCID8gMSA6IG9yZGVyQSA9PT0gb3JkZXJCID8gMCA6IC0xO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYXJyQ29uZmlncy5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHZhbHVlLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjaG9pY2UnICYmIHZhbHVlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhLnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24gKGtleUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBrZXlMYWJlbC5zcGxpdChcInxcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc2V0KHBhcnRzWzBdLCBwYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhID0gdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdNYXAuc2V0KHZhbHVlLm5zLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuY29uZmlncyA9IGNvbmZpZ01hcDtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb25maWdNYXApO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBNYXAoKSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lc3BhY2UgU3RyaW5nXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2U8QXJyYXk+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xpc3RUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxpc3RUYWdzKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkoX3RoaXMzLmNsaWVudCk7XG4gICAgICAgICAgICAgICAgYXBpLmxpc3RVc2VyTWV0YVRhZ3MobmFtZXNwYWNlKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuVGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5UYWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbmFtZXNwYWNlIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gbmV3VGFnIHN0cmluZ1xuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NyZWF0ZVRhZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVUYWcobmFtZXNwYWNlLCBuZXdUYWcpIHtcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkodGhpcy5jbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5wdXRVc2VyTWV0YVRhZyhuYW1lc3BhY2UsIF9weWRpb0h0dHBSZXN0QXBpLlJlc3RQdXRVc2VyTWV0YVRhZ1JlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgTmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgVGFnOiBuZXdUYWdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNZXRhQ2xpZW50O1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTWV0YUNsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTkgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MywgX3g0LCBfeDUpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gzLCBwcm9wZXJ0eSA9IF94NCwgcmVjZWl2ZXIgPSBfeDU7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gzID0gcGFyZW50OyBfeDQgPSBwcm9wZXJ0eTsgX3g1ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9NZXRhQ2xpZW50ID0gcmVxdWlyZSgnLi9NZXRhQ2xpZW50Jyk7XG5cbnZhciBfTWV0YUNsaWVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NZXRhQ2xpZW50KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZSgnY29sb3InKTtcblxudmFyIF9jb2xvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb2xvcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuU2VsZWN0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TZWxlY3RGaWVsZDtcbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG52YXIgTW9kZXJuU3R5bGVzID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU3R5bGVzO1xuXG52YXIgY29sb3JzQ2FjaGUgPSB7fTtcblxuZnVuY3Rpb24gY29sb3JzRnJvbVN0cmluZyhzKSB7XG4gICAgaWYgKHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgaWYgKGNvbG9yc0NhY2hlW3NdKSB7XG4gICAgICAgIHJldHVybiBjb2xvcnNDYWNoZVtzXTtcbiAgICB9XG4gICAgdmFyIGhhc2ggPSAwLFxuICAgICAgICBpID0gdW5kZWZpbmVkLFxuICAgICAgICBjaHIgPSB1bmRlZmluZWQsXG4gICAgICAgIGxlbiA9IHVuZGVmaW5lZDtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNociA9IHMuY2hhckNvZGVBdChpKSAqIDEwMDA7XG4gICAgICAgIGhhc2ggPSAoaGFzaCA8PCA1KSAtIGhhc2ggKyBjaHI7XG4gICAgICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gICAgfVxuICAgIHZhciBjID0gKGhhc2ggJiAweDAwRkZGRkZGKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICB2YXIgaGV4ID0gXCIwMDAwMFwiLnN1YnN0cmluZygwLCA2IC0gYy5sZW5ndGgpICsgYztcbiAgICB2YXIgY29sb3IgPSBuZXcgX2NvbG9yMlsnZGVmYXVsdCddKCcjJyArIGhleCkuaHNsKCk7XG4gICAgdmFyIGh1ZSA9IGNvbG9yLmh1ZSgpO1xuICAgIHZhciBiZyA9IG5ldyBfY29sb3IyWydkZWZhdWx0J10oeyBoOiBodWUsIHM6IGNvbG9yLnNhdHVyYXRpb25sKCksIGw6IDkwIH0pO1xuICAgIHZhciBmZyA9IG5ldyBfY29sb3IyWydkZWZhdWx0J10oeyBoOiBodWUsIHM6IGNvbG9yLnNhdHVyYXRpb25sKCksIGw6IDQwIH0pO1xuICAgIHZhciByZXN1bHQgPSB7IGNvbG9yOiBmZy5zdHJpbmcoKSwgYmFja2dyb3VuZENvbG9yOiBiZy5zdHJpbmcoKSB9O1xuICAgIGNvbG9yc0NhY2hlW3NdID0gcmVzdWx0O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBSZW5kZXJlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUmVuZGVyZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZW5kZXJlcik7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFJlbmRlcmVyLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdnZXRNZXRhZGF0YUNvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWV0YWRhdGFDb25maWdzKCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlbmRlcmVyLmdldENsaWVudCgpLmxvYWRDb25maWdzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybiB7TWV0YUNsaWVudH1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRDbGllbnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2xpZW50KCkge1xuICAgICAgICAgICAgaWYgKCFSZW5kZXJlci5DbGllbnQpIHtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5DbGllbnQgPSBuZXcgX01ldGFDbGllbnQyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJlci5DbGllbnQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlclN0YXJzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlclN0YXJzKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTdGFyc1JlbmRlcmVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uLCBzaXplOiAnc21hbGwnIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJTZWxlY3RvcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJTZWxlY3Rvcihub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTZWxlY3RvckZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyQ1NTTGFiZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyQ1NTTGFiZWwobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQ1NTTGFiZWxzRmlsdGVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJUYWdzQ2xvdWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyVGFnc0Nsb3VkKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRhZ1N0eWxlID0ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNFMUJFRTcnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzNweCAxMHB4IDEwcHggM3B4JyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDE2LFxuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxN3B4JyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCAxMHB4IDAgNXB4JyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM5QzI3QjAnLFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQ6IDZcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKTtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgIXZhbHVlLnNwbGl0KSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZS5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHt9LCB0YWdTdHlsZSwgY29sb3JzRnJvbVN0cmluZyh0YWcpKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbFN0YXJzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFN0YXJzKHByb3BzKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU3RhcnNGb3JtUGFuZWwsIHByb3BzKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsQ3NzTGFiZWxzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbENzc0xhYmVscyhwcm9wcykge1xuXG4gICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gT2JqZWN0LmtleXMoQ1NTTGFiZWxzRmlsdGVyLkNTU19MQUJFTFMpLm1hcCgoZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gQ1NTTGFiZWxzRmlsdGVyLkNTU19MQUJFTFNbaWRdO1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogaWQsIHByaW1hcnlUZXh0OiBsYWJlbC5sYWJlbCB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWV0YVNlbGVjdG9yRm9ybVBhbmVsLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgbWVudUl0ZW1zOiBtZW51SXRlbXMgfSkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxTZWxlY3RvckZpbHRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxTZWxlY3RvckZpbHRlcihwcm9wcykge1xuXG4gICAgICAgICAgICB2YXIgaXRlbXNMb2FkZXIgPSBmdW5jdGlvbiBpdGVtc0xvYWRlcihjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKG1ldGFDb25maWdzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb25maWdzID0gbWV0YUNvbmZpZ3MuZ2V0KHByb3BzLmZpZWxkbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZW51SXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3MgJiYgY29uZmlncy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdzLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBrZXksIHByaW1hcnlUZXh0OiB2YWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhtZW51SXRlbXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTZWxlY3RvckZvcm1QYW5lbCwgX2V4dGVuZHMoe30sIHByb3BzLCB7IG1lbnVJdGVtczogW10sIGl0ZW1zTG9hZGVyOiBpdGVtc0xvYWRlciB9KSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbFRhZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsVGFncyhwcm9wcykge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRhZ3NDbG91ZCwgX2V4dGVuZHMoe30sIHByb3BzLCB7IGVkaXRNb2RlOiB0cnVlIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBSZW5kZXJlcjtcbn0pKCk7XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnZWRpdE1ldGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZWRpdE1ldGEoKSB7XG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnUmVhY3RNZXRhJywgJ1VzZXJNZXRhRGlhbG9nJywge1xuICAgICAgICAgICAgICAgIGRpYWxvZ1RpdGxlSWQ6IDQ4OSxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb246IHB5ZGlvLmdldFVzZXJTZWxlY3Rpb24oKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxudmFyIE1ldGFGaWVsZEZvcm1QYW5lbE1peGluID0ge1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGxhYmVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgZmllbGRuYW1lOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgb25DaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25WYWx1ZUNoYW5nZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyBjb25maWdzOiBuZXcgTWFwKCkgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgY29uZmlnczogYyB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZVZhbHVlOiBmdW5jdGlvbiB1cGRhdGVWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB2YXIgc3VibWl0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIG9iamVjdCA9IHt9O1xuICAgICAgICAgICAgb2JqZWN0WydhanhwX21ldGFfJyArIHRoaXMucHJvcHMuZmllbGRuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShvYmplY3QsIHN1Ym1pdCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5vblZhbHVlQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsdWVDaGFuZ2UodGhpcy5wcm9wcy5maWVsZG5hbWUsIHZhbHVlLCBzdWJtaXQpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG52YXIgTWV0YUZpZWxkUmVuZGVyZXJNaXhpbiA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBub2RlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpLFxuICAgICAgICBjb2x1bW46IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfHwgMCxcbiAgICAgICAgICAgIGNvbmZpZ3M6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGNvbmZpZ3MgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRSZWFsVmFsdWU6IGZ1bmN0aW9uIGdldFJlYWxWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubm9kZS5nZXRNZXRhZGF0YSgpLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKTtcbiAgICB9XG5cbn07XG5cbnZhciBzdGFyc1N0eWxlID0geyBmb250U2l6ZTogMjAsIGNvbG9yOiAnI0ZCQzAyRCcsIG1hcmdpblRvcDogNiwgbWFyZ2luQm90dG9tOiA2IH07XG5cbnZhciBTdGFyc0Zvcm1QYW5lbCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTdGFyc0Zvcm1QYW5lbCcsXG5cbiAgICBtaXhpbnM6IFtNZXRhRmllbGRGb3JtUGFuZWxNaXhpbl0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfHwgMCB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgdmFyIHN0YXJzID0gWy0xLCAwLCAxLCAyLCAzLCA0XS5tYXAoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGljID0gJ3N0YXInICsgKHYgPT09IC0xID8gJy1vZmYnIDogdmFsdWUgPiB2ID8gJycgOiAnLW91dGxpbmUnKTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IHYgPT09IC0xID8geyBtYXJnaW5SaWdodDogNSwgY3Vyc29yOiAncG9pbnRlcicgfSA6IHsgY3Vyc29yOiAncG9pbnRlcicgfTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiBcInN0YXItXCIgKyB2LCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMudXBkYXRlVmFsdWUodiArIDEsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0sIGNsYXNzTmFtZTogXCJtZGkgbWRpLVwiICsgaWMsIHN0eWxlOiBzdHlsZSB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdhZHZhbmNlZC1zZWFyY2gtc3RhcnMnLCBzdHlsZTogX2V4dGVuZHMoe30sIE1vZGVyblN0eWxlcy5kaXYsIHN0YXJzU3R5bGUpIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIE1ldGFTdGFyc1JlbmRlcmVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ01ldGFTdGFyc1JlbmRlcmVyJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCkgfHwgMDtcbiAgICAgICAgdmFyIHN0YXJzID0gWzAsIDEsIDIsIDMsIDRdLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBrZXk6IFwic3Rhci1cIiArIHYsIGNsYXNzTmFtZTogXCJtZGkgbWRpLXN0YXJcIiArICh2YWx1ZSA+IHYgPyAnJyA6ICctb3V0bGluZScpIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHN0eWxlID0gdGhpcy5wcm9wcy5zaXplID09PSAnc21hbGwnID8geyBjb2xvcjogc3RhcnNTdHlsZS5jb2xvciB9IDogc3RhcnNTdHlsZTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBzdHlsZTogc3R5bGUgfSxcbiAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIFNlbGVjdG9yRmlsdGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1NlbGVjdG9yRmlsdGVyJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBjb25maWdzID0gdGhpcy5zdGF0ZS5jb25maWdzO1xuXG4gICAgICAgIHZhciB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGRpc3BsYXlWYWx1ZSA9IHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKTtcbiAgICAgICAgdmFyIGZpZWxkQ29uZmlnID0gY29uZmlncy5nZXQodGhpcy5wcm9wcy5jb2x1bW4ubmFtZSk7XG4gICAgICAgIGlmIChmaWVsZENvbmZpZyAmJiBmaWVsZENvbmZpZy5kYXRhKSB7XG4gICAgICAgICAgICBkaXNwbGF5VmFsdWUgPSBmaWVsZENvbmZpZy5kYXRhLmdldCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIGRpc3BsYXlWYWx1ZVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBDU1NMYWJlbHNGaWx0ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQ1NTTGFiZWxzRmlsdGVyJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICBDU1NfTEFCRUxTOiB7XG4gICAgICAgICAgICAnbG93JzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci40J10sIHNvcnRWYWx1ZTogJzUnLCBjb2xvcjogJyM2NmMnIH0sXG4gICAgICAgICAgICAndG9kbyc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNSddLCBzb3J0VmFsdWU6ICc0JywgY29sb3I6ICcjNjljJyB9LFxuICAgICAgICAgICAgJ3BlcnNvbmFsJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci42J10sIHNvcnRWYWx1ZTogJzMnLCBjb2xvcjogJyM2YzYnIH0sXG4gICAgICAgICAgICAnd29yayc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNyddLCBzb3J0VmFsdWU6ICcyJywgY29sb3I6ICcjYzk2JyB9LFxuICAgICAgICAgICAgJ2ltcG9ydGFudCc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuOCddLCBzb3J0VmFsdWU6ICcxJywgY29sb3I6ICcjYzY2JyB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIHZhciBkYXRhID0gQ1NTTGFiZWxzRmlsdGVyLkNTU19MQUJFTFM7XG4gICAgICAgIGlmICh2YWx1ZSAmJiBkYXRhW3ZhbHVlXSkge1xuICAgICAgICAgICAgdmFyIGRWID0gZGF0YVt2YWx1ZV07XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktbGFiZWwnLCBzdHlsZTogeyBjb2xvcjogZFYuY29sb3IgfSB9KSxcbiAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgZFYubGFiZWxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG52YXIgTWV0YVNlbGVjdG9yRm9ybVBhbmVsID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ01ldGFTZWxlY3RvckZvcm1QYW5lbCcsXG5cbiAgICBtaXhpbnM6IFtNZXRhRmllbGRGb3JtUGFuZWxNaXhpbl0sXG5cbiAgICBjaGFuZ2VTZWxlY3RvcjogZnVuY3Rpb24gY2hhbmdlU2VsZWN0b3IoZSwgc2VsZWN0ZWRJbmRleCwgcGF5bG9hZCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHBheWxvYWQsIHRydWUpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLml0ZW1zTG9hZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLml0ZW1zTG9hZGVyKGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICAgICAgICAgIF90aGlzNC5zZXRTdGF0ZSh7IG1lbnVJdGVtczogaXRlbXMgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICBpID0gMTtcbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVudUl0ZW1zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5wcm9wcy5tZW51SXRlbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zdGF0ZS5tZW51SXRlbXMpKTtcbiAgICAgICAgfVxuICAgICAgICBtZW51SXRlbXMudW5zaGlmdChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogJycsIHByaW1hcnlUZXh0OiAnJyB9KSk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJyB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGludFRleHQ6IHRoaXMucHJvcHMubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZVNlbGVjdG9yIH0sXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIFRhZ3NDbG91ZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdUYWdzQ2xvdWQnLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG5vZGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihBanhwTm9kZSksXG4gICAgICAgIGNvbHVtbjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5nZXRSZWFsVmFsdWUoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHZhciBub2RlID0gbmV4dFByb3BzLm5vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IG5leHRQcm9wcy52YWx1ZTtcbiAgICAgICAgdmFyIGNvbHVtbiA9IG5leHRQcm9wcy5jb2x1bW47XG5cbiAgICAgICAgaWYgKG5vZGUgJiYgbm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWdzOiB2YWx1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV4dFByb3BzLmVkaXRNb2RlICYmICF0aGlzLnN0YXRlLmxvYWRlZCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0UmVhbFZhbHVlOiBmdW5jdGlvbiBnZXRSZWFsVmFsdWUoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBfcHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBjb2x1bW4gPSBfcHJvcHMuY29sdW1uO1xuXG4gICAgICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWdzOiB2YWx1ZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWdzOiBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbm9kZSA9IF9wcm9wczIubm9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzMi52YWx1ZTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBkYXRhU291cmNlOiBbXSxcbiAgICAgICAgICAgIHRhZ3M6IG5vZGUgPyBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KHRoaXMucHJvcHMuY29sdW1uLm5hbWUpIDogdmFsdWUsXG4gICAgICAgICAgICBzZWFyY2hUZXh0OiAnJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBzdWdnZXN0aW9uTG9hZGVyOiBmdW5jdGlvbiBzdWdnZXN0aW9uTG9hZGVyKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0aGlzLnN0YXRlLmxvYWRpbmcgKyAxIH0pO1xuXG4gICAgICAgIFJlbmRlcmVyLmdldENsaWVudCgpLmxpc3RUYWdzKHRoaXMucHJvcHMuZmllbGRuYW1lIHx8IHRoaXMucHJvcHMuY29sdW1uLm5hbWUpLnRoZW4oZnVuY3Rpb24gKHRhZ3MpIHtcbiAgICAgICAgICAgIF90aGlzNS5zZXRTdGF0ZSh7IGxvYWRpbmc6IF90aGlzNS5zdGF0ZS5sb2FkaW5nIC0gMSB9KTtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRhZ3MpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbG9hZDogZnVuY3Rpb24gbG9hZCgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbkxvYWRlcigoZnVuY3Rpb24gKHRhZ3MpIHtcbiAgICAgICAgICAgIHZhciBjcnRWYWx1ZUZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gdGFncy5tYXAoKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IHRhZyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkYXRhU291cmNlOiB2YWx1ZXMsIGxvYWRpbmc6IGZhbHNlLCBsb2FkZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZXF1ZXN0RGVsZXRlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0RGVsZXRlKHRhZykge1xuICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgICB2YXIgdGFncyA9IHRoaXMuc3RhdGUudGFncy5zcGxpdCgnLCcpO1xuICAgICAgICB2YXIgaW5kZXggPSB0YWdzLmluZGV4T2YodGFnKTtcbiAgICAgICAgdGFncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhZ3M6IHRhZ3MudG9TdHJpbmcoKSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczYudXBkYXRlVmFsdWUoX3RoaXM2LnN0YXRlLnRhZ3MsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlVXBkYXRlSW5wdXQ6IGZ1bmN0aW9uIGhhbmRsZVVwZGF0ZUlucHV0KHNlYXJjaFRleHQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlYXJjaFRleHQ6IHNlYXJjaFRleHQgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZU5ld1JlcXVlc3Q6IGZ1bmN0aW9uIGhhbmRsZU5ld1JlcXVlc3QoKSB7XG4gICAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRhZ3MgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGFncyAmJiB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQpIHtcbiAgICAgICAgICAgIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoJywnKTtcbiAgICAgICAgfVxuICAgICAgICB0YWdzLnB1c2godGhpcy5zdGF0ZS5zZWFyY2hUZXh0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YWdzOiB0YWdzLnRvU3RyaW5nKCkgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM3LnVwZGF0ZVZhbHVlKF90aGlzNy5zdGF0ZS50YWdzLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoVGV4dDogJydcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlckNoaXA6IGZ1bmN0aW9uIHJlbmRlckNoaXAodGFnKSB7XG4gICAgICAgIHZhciBfY29sb3JzRnJvbVN0cmluZyA9IGNvbG9yc0Zyb21TdHJpbmcodGFnKTtcblxuICAgICAgICB2YXIgY29sb3IgPSBfY29sb3JzRnJvbVN0cmluZy5jb2xvcjtcbiAgICAgICAgdmFyIGJhY2tncm91bmRDb2xvciA9IF9jb2xvcnNGcm9tU3RyaW5nLmJhY2tncm91bmRDb2xvcjtcblxuICAgICAgICB2YXIgY2hpcFN0eWxlID0geyBtYXJnaW46IDIsIGJvcmRlclJhZGl1czogJzRweCAxNnB4IDE2cHggNHB4JyB9O1xuICAgICAgICB2YXIgbGFiZWxTdHlsZSA9IHsgY29sb3I6IGNvbG9yLCBmb250V2VpZ2h0OiA1MDAsIHBhZGRpbmdMZWZ0OiAxMCwgcGFkZGluZ1JpZ2h0OiAxNiB9O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNoaXAsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHRhZywgYmFja2dyb3VuZENvbG9yOiBiYWNrZ3JvdW5kQ29sb3IsIGxhYmVsU3R5bGU6IGxhYmVsU3R5bGUsIHN0eWxlOiBjaGlwU3R5bGUsIG9uUmVxdWVzdERlbGV0ZTogdGhpcy5oYW5kbGVSZXF1ZXN0RGVsZXRlLmJpbmQodGhpcywgdGFnKSB9LFxuICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5DaGlwLFxuICAgICAgICAgICAgICAgIHsga2V5OiB0YWcsIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZENvbG9yLCBsYWJlbFN0eWxlOiBsYWJlbFN0eWxlLCBzdHlsZTogY2hpcFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXM4ID0gdGhpcztcblxuICAgICAgICB2YXIgdGFncyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGFncyAmJiB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQpIHtcbiAgICAgICAgICAgIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoXCIsXCIpLm1hcCgoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgIHRhZyA9IExhbmdVdGlscy50cmltKHRhZywgJyAnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRhZykgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyQ2hpcCh0YWcpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWdzID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhdXRvQ29tcGxldGVyID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZSkge1xuICAgICAgICAgICAgYXV0b0NvbXBsZXRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkF1dG9Db21wbGV0ZSwgX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaW50VGV4dDogcHlkaW8uTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xMCddLFxuICAgICAgICAgICAgICAgIHNlYXJjaFRleHQ6IHRoaXMuc3RhdGUuc2VhcmNoVGV4dCxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZUlucHV0OiB0aGlzLmhhbmRsZVVwZGF0ZUlucHV0LFxuICAgICAgICAgICAgICAgIG9uTmV3UmVxdWVzdDogdGhpcy5oYW5kbGVOZXdSZXF1ZXN0LFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IHRoaXMuc3RhdGUuZGF0YVNvdXJjZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWFyY2hUZXh0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSA9PT0gMDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wZW5PbkZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lbnVQcm9wczogeyBtYXhIZWlnaHQ6IDIwMCB9LFxuICAgICAgICAgICAgICAgIHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogLTggfSxcbiAgICAgICAgICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpczguc3RhdGUuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM4LmhhbmRsZU5ld1JlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIE1vZGVyblN0eWxlcy50ZXh0RmllbGQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJyB9IH0sXG4gICAgICAgICAgICAgICAgdGFnc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZXJcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgVXNlck1ldGFEaWFsb2cgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVXNlck1ldGFEaWFsb2cnLFxuXG4gICAgcHJvcHNUeXBlczoge1xuICAgICAgICBzZWxlY3Rpb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihQeWRpb0RhdGFNb2RlbClcbiAgICB9LFxuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuQ2FuY2VsQnV0dG9uUHJvdmlkZXJNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgc2F2ZU1ldGE6IGZ1bmN0aW9uIHNhdmVNZXRhKCkge1xuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5yZWZzLnBhbmVsLmdldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaykge1xuICAgICAgICAgICAgcGFyYW1zW2tdID0gdjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBSZW5kZXJlci5nZXRDbGllbnQoKS5zYXZlTWV0YSh0aGlzLnByb3BzLnNlbGVjdGlvbi5nZXRTZWxlY3RlZE5vZGVzKCksIHZhbHVlcyk7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXM5ID0gdGhpcztcblxuICAgICAgICB0aGlzLnNhdmVNZXRhKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczkuZGlzbWlzcygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVXNlck1ldGFQYW5lbCwge1xuICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICBtdWx0aXBsZTogIXRoaXMucHJvcHMuc2VsZWN0aW9uLmlzVW5pcXVlKCksXG4gICAgICAgICAgICByZWY6ICdwYW5lbCcsXG4gICAgICAgICAgICBub2RlOiB0aGlzLnByb3BzLnNlbGVjdGlvbi5pc1VuaXF1ZSgpID8gdGhpcy5wcm9wcy5zZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpIDogbmV3IEFqeHBOb2RlKCksXG4gICAgICAgICAgICBlZGl0TW9kZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxudmFyIFVzZXJNZXRhUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVXNlck1ldGFQYW5lbCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVc2VyTWV0YVBhbmVsKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyTWV0YVBhbmVsKTtcblxuICAgICAgICBpZiAocHJvcHMuZWRpdE1vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvcHMuZWRpdE1vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihVc2VyTWV0YVBhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdXBkYXRlTWV0YTogbmV3IE1hcCgpLFxuICAgICAgICAgICAgaXNDaGVja2VkOiBmYWxzZSxcbiAgICAgICAgICAgIGZpZWxkczogW10sXG4gICAgICAgICAgICBjb25maWdzOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXNlck1ldGFQYW5lbCwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMxMCA9IHRoaXM7XG5cbiAgICAgICAgICAgIFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpczEwLnNldFN0YXRlKHsgY29uZmlnczogY29uZmlncyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVWYWx1ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVWYWx1ZShuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHN1Ym1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVwZGF0ZU1ldGEuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU1ldGE6IHRoaXMuc3RhdGUudXBkYXRlTWV0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZVVwZGF0ZURhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlVXBkYXRlRGF0YSh0aGlzLnN0YXRlLnVwZGF0ZU1ldGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN1Ym1pdCAmJiB0aGlzLnByb3BzLmF1dG9TYXZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hdXRvU2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWxldGVWYWx1ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVWYWx1ZShuYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVwZGF0ZU1ldGFbJ2RlbGV0ZSddKG5hbWUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBkYXRlTWV0YTogdGhpcy5zdGF0ZS51cGRhdGVNZXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlVXBkYXRlRGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VVcGRhdGVEYXRhKHRoaXMuc3RhdGUudXBkYXRlTWV0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFVwZGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VXBkYXRlRGF0YSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnVwZGF0ZU1ldGE7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc2V0VXBkYXRlRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldFVwZGF0ZURhdGEoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cGRhdGVNZXRhOiBuZXcgTWFwKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VVcGRhdGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZVVwZGF0ZURhdGEobmV3IE1hcCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25DaGVjaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkNoZWNrKGUsIGlzSW5wdXRDaGVja2VkLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHN0YXRlWydmaWVsZHMnXVtlLnRhcmdldC52YWx1ZV0gPSBpc0lucHV0Q2hlY2tlZDtcbiAgICAgICAgICAgIGlmIChpc0lucHV0Q2hlY2tlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTEgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMuc3RhdGUuY29uZmlncztcblxuICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICAgICAgdmFyIG1ldGFkYXRhID0gdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCk7XG4gICAgICAgICAgICB2YXIgdXBkYXRlTWV0YSA9IHRoaXMuc3RhdGUudXBkYXRlTWV0YTtcbiAgICAgICAgICAgIHZhciBub25FbXB0eURhdGFDb3VudCA9IDA7XG4gICAgICAgICAgICB2YXIgaXNBZG1pbiA9IHB5ZGlvLnVzZXIuaXNBZG1pbjtcblxuICAgICAgICAgICAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChtZXRhLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZG9ubHkgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gbWV0YS5sYWJlbDtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IG1ldGEudHlwZTtcbiAgICAgICAgICAgICAgICB2YXIgd3JpdGVTdWJqZWN0ID0gbWV0YS53cml0ZVN1YmplY3Q7XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRTdWJqZWN0ID0gbWV0YS5yZWFkU3ViamVjdDtcblxuICAgICAgICAgICAgICAgIGlmIChyZWFkU3ViamVjdCA9PT0gJ3Byb2ZpbGU6YWRtaW4nICYmICFpc0FkbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHdyaXRlU3ViamVjdCA9PT0gJ3Byb2ZpbGU6YWRtaW4nICYmICFpc0FkbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtZXRhZGF0YS5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlTWV0YS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHVwZGF0ZU1ldGEuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZWFsVmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmIChfdGhpczExLnByb3BzLmVkaXRNb2RlICYmICFyZWFkb25seSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUHJvcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0NoZWNrZWQ6IF90aGlzMTEuc3RhdGUuaXNDaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiBvblZhbHVlQ2hhbmdlKG5hbWUsIHZhbHVlLCBzdWJtaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMxMS51cGRhdGVWYWx1ZShuYW1lLCB2YWx1ZSwgc3VibWl0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdGFyc19yYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTdGFyc0Zvcm1QYW5lbCwgYmFzZVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2hvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxTZWxlY3RvckZpbHRlcihiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjc3NfbGFiZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlbmRlcmVyLmZvcm1QYW5lbENzc0xhYmVscyhiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd0YWdzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxUYWdzKGJhc2VQcm9wcywgY29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHJlYWRvbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IHR5cGUgPT09ICd0ZXh0YXJlYScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxMS51cGRhdGVWYWx1ZShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMxMS5wcm9wcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiLCBrZXk6IGtleSwgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgdmFsdWU6IGtleSwgbGFiZWw6IGxhYmVsLCBvbkNoZWNrOiBfdGhpczExLm9uQ2hlY2suYmluZChfdGhpczExKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczExLnN0YXRlWydmaWVsZHMnXVtrZXldICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJpbmZvUGFuZWxSb3dcIiwga2V5OiBrZXkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsTGFiZWwnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29sdW1uID0geyBuYW1lOiBrZXkgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdGFyc19yYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU3RhcnNSZW5kZXJlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY3NzX2xhYmVsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChDU1NMYWJlbHNGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2VsZWN0b3JGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRhZ3NDbG91ZCwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhbFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub25FbXB0eURhdGFDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiaW5mb1BhbmVsUm93XCIgKyAoIXJlYWxWYWx1ZSA/ICcgbm8tdmFsdWUnIDogJycpLCBrZXk6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxMYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuZWRpdE1vZGUgJiYgIW5vbkVtcHR5RGF0YUNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMjMpJywgcGFkZGluZ0JvdHRvbTogMTAgfSwgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5vblJlcXVlc3RFZGl0TW9kZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjExJ11cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsZWdlbmQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2VtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NbJ21ldGEudXNlci4xMiddXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjEzJ11cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBvdmVyZmxvd1k6ICdzY3JvbGwnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kLFxuICAgICAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVc2VyTWV0YVBhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBJbmZvUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKEluZm9QYW5lbCwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gSW5mb1BhbmVsKHByb3BzKSB7XG4gICAgICAgIHZhciBfdGhpczEyID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5mb1BhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihJbmZvUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IGVkaXRNb2RlOiBmYWxzZSB9O1xuICAgICAgICB0aGlzLl9ub2RlT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMxMi5yZWZzLnBhbmVsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMxMi5yZWZzLnBhbmVsLnJlc2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMxMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgLy90aGlzLnNldFN0YXRlKHtlZGl0TW9kZTogZmFsc2V9LCAoKT0+e3RoaXMuZm9yY2VVcGRhdGUoKX0pO1xuICAgICAgICB9O1xuICAgICAgICBpZiAocHJvcHMubm9kZSkge1xuICAgICAgICAgICAgcHJvcHMubm9kZS5vYnNlcnZlKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhJbmZvUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ29wZW5FZGl0TW9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuRWRpdE1vZGUoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc2V0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICAgICAgdGhpcy5yZWZzLnBhbmVsLnJlc2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5ub2RlLnN0b3BPYnNlcnZpbmcoJ25vZGVfcmVwbGFjZWQnLCB0aGlzLl9ub2RlT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5ld1Byb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSAmJiB0aGlzLnJlZnMucGFuZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgbmV3UHJvcHMubm9kZS5vYnNlcnZlKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5ub2RlLnN0b3BPYnNlcnZpbmcoJ25vZGVfcmVwbGFjZWQnLCB0aGlzLl9ub2RlT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzYXZlTWV0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlTWV0YSgpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLnJlZnMucGFuZWwuZ2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgcmV0dXJuIFJlbmRlcmVyLmdldENsaWVudCgpLnNhdmVNZXRhKHRoaXMucHJvcHMucHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldFNlbGVjdGVkTm9kZXMoKSwgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2F2ZUFuZENsb3NlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNhdmVBbmRDbG9zZSgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczEzID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5zYXZlTWV0YSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMTMucmVzZXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkNoYW5nZVVwZGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25DaGFuZ2VVcGRhdGVEYXRhKHVwZGF0ZURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1cGRhdGVEYXRhOiB1cGRhdGVEYXRhIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcblxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMuc3RhdGUudXBkYXRlRGF0YSB8fCBuZXcgTWFwKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnY2FuY2VsJyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHZhbHVlcy5zaXplID8gTWVzc2FnZUhhc2hbJzU0J10gOiBNZXNzYWdlSGFzaFsnODYnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxNC5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuaGFzKCdub2RlX3JlYWRvbmx5JykgJiYgdmFsdWVzLnNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6ICdlZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnN0YXRlLmVkaXRNb2RlID8gTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xNSddIDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xNCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQuc2F2ZUFuZENsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2VkaXQnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5zdGF0ZS5lZGl0TW9kZSA/IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTUnXSA6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTQnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxNC5vcGVuRWRpdE1vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllcjogXCJtZXRhLXVzZXJcIixcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMSddLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBhY3Rpb25zLmxlbmd0aCA/IGFjdGlvbnMgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAndGFnLW11bHRpcGxlJywgaWNvbkNvbG9yOiAnIzAwQUNDMSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJNZXRhUGFuZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICBub2RlOiB0aGlzLnByb3BzLm5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGVkaXRNb2RlOiB0aGlzLnN0YXRlLmVkaXRNb2RlLFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RFZGl0TW9kZTogdGhpcy5vcGVuRWRpdE1vZGUuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlVXBkYXRlRGF0YTogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQub25DaGFuZ2VVcGRhdGVEYXRhKGQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhdXRvU2F2ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxNC5zYXZlTWV0YSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQucmVmcy5wYW5lbC5yZXNldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbmV4cG9ydHMuSW5mb1BhbmVsID0gSW5mb1BhbmVsO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLlVzZXJNZXRhRGlhbG9nID0gVXNlck1ldGFEaWFsb2c7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcblxuZXhwb3J0cy5SZW5kZXJlciA9IF9jb21wb25lbnRzLlJlbmRlcmVyO1xuZXhwb3J0cy5JbmZvUGFuZWwgPSBfY29tcG9uZW50cy5JbmZvUGFuZWw7XG5leHBvcnRzLkNhbGxiYWNrcyA9IF9jb21wb25lbnRzLkNhbGxiYWNrcztcbmV4cG9ydHMuVXNlck1ldGFEaWFsb2cgPSBfY29tcG9uZW50cy5Vc2VyTWV0YURpYWxvZztcbiJdfQ==
