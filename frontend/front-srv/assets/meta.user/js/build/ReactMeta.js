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
exports.UserMetaPanel = UserMetaPanel;

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
exports.UserMetaPanel = _components.UserMetaPanel;

},{"./components":2}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9NZXRhQ2xpZW50LmpzIiwianMvYnVpbGQvY29tcG9uZW50cy5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvTW9kZWxOb2RlID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvbm9kZScpO1xuXG52YXIgX3B5ZGlvTW9kZWxOb2RlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxOb2RlKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgTWV0YUNsaWVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWV0YUNsaWVudCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1ldGFDbGllbnQpO1xuXG4gICAgICAgIHRoaXMuY2xpZW50ID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBtZXRhcyB0byBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gbm9kZXMgW3tOb2RlfV1cbiAgICAgKiBAcGFyYW0gdmFsdWVzIHtPYmplY3R9XG4gICAgICovXG5cbiAgICBfY3JlYXRlQ2xhc3MoTWV0YUNsaWVudCwgW3tcbiAgICAgICAga2V5OiAnc2F2ZU1ldGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZU1ldGEobm9kZXMsIHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkodGhpcy5jbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5sb2FkQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21zID0gW107XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuSWRtVXBkYXRlVXNlck1ldGFSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk1ldGFEYXRhcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5PcGVyYXRpb24gPSAnUFVUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY0RhdGEsIGNOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzKGNOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXRhID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLklkbVVzZXJNZXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Ob2RlVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJ1dWlkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGEuTmFtZXNwYWNlID0gY05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Kc29uVmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZXMuZ2V0KGNOYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Qb2xpY2llcyA9IFtfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbjogJ1JFQUQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdWJqZWN0OiAnKicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ2FsbG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbjogJ1dSSVRFJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ViamVjdDogJyonLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFZmZlY3Q6ICdhbGxvdydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5NZXRhRGF0YXMucHVzaChtZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KGNOYW1lLCB2YWx1ZXMuZ2V0KGNOYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2goYXBpLnVwZGF0ZVVzZXJNZXRhKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLm5vdGlmeSgnbm9kZV9yZXBsYWNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckNvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJDb25maWdzKCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdzID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlPE1hcD59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZENvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZENvbmZpZ3MoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlncykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5jb25maWdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb21pc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZnMgPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlnTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVXNlck1ldGFTZXJ2aWNlQXBpKF90aGlzMi5jbGllbnQpO1xuICAgICAgICAgICAgICAgIGFwaS5saXN0VXNlck1ldGFOYW1lc3BhY2UoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lk5hbWVzcGFjZXMubWFwKGZ1bmN0aW9uIChucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBucy5OYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbnMuTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhhYmxlOiBucy5JbmRleGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IG5zLk9yZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnMuSnNvbkRlZmluaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgakRlZiA9IEpTT04ucGFyc2UobnMuSnNvbkRlZmluaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqRGVmKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2Vba10gPSBqRGVmW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5zLlBvbGljaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnMuUG9saWNpZXMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwLkFjdGlvbiA9PT0gJ1JFQUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlWydyZWFkU3ViamVjdCddID0gcC5TdWJqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHAuQWN0aW9uID09PSAnV1JJVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlWyd3cml0ZVN1YmplY3QnXSA9IHAuU3ViamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmc1tuYW1lXSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyQ29uZmlncyA9IE9iamVjdC5lbnRyaWVzKGRlZnMpLm1hcChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5WzFdLm5zID0gZW50cnlbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50cnlbMV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhcnJDb25maWdzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmRlckEgPSBhLm9yZGVyIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JkZXJCID0gYi5vcmRlciB8fCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyQSA+IG9yZGVyQiA/IDEgOiBvcmRlckEgPT09IG9yZGVyQiA/IDAgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFyckNvbmZpZ3MubWFwKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB2YWx1ZS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnY2hvaWNlJyAmJiB2YWx1ZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZGF0YS5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uIChrZXlMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5TGFiZWwuc3BsaXQoXCJ8XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnNldChwYXJ0c1swXSwgcGFydHNbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZGF0YSA9IHZhbHVlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnTWFwLnNldCh2YWx1ZS5ucywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLmNvbmZpZ3MgPSBjb25maWdNYXA7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY29uZmlnTWFwKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgTWFwKCkpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gbmFtZXNwYWNlIFN0cmluZ1xuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEFycmF5Pn1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsaXN0VGFncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0VGFncyhuYW1lc3BhY2UpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblxuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVXNlck1ldGFTZXJ2aWNlQXBpKF90aGlzMy5jbGllbnQpO1xuICAgICAgICAgICAgICAgIGFwaS5saXN0VXNlck1ldGFUYWdzKG5hbWVzcGFjZSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLlRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UuVGFncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5hbWVzcGFjZSBzdHJpbmdcbiAgICAgICAgICogQHBhcmFtIG5ld1RhZyBzdHJpbmdcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjcmVhdGVUYWcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlVGFnKG5hbWVzcGFjZSwgbmV3VGFnKSB7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVXNlck1ldGFTZXJ2aWNlQXBpKHRoaXMuY2xpZW50KTtcbiAgICAgICAgICAgIHJldHVybiBhcGkucHV0VXNlck1ldGFUYWcobmFtZXNwYWNlLCBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0UHV0VXNlck1ldGFUYWdSZXF1ZXN0LmNvbnN0cnVjdEZyb21PYmplY3Qoe1xuICAgICAgICAgICAgICAgIE5hbWVzcGFjZTogbmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgIFRhZzogbmV3VGFnXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTWV0YUNsaWVudDtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1ldGFDbGllbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE5IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDMsIF94NCwgX3g1KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MywgcHJvcGVydHkgPSBfeDQsIHJlY2VpdmVyID0gX3g1OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MyA9IHBhcmVudDsgX3g0ID0gcHJvcGVydHk7IF94NSA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycjJbaV0gPSBhcnJbaV07IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfTWV0YUNsaWVudCA9IHJlcXVpcmUoJy4vTWV0YUNsaWVudCcpO1xuXG52YXIgX01ldGFDbGllbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTWV0YUNsaWVudCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoJ2NvbG9yJyk7XG5cbnZhciBfY29sb3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29sb3IpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblNlbGVjdEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU2VsZWN0RmllbGQ7XG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xudmFyIE1vZGVyblN0eWxlcyA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblN0eWxlcztcblxudmFyIGNvbG9yc0NhY2hlID0ge307XG5cbmZ1bmN0aW9uIGNvbG9yc0Zyb21TdHJpbmcocykge1xuICAgIGlmIChzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGlmIChjb2xvcnNDYWNoZVtzXSkge1xuICAgICAgICByZXR1cm4gY29sb3JzQ2FjaGVbc107XG4gICAgfVxuICAgIHZhciBoYXNoID0gMCxcbiAgICAgICAgaSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY2hyID0gdW5kZWZpbmVkLFxuICAgICAgICBsZW4gPSB1bmRlZmluZWQ7XG4gICAgZm9yIChpID0gMCwgbGVuID0gcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjaHIgPSBzLmNoYXJDb2RlQXQoaSkgKiAxMDAwO1xuICAgICAgICBoYXNoID0gKGhhc2ggPDwgNSkgLSBoYXNoICsgY2hyO1xuICAgICAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICAgIH1cbiAgICB2YXIgYyA9IChoYXNoICYgMHgwMEZGRkZGRikudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gICAgdmFyIGhleCA9IFwiMDAwMDBcIi5zdWJzdHJpbmcoMCwgNiAtIGMubGVuZ3RoKSArIGM7XG4gICAgdmFyIGNvbG9yID0gbmV3IF9jb2xvcjJbJ2RlZmF1bHQnXSgnIycgKyBoZXgpLmhzbCgpO1xuICAgIHZhciBodWUgPSBjb2xvci5odWUoKTtcbiAgICB2YXIgYmcgPSBuZXcgX2NvbG9yMlsnZGVmYXVsdCddKHsgaDogaHVlLCBzOiBjb2xvci5zYXR1cmF0aW9ubCgpLCBsOiA5MCB9KTtcbiAgICB2YXIgZmcgPSBuZXcgX2NvbG9yMlsnZGVmYXVsdCddKHsgaDogaHVlLCBzOiBjb2xvci5zYXR1cmF0aW9ubCgpLCBsOiA0MCB9KTtcbiAgICB2YXIgcmVzdWx0ID0geyBjb2xvcjogZmcuc3RyaW5nKCksIGJhY2tncm91bmRDb2xvcjogYmcuc3RyaW5nKCkgfTtcbiAgICBjb2xvcnNDYWNoZVtzXSA9IHJlc3VsdDtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgUmVuZGVyZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlbmRlcmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVuZGVyZXIpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhSZW5kZXJlciwgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnZ2V0TWV0YWRhdGFDb25maWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1ldGFkYXRhQ29uZmlncygpIHtcbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJlci5nZXRDbGllbnQoKS5sb2FkQ29uZmlncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm4ge01ldGFDbGllbnR9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0Q2xpZW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENsaWVudCgpIHtcbiAgICAgICAgICAgIGlmICghUmVuZGVyZXIuQ2xpZW50KSB7XG4gICAgICAgICAgICAgICAgUmVuZGVyZXIuQ2xpZW50ID0gbmV3IF9NZXRhQ2xpZW50MlsnZGVmYXVsdCddKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVuZGVyZXIuQ2xpZW50O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJTdGFycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJTdGFycyhub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU3RhcnNSZW5kZXJlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiwgc2l6ZTogJ3NtYWxsJyB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyU2VsZWN0b3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyU2VsZWN0b3Iobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2VsZWN0b3JGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlckNTU0xhYmVsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlckNTU0xhYmVsKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KENTU0xhYmVsc0ZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyVGFnc0Nsb3VkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlclRhZ3NDbG91ZChub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0YWdTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjRTFCRUU3JyxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICczcHggMTBweCAxMHB4IDNweCcsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMTdweCcsXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzAgMTBweCAwIDVweCcsXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjOUMyN0IwJyxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA1MDAsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiA2XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSk7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICF2YWx1ZS5zcGxpdCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWUuc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgdGFnU3R5bGUsIGNvbG9yc0Zyb21TdHJpbmcodGFnKSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxTdGFycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxTdGFycyhwcm9wcykge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFN0YXJzRm9ybVBhbmVsLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbENzc0xhYmVscycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxDc3NMYWJlbHMocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IE9iamVjdC5rZXlzKENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTKS5tYXAoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTW2lkXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IGlkLCBwcmltYXJ5VGV4dDogbGFiZWwubGFiZWwgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTZWxlY3RvckZvcm1QYW5lbCwgX2V4dGVuZHMoe30sIHByb3BzLCB7IG1lbnVJdGVtczogbWVudUl0ZW1zIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXIocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zTG9hZGVyID0gZnVuY3Rpb24gaXRlbXNMb2FkZXIoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChtZXRhQ29uZmlncykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZmlncyA9IG1ldGFDb25maWdzLmdldChwcm9wcy5maWVsZG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWdzICYmIGNvbmZpZ3MuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlncy5kYXRhLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobWVudUl0ZW1zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU2VsZWN0b3JGb3JtUGFuZWwsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBtZW51SXRlbXM6IFtdLCBpdGVtc0xvYWRlcjogaXRlbXNMb2FkZXIgfSkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFRhZ3MocHJvcHMpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUYWdzQ2xvdWQsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBlZGl0TW9kZTogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVuZGVyZXI7XG59KSgpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2VkaXRNZXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRNZXRhKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1JlYWN0TWV0YScsICdVc2VyTWV0YURpYWxvZycsIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dUaXRsZUlkOiA0ODksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiBweWRpby5nZXRVc2VyU2VsZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBNZXRhRmllbGRGb3JtUGFuZWxNaXhpbiA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsYWJlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGZpZWxkbmFtZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgY29uZmlnczogbmV3IE1hcCgpIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGMgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZTogZnVuY3Rpb24gdXBkYXRlVmFsdWUodmFsdWUpIHtcbiAgICAgICAgdmFyIHN1Ym1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICAgICAgICAgIG9iamVjdFsnYWp4cF9tZXRhXycgKyB0aGlzLnByb3BzLmZpZWxkbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uob2JqZWN0LCBzdWJtaXQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMub25WYWx1ZUNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbHVlQ2hhbmdlKHRoaXMucHJvcHMuZmllbGRuYW1lLCB2YWx1ZSwgc3VibWl0KTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcblxudmFyIE1ldGFGaWVsZFJlbmRlcmVyTWl4aW4gPSB7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbm9kZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKEFqeHBOb2RlKSxcbiAgICAgICAgY29sdW1uOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdFxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIHx8IDAsXG4gICAgICAgICAgICBjb25maWdzOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjb25maWdzKSB7XG4gICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBjb25maWdzOiBjb25maWdzIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0UmVhbFZhbHVlOiBmdW5jdGlvbiBnZXRSZWFsVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQodGhpcy5wcm9wcy5jb2x1bW4ubmFtZSk7XG4gICAgfVxuXG59O1xuXG52YXIgc3RhcnNTdHlsZSA9IHsgZm9udFNpemU6IDIwLCBjb2xvcjogJyNGQkMwMkQnLCBtYXJnaW5Ub3A6IDYsIG1hcmdpbkJvdHRvbTogNiB9O1xuXG52YXIgU3RhcnNGb3JtUGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU3RhcnNGb3JtUGFuZWwnLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIHx8IDAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIHZhciBzdGFycyA9IFstMSwgMCwgMSwgMiwgMywgNF0ubWFwKChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBpYyA9ICdzdGFyJyArICh2ID09PSAtMSA/ICctb2ZmJyA6IHZhbHVlID4gdiA/ICcnIDogJy1vdXRsaW5lJyk7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSB2ID09PSAtMSA/IHsgbWFyZ2luUmlnaHQ6IDUsIGN1cnNvcjogJ3BvaW50ZXInIH0gOiB7IGN1cnNvcjogJ3BvaW50ZXInIH07XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogXCJzdGFyLVwiICsgdiwgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLnVwZGF0ZVZhbHVlKHYgKyAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9LCBjbGFzc05hbWU6IFwibWRpIG1kaS1cIiArIGljLCBzdHlsZTogc3R5bGUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnYWR2YW5jZWQtc2VhcmNoLXN0YXJzJywgc3R5bGU6IF9leHRlbmRzKHt9LCBNb2Rlcm5TdHlsZXMuZGl2LCBzdGFyc1N0eWxlKSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBzdGFyc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBNZXRhU3RhcnNSZW5kZXJlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdNZXRhU3RhcnNSZW5kZXJlcicsXG5cbiAgICBtaXhpbnM6IFtNZXRhRmllbGRSZW5kZXJlck1peGluXSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFJlYWxWYWx1ZSgpIHx8IDA7XG4gICAgICAgIHZhciBzdGFycyA9IFswLCAxLCAyLCAzLCA0XS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiBcInN0YXItXCIgKyB2LCBjbGFzc05hbWU6IFwibWRpIG1kaS1zdGFyXCIgKyAodmFsdWUgPiB2ID8gJycgOiAnLW91dGxpbmUnKSB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBzdHlsZSA9IHRoaXMucHJvcHMuc2l6ZSA9PT0gJ3NtYWxsJyA/IHsgY29sb3I6IHN0YXJzU3R5bGUuY29sb3IgfSA6IHN0YXJzU3R5bGU7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlIH0sXG4gICAgICAgICAgICBzdGFyc1xuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBTZWxlY3RvckZpbHRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTZWxlY3RvckZpbHRlcicsXG5cbiAgICBtaXhpbnM6IFtNZXRhRmllbGRSZW5kZXJlck1peGluXSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMuc3RhdGUuY29uZmlncztcblxuICAgICAgICB2YXIgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBkaXNwbGF5VmFsdWUgPSB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIHZhciBmaWVsZENvbmZpZyA9IGNvbmZpZ3MuZ2V0KHRoaXMucHJvcHMuY29sdW1uLm5hbWUpO1xuICAgICAgICBpZiAoZmllbGRDb25maWcgJiYgZmllbGRDb25maWcuZGF0YSkge1xuICAgICAgICAgICAgZGlzcGxheVZhbHVlID0gZmllbGRDb25maWcuZGF0YS5nZXQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBkaXNwbGF5VmFsdWVcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgQ1NTTGFiZWxzRmlsdGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0NTU0xhYmVsc0ZpbHRlcicsXG5cbiAgICBtaXhpbnM6IFtNZXRhRmllbGRSZW5kZXJlck1peGluXSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgQ1NTX0xBQkVMUzoge1xuICAgICAgICAgICAgJ2xvdyc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNCddLCBzb3J0VmFsdWU6ICc1JywgY29sb3I6ICcjNjZjJyB9LFxuICAgICAgICAgICAgJ3RvZG8nOiB7IGxhYmVsOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjUnXSwgc29ydFZhbHVlOiAnNCcsIGNvbG9yOiAnIzY5YycgfSxcbiAgICAgICAgICAgICdwZXJzb25hbCc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNiddLCBzb3J0VmFsdWU6ICczJywgY29sb3I6ICcjNmM2JyB9LFxuICAgICAgICAgICAgJ3dvcmsnOiB7IGxhYmVsOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjcnXSwgc29ydFZhbHVlOiAnMicsIGNvbG9yOiAnI2M5NicgfSxcbiAgICAgICAgICAgICdpbXBvcnRhbnQnOiB7IGxhYmVsOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjgnXSwgc29ydFZhbHVlOiAnMScsIGNvbG9yOiAnI2M2NicgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFJlYWxWYWx1ZSgpO1xuICAgICAgICB2YXIgZGF0YSA9IENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTO1xuICAgICAgICBpZiAodmFsdWUgJiYgZGF0YVt2YWx1ZV0pIHtcbiAgICAgICAgICAgIHZhciBkViA9IGRhdGFbdmFsdWVdO1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWxhYmVsJywgc3R5bGU6IHsgY29sb3I6IGRWLmNvbG9yIH0gfSksXG4gICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgIGRWLmxhYmVsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcblxudmFyIE1ldGFTZWxlY3RvckZvcm1QYW5lbCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdNZXRhU2VsZWN0b3JGb3JtUGFuZWwnLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgY2hhbmdlU2VsZWN0b3I6IGZ1bmN0aW9uIGNoYW5nZVNlbGVjdG9yKGUsIHNlbGVjdGVkSW5kZXgsIHBheWxvYWQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVWYWx1ZShwYXlsb2FkLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5pdGVtc0xvYWRlcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5pdGVtc0xvYWRlcihmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyBtZW51SXRlbXM6IGl0ZW1zIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgaSA9IDE7XG4gICAgICAgIHZhciBtZW51SXRlbXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm1lbnVJdGVtcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtZW51SXRlbXMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMucHJvcHMubWVudUl0ZW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW51SXRlbXMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuc3RhdGUubWVudUl0ZW1zKSk7XG4gICAgICAgIH1cbiAgICAgICAgbWVudUl0ZW1zLnVuc2hpZnQoX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6ICcnLCBwcmltYXJ5VGV4dDogJycgfSkpO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBNb2Rlcm5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScgfSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiB0aGlzLnByb3BzLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VTZWxlY3RvciB9LFxuICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBUYWdzQ2xvdWQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVGFnc0Nsb3VkJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZEZvcm1QYW5lbE1peGluXSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBub2RlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpLFxuICAgICAgICBjb2x1bW46IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB2YXIgbm9kZSA9IG5leHRQcm9wcy5ub2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBuZXh0UHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBjb2x1bW4gPSBuZXh0UHJvcHMuY29sdW1uO1xuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhZ3M6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5leHRQcm9wcy5lZGl0TW9kZSAmJiAhdGhpcy5zdGF0ZS5sb2FkZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFJlYWxWYWx1ZTogZnVuY3Rpb24gZ2V0UmVhbFZhbHVlKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzLnZhbHVlO1xuICAgICAgICB2YXIgY29sdW1uID0gX3Byb3BzLmNvbHVtbjtcblxuICAgICAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9wcm9wczIudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YVNvdXJjZTogW10sXG4gICAgICAgICAgICB0YWdzOiBub2RlID8gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKSA6IHZhbHVlLFxuICAgICAgICAgICAgc2VhcmNoVGV4dDogJydcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VnZ2VzdGlvbkxvYWRlcjogZnVuY3Rpb24gc3VnZ2VzdGlvbkxvYWRlcihjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdGhpcy5zdGF0ZS5sb2FkaW5nICsgMSB9KTtcblxuICAgICAgICBSZW5kZXJlci5nZXRDbGllbnQoKS5saXN0VGFncyh0aGlzLnByb3BzLmZpZWxkbmFtZSB8fCB0aGlzLnByb3BzLmNvbHVtbi5uYW1lKS50aGVuKGZ1bmN0aW9uICh0YWdzKSB7XG4gICAgICAgICAgICBfdGhpczUuc2V0U3RhdGUoeyBsb2FkaW5nOiBfdGhpczUuc3RhdGUubG9hZGluZyAtIDEgfSk7XG4gICAgICAgICAgICBjYWxsYmFjayh0YWdzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25Mb2FkZXIoKGZ1bmN0aW9uICh0YWdzKSB7XG4gICAgICAgICAgICB2YXIgY3J0VmFsdWVGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHRhZ3MubWFwKChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0YWcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb21wb25lbnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGF0YVNvdXJjZTogdmFsdWVzLCBsb2FkaW5nOiBmYWxzZSwgbG9hZGVkOiB0cnVlIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlUmVxdWVzdERlbGV0ZTogZnVuY3Rpb24gaGFuZGxlUmVxdWVzdERlbGV0ZSh0YWcpIHtcbiAgICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoJywnKTtcbiAgICAgICAgdmFyIGluZGV4ID0gdGFncy5pbmRleE9mKHRhZyk7XG4gICAgICAgIHRhZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YWdzOiB0YWdzLnRvU3RyaW5nKCkgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM2LnVwZGF0ZVZhbHVlKF90aGlzNi5zdGF0ZS50YWdzLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZVVwZGF0ZUlucHV0OiBmdW5jdGlvbiBoYW5kbGVVcGRhdGVJbnB1dChzZWFyY2hUZXh0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0IH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVOZXdSZXF1ZXN0OiBmdW5jdGlvbiBoYW5kbGVOZXdSZXF1ZXN0KCkge1xuICAgICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0YWdzID0gW107XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRhZ3MgJiYgdGhpcy5zdGF0ZS50YWdzLnNwbGl0KSB7XG4gICAgICAgICAgICB0YWdzID0gdGhpcy5zdGF0ZS50YWdzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGFncy5wdXNoKHRoaXMuc3RhdGUuc2VhcmNoVGV4dCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGFnczogdGFncy50b1N0cmluZygpIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNy51cGRhdGVWYWx1ZShfdGhpczcuc3RhdGUudGFncywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXJDaGlwOiBmdW5jdGlvbiByZW5kZXJDaGlwKHRhZykge1xuICAgICAgICB2YXIgX2NvbG9yc0Zyb21TdHJpbmcgPSBjb2xvcnNGcm9tU3RyaW5nKHRhZyk7XG5cbiAgICAgICAgdmFyIGNvbG9yID0gX2NvbG9yc0Zyb21TdHJpbmcuY29sb3I7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kQ29sb3IgPSBfY29sb3JzRnJvbVN0cmluZy5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICAgICAgdmFyIGNoaXBTdHlsZSA9IHsgbWFyZ2luOiAyLCBib3JkZXJSYWRpdXM6ICc0cHggMTZweCAxNnB4IDRweCcgfTtcbiAgICAgICAgdmFyIGxhYmVsU3R5bGUgPSB7IGNvbG9yOiBjb2xvciwgZm9udFdlaWdodDogNTAwLCBwYWRkaW5nTGVmdDogMTAsIHBhZGRpbmdSaWdodDogMTYgfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5DaGlwLFxuICAgICAgICAgICAgICAgIHsga2V5OiB0YWcsIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZENvbG9yLCBsYWJlbFN0eWxlOiBsYWJlbFN0eWxlLCBzdHlsZTogY2hpcFN0eWxlLCBvblJlcXVlc3REZWxldGU6IHRoaXMuaGFuZGxlUmVxdWVzdERlbGV0ZS5iaW5kKHRoaXMsIHRhZykgfSxcbiAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2hpcCxcbiAgICAgICAgICAgICAgICB7IGtleTogdGFnLCBiYWNrZ3JvdW5kQ29sb3I6IGJhY2tncm91bmRDb2xvciwgbGFiZWxTdHlsZTogbGFiZWxTdHlsZSwgc3R5bGU6IGNoaXBTdHlsZSB9LFxuICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzOCA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHRhZ3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRhZ3MgJiYgdGhpcy5zdGF0ZS50YWdzLnNwbGl0KSB7XG4gICAgICAgICAgICB0YWdzID0gdGhpcy5zdGF0ZS50YWdzLnNwbGl0KFwiLFwiKS5tYXAoKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgICAgICAgICB0YWcgPSBMYW5nVXRpbHMudHJpbSh0YWcsICcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKCF0YWcpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlckNoaXAodGFnKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFncyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXV0b0NvbXBsZXRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5BdXRvQ29tcGxldGUsIF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgaGludFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTAnXSxcbiAgICAgICAgICAgICAgICBzZWFyY2hUZXh0OiB0aGlzLnN0YXRlLnNlYXJjaFRleHQsXG4gICAgICAgICAgICAgICAgb25VcGRhdGVJbnB1dDogdGhpcy5oYW5kbGVVcGRhdGVJbnB1dCxcbiAgICAgICAgICAgICAgICBvbk5ld1JlcXVlc3Q6IHRoaXMuaGFuZGxlTmV3UmVxdWVzdCxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiB0aGlzLnN0YXRlLmRhdGFTb3VyY2UsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoc2VhcmNoVGV4dCwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKSkgPT09IDA7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvcGVuT25Gb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZW51UHJvcHM6IHsgbWF4SGVpZ2h0OiAyMDAgfSxcbiAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW5Cb3R0b206IC04IH0sXG4gICAgICAgICAgICAgICAgb25DbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXM4LnN0YXRlLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzOC5oYW5kbGVOZXdSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBNb2Rlcm5TdHlsZXMudGV4dEZpZWxkKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcgfSB9LFxuICAgICAgICAgICAgICAgIHRhZ3NcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIFVzZXJNZXRhRGlhbG9nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1VzZXJNZXRhRGlhbG9nJyxcblxuICAgIHByb3BzVHlwZXM6IHtcbiAgICAgICAgc2VsZWN0aW9uOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoUHlkaW9EYXRhTW9kZWwpXG4gICAgfSxcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHNhdmVNZXRhOiBmdW5jdGlvbiBzYXZlTWV0YSgpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMucmVmcy5wYW5lbC5nZXRVcGRhdGVEYXRhKCk7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgIHBhcmFtc1trXSA9IHY7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUmVuZGVyZXIuZ2V0Q2xpZW50KCkuc2F2ZU1ldGEodGhpcy5wcm9wcy5zZWxlY3Rpb24uZ2V0U2VsZWN0ZWROb2RlcygpLCB2YWx1ZXMpO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzOSA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zYXZlTWV0YSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM5LmRpc21pc3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJNZXRhUGFuZWwsIHtcbiAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgbXVsdGlwbGU6ICF0aGlzLnByb3BzLnNlbGVjdGlvbi5pc1VuaXF1ZSgpLFxuICAgICAgICAgICAgcmVmOiAncGFuZWwnLFxuICAgICAgICAgICAgbm9kZTogdGhpcy5wcm9wcy5zZWxlY3Rpb24uaXNVbmlxdWUoKSA/IHRoaXMucHJvcHMuc2VsZWN0aW9uLmdldFVuaXF1ZU5vZGUoKSA6IG5ldyBBanhwTm9kZSgpLFxuICAgICAgICAgICAgZWRpdE1vZGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbnZhciBVc2VyTWV0YVBhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVzZXJNZXRhUGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVXNlck1ldGFQYW5lbChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXNlck1ldGFQYW5lbCk7XG5cbiAgICAgICAgaWYgKHByb3BzLmVkaXRNb2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHByb3BzLmVkaXRNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXNlck1ldGFQYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHVwZGF0ZU1ldGE6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGlzQ2hlY2tlZDogZmFsc2UsXG4gICAgICAgICAgICBmaWVsZHM6IFtdLFxuICAgICAgICAgICAgY29uZmlnczogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFVzZXJNZXRhUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTAgPSB0aGlzO1xuXG4gICAgICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjb25maWdzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMxMC5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGNvbmZpZ3MgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlVmFsdWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlVmFsdWUobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzdWJtaXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcblxuICAgICAgICAgICAgdGhpcy5zdGF0ZS51cGRhdGVNZXRhLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cGRhdGVNZXRhOiB0aGlzLnN0YXRlLnVwZGF0ZU1ldGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VVcGRhdGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZVVwZGF0ZURhdGEodGhpcy5zdGF0ZS51cGRhdGVNZXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdWJtaXQgJiYgdGhpcy5wcm9wcy5hdXRvU2F2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYXV0b1NhdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVsZXRlVmFsdWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlVmFsdWUobmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS51cGRhdGVNZXRhWydkZWxldGUnXShuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU1ldGE6IHRoaXMuc3RhdGUudXBkYXRlTWV0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZVVwZGF0ZURhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlVXBkYXRlRGF0YSh0aGlzLnN0YXRlLnVwZGF0ZU1ldGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRVcGRhdGVEYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFVwZGF0ZURhdGEoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS51cGRhdGVNZXRhO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXNldFVwZGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXRVcGRhdGVEYXRhKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBkYXRlTWV0YTogbmV3IE1hcCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlVXBkYXRlRGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VVcGRhdGVEYXRhKG5ldyBNYXAoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uQ2hlY2snLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25DaGVjayhlLCBpc0lucHV0Q2hlY2tlZCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBzdGF0ZVsnZmllbGRzJ11bZS50YXJnZXQudmFsdWVdID0gaXNJbnB1dENoZWNrZWQ7XG4gICAgICAgICAgICBpZiAoaXNJbnB1dENoZWNrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVWYWx1ZShlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczExID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnN0YXRlLmNvbmZpZ3M7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgICAgIHZhciBtZXRhZGF0YSA9IHRoaXMucHJvcHMubm9kZS5nZXRNZXRhZGF0YSgpO1xuICAgICAgICAgICAgdmFyIHVwZGF0ZU1ldGEgPSB0aGlzLnN0YXRlLnVwZGF0ZU1ldGE7XG4gICAgICAgICAgICB2YXIgbm9uRW1wdHlEYXRhQ291bnQgPSAwO1xuICAgICAgICAgICAgdmFyIGlzQWRtaW4gPSBweWRpby51c2VyLmlzQWRtaW47XG5cbiAgICAgICAgICAgIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAobWV0YSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRvbmx5ID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IG1ldGEubGFiZWw7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBtZXRhLnR5cGU7XG4gICAgICAgICAgICAgICAgdmFyIHdyaXRlU3ViamVjdCA9IG1ldGEud3JpdGVTdWJqZWN0O1xuICAgICAgICAgICAgICAgIHZhciByZWFkU3ViamVjdCA9IG1ldGEucmVhZFN1YmplY3Q7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVhZFN1YmplY3QgPT09ICdwcm9maWxlOmFkbWluJyAmJiAhaXNBZG1pbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh3cml0ZVN1YmplY3QgPT09ICdwcm9maWxlOmFkbWluJyAmJiAhaXNBZG1pbikge1xuICAgICAgICAgICAgICAgICAgICByZWFkb25seSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlID0gbWV0YWRhdGEuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU1ldGEuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1cGRhdGVNZXRhLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcmVhbFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMxMS5wcm9wcy5lZGl0TW9kZSAmJiAhcmVhZG9ubHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZVByb3BzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNDaGVja2VkOiBfdGhpczExLnN0YXRlLmlzQ2hlY2tlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkbmFtZToga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gb25WYWx1ZUNoYW5nZShuYW1lLCB2YWx1ZSwgc3VibWl0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMTEudXBkYXRlVmFsdWUobmFtZSwgdmFsdWUsIHN1Ym1pdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3RhcnNfcmF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU3RhcnNGb3JtUGFuZWwsIGJhc2VQcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gUmVuZGVyZXIuZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXIoYmFzZVByb3BzLCBjb25maWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY3NzX2xhYmVsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxDc3NMYWJlbHMoYmFzZVByb3BzLCBjb25maWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gUmVuZGVyZXIuZm9ybVBhbmVsVGFncyhiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiByZWFkb25seSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaW50VGV4dDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlMaW5lOiB0eXBlID09PSAndGV4dGFyZWEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTEudXBkYXRlVmFsdWUoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMTEucHJvcHMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJpbmZvUGFuZWxSb3dcIiwga2V5OiBrZXksIHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7IHZhbHVlOiBrZXksIGxhYmVsOiBsYWJlbCwgb25DaGVjazogX3RoaXMxMS5vbkNoZWNrLmJpbmQoX3RoaXMxMSkgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxMS5zdGF0ZVsnZmllbGRzJ11ba2V5XSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiaW5mb1BhbmVsUm93XCIsIGtleToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2luZm9QYW5lbExhYmVsJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2luZm9QYW5lbFZhbHVlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbHVtbiA9IHsgbmFtZToga2V5IH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3RhcnNfcmF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWV0YVN0YXJzUmVuZGVyZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nzc19sYWJlbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQ1NTTGFiZWxzRmlsdGVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjaG9pY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFNlbGVjdG9yRmlsdGVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd0YWdzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUYWdzQ2xvdWQsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWxWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9uRW1wdHlEYXRhQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiICsgKCFyZWFsVmFsdWUgPyAnIG5vLXZhbHVlJyA6ICcnKSwga2V5OiBrZXkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsTGFiZWwnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2luZm9QYW5lbFZhbHVlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIG1lc3MgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLmVkaXRNb2RlICYmICFub25FbXB0eURhdGFDb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwwLjIzKScsIHBhZGRpbmdCb3R0b206IDEwIH0sIG9uVG91Y2hUYXA6IHRoaXMucHJvcHMub25SZXF1ZXN0RWRpdE1vZGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NbJ21ldGEudXNlci4xMSddXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVnZW5kID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm11bHRpcGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnVzZXIuMTInXVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NbJ21ldGEudXNlci4xMyddXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgb3ZlcmZsb3dZOiAnc2Nyb2xsJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXNlck1ldGFQYW5lbDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgSW5mb1BhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhJbmZvUGFuZWwsIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIEluZm9QYW5lbChwcm9wcykge1xuICAgICAgICB2YXIgX3RoaXMxMiA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEluZm9QYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoSW5mb1BhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBlZGl0TW9kZTogZmFsc2UgfTtcbiAgICAgICAgdGhpcy5fbm9kZU9ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzMTIucmVmcy5wYW5lbCkge1xuICAgICAgICAgICAgICAgIF90aGlzMTIucmVmcy5wYW5lbC5yZXNldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzMTIuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgIC8vdGhpcy5zZXRTdGF0ZSh7ZWRpdE1vZGU6IGZhbHNlfSwgKCk9Pnt0aGlzLmZvcmNlVXBkYXRlKCl9KTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgIHByb3BzLm5vZGUub2JzZXJ2ZSgnbm9kZV9yZXBsYWNlZCcsIHRoaXMuX25vZGVPYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoSW5mb1BhbmVsLCBbe1xuICAgICAgICBrZXk6ICdvcGVuRWRpdE1vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkVkaXRNb2RlKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXNldCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcy5wYW5lbC5yZXNldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubm9kZS5zdG9wT2JzZXJ2aW5nKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXdQcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUgJiYgdGhpcy5yZWZzLnBhbmVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgICAgIG5ld1Byb3BzLm5vZGUub2JzZXJ2ZSgnbm9kZV9yZXBsYWNlZCcsIHRoaXMuX25vZGVPYnNlcnZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubm9kZS5zdG9wT2JzZXJ2aW5nKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2F2ZU1ldGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZU1ldGEoKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5yZWZzLnBhbmVsLmdldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJlci5nZXRDbGllbnQoKS5zYXZlTWV0YSh0aGlzLnByb3BzLnB5ZGlvLmdldENvbnRleHRIb2xkZXIoKS5nZXRTZWxlY3RlZE5vZGVzKCksIHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NhdmVBbmRDbG9zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlQW5kQ2xvc2UoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMxMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2F2ZU1ldGEoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczEzLnJlc2V0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25DaGFuZ2VVcGRhdGVEYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uQ2hhbmdlVXBkYXRlRGF0YSh1cGRhdGVEYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXBkYXRlRGF0YTogdXBkYXRlRGF0YSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczE0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBNZXNzYWdlSGFzaCA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLnN0YXRlLnVwZGF0ZURhdGEgfHwgbmV3IE1hcCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB2YWx1ZXMuc2l6ZSA/IE1lc3NhZ2VIYXNoWyc1NCddIDogTWVzc2FnZUhhc2hbJzg2J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5nZXRNZXRhZGF0YSgpLmhhcygnbm9kZV9yZWFkb25seScpICYmIHZhbHVlcy5zaXplID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAnZWRpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5zdGF0ZS5lZGl0TW9kZSA/IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTUnXSA6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczE0LnNhdmVBbmRDbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuc3RhdGUuZWRpdE1vZGUgPyBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjE1J10gOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjE0J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQub3BlbkVkaXRNb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBQeWRpb1dvcmtzcGFjZXMuSW5mb1BhbmVsQ2FyZCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZXI6IFwibWV0YS11c2VyXCIsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnbWV0YS51c2VyLjEnXSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogYWN0aW9ucy5sZW5ndGggPyBhY3Rpb25zIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ3RhZy1tdWx0aXBsZScsIGljb25Db2xvcjogJyMwMEFDQzEnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyTWV0YVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ3BhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZTogdGhpcy5wcm9wcy5ub2RlLFxuICAgICAgICAgICAgICAgICAgICBlZGl0TW9kZTogdGhpcy5zdGF0ZS5lZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0RWRpdE1vZGU6IHRoaXMub3BlbkVkaXRNb2RlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZVVwZGF0ZURhdGE6IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczE0Lm9uQ2hhbmdlVXBkYXRlRGF0YShkKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYXV0b1NhdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTQuc2F2ZU1ldGEoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczE0LnJlZnMucGFuZWwucmVzZXRVcGRhdGVEYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEluZm9QYW5lbDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5leHBvcnRzLkluZm9QYW5lbCA9IEluZm9QYW5lbDtcbmV4cG9ydHMuQ2FsbGJhY2tzID0gQ2FsbGJhY2tzO1xuZXhwb3J0cy5Vc2VyTWV0YURpYWxvZyA9IFVzZXJNZXRhRGlhbG9nO1xuZXhwb3J0cy5Vc2VyTWV0YVBhbmVsID0gVXNlck1ldGFQYW5lbDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuXG5leHBvcnRzLlJlbmRlcmVyID0gX2NvbXBvbmVudHMuUmVuZGVyZXI7XG5leHBvcnRzLkluZm9QYW5lbCA9IF9jb21wb25lbnRzLkluZm9QYW5lbDtcbmV4cG9ydHMuQ2FsbGJhY2tzID0gX2NvbXBvbmVudHMuQ2FsbGJhY2tzO1xuZXhwb3J0cy5Vc2VyTWV0YURpYWxvZyA9IF9jb21wb25lbnRzLlVzZXJNZXRhRGlhbG9nO1xuZXhwb3J0cy5Vc2VyTWV0YVBhbmVsID0gX2NvbXBvbmVudHMuVXNlck1ldGFQYW5lbDtcbiJdfQ==
