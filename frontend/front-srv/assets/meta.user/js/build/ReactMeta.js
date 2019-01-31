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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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
                height: 18,
                lineHeight: '18px',
                padding: '0 12px 0 6px',
                color: '#9C27B0',
                fontWeight: 500,
                fontSize: 12,
                marginRight: 6
            };
            var value = node.getMetadata().get(column.name);
            if (!value) return null;
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
            this.props.onValueChange(this.props.fieldname, value);
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
            var ic = 'star' + (v === -1 ? '-off' : value > v ? '' : '-outline');
            var style = v === -1 ? { marginRight: 5, cursor: 'pointer' } : { cursor: 'pointer' };
            return _react2['default'].createElement('span', { key: "star-" + v, onClick: this.updateValue.bind(this, v + 1), className: "mdi mdi-" + ic, style: style });
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
        this.updateValue(payload);
    },

    componentDidMount: function componentDidMount() {
        var _this3 = this;

        if (this.props.itemsLoader) {
            this.props.itemsLoader(function (items) {
                _this3.setState({ menuItems: items });
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
        var _this4 = this;

        this.setState({ loading: this.state.loading + 1 });

        Renderer.getClient().listTags(this.props.fieldname || this.props.column.name).then(function (tags) {
            _this4.setState({ loading: _this4.state.loading - 1 });
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
        var _this5 = this;

        var tags = this.state.tags.split(',');
        var index = tags.indexOf(tag);
        tags.splice(index, 1);
        this.setState({
            tags: tags.toString() }, function () {
            _this5.updateValue(_this5.state.tags);
        });
    },

    handleUpdateInput: function handleUpdateInput(searchText) {
        this.setState({ searchText: searchText });
    },

    handleNewRequest: function handleNewRequest() {
        var _this6 = this;

        var tags = [];
        if (this.state.tags) {
            tags = this.state.tags.split(',');
        }
        tags.push(this.state.searchText);
        this.setState({
            tags: tags.toString() }, function () {
            _this6.updateValue(_this6.state.tags);
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
        var tags = undefined;
        if (this.state.tags) {
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
                style: { marginBottom: -8 }
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

    submit: function submit() {
        var _this7 = this;

        var values = this.refs.panel.getUpdateData();
        var params = {};
        values.forEach(function (v, k) {
            params[k] = v;
        });
        Renderer.getClient().saveMeta(this.props.selection.getSelectedNodes(), values).then(function () {
            _this7.dismiss();
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
            var _this8 = this;

            Renderer.getMetadataConfigs().then(function (configs) {
                _this8.setState({ configs: configs });
            });
        }
    }, {
        key: 'updateValue',
        value: function updateValue(name, value) {
            this.state.updateMeta.set(name, value);
            this.setState({
                updateMeta: this.state.updateMeta
            });
        }
    }, {
        key: 'deleteValue',
        value: function deleteValue(name) {
            this.state.updateMeta['delete'](name);
            this.setState({
                updateMeta: this.state.updateMeta
            });
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
        }
    }, {
        key: 'onCheck',
        value: function onCheck(e, isInputChecked, value) {
            var state = this.state;
            state['fields'][e.target.value] = isInputChecked;
            if (isInputChecked == false) {
                this.deleteValue(e.target.value);
            }
            this.setState(state);
        }
    }, {
        key: 'render',
        value: function render() {
            var configs = this.state.configs;

            var data = [];
            var node = this.props.node;
            var metadata = this.props.node.getMetadata();
            var updateMeta = this.state.updateMeta;
            var nonEmptyDataCount = 0;
            var isAdmin = pydio.user.isAdmin;

            configs.forEach((function (meta, key) {
                var _this9 = this;

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

                if (this.props.editMode && !readonly) {
                    var field = undefined;
                    var baseProps = {
                        isChecked: this.state.isChecked,
                        fieldname: key,
                        label: label,
                        value: value,
                        onValueChange: this.updateValue.bind(this)
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
                            onChange: function (event, value) {
                                _this9.updateValue(key, value);
                            }
                        });
                    }
                    if (this.props.multiple) {
                        data.push(_react2['default'].createElement(
                            'div',
                            { className: "infoPanelRow", key: key, style: { marginBottom: 20 } },
                            _react2['default'].createElement(_materialUi.Checkbox, { value: key, label: label, onCheck: this.onCheck.bind(this) }),
                            this.state['fields'][key] && _react2['default'].createElement(
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
            }).bind(this));
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
        var _this10 = this;

        _classCallCheck(this, InfoPanel);

        _get(Object.getPrototypeOf(InfoPanel.prototype), 'constructor', this).call(this, props);
        this.state = { editMode: false };
        this._nodeObserver = function () {
            if (_this10.refs.panel) {
                _this10.refs.panel.resetUpdateData();
            }
            _this10.setState({ editMode: false }, function () {
                _this10.forceUpdate();
            });
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
        key: 'saveChanges',
        value: function saveChanges() {
            var _this11 = this;

            var values = this.refs.panel.getUpdateData();
            var params = {};
            values.forEach(function (v, k) {
                params[k] = v;
            });
            Renderer.getClient().saveMeta(this.props.pydio.getContextHolder().getSelectedNodes(), values).then(function () {
                _this11.reset();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this12 = this;

            var actions = [];
            var MessageHash = this.props.pydio.MessageHash;

            if (this.state.editMode) {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'cancel',
                    label: MessageHash['54'],
                    onClick: function () {
                        _this12.reset();
                    }
                }));
            }
            if (!this.props.node.getMetadata().has('node_readonly')) {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'edit',
                    label: this.state.editMode ? MessageHash['meta.user.15'] : MessageHash['meta.user.14'],
                    onClick: function () {
                        !_this12.state.editMode ? _this12.openEditMode() : _this12.saveChanges();
                    }
                }));
            }

            return _react2['default'].createElement(
                PydioWorkspaces.InfoPanelCard,
                { identifier: "meta-user", style: this.props.style, title: this.props.pydio.MessageHash['meta.user.1'], actions: actions.length ? actions : null, icon: 'tag-multiple', iconColor: '#00ACC1' },
                _react2['default'].createElement(UserMetaPanel, {
                    ref: 'panel',
                    node: this.props.node,
                    editMode: this.state.editMode,
                    onRequestEditMode: this.openEditMode.bind(this),
                    pydio: this.props.pydio
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9NZXRhQ2xpZW50LmpzIiwianMvYnVpbGQvY29tcG9uZW50cy5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvTW9kZWxOb2RlID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvbm9kZScpO1xuXG52YXIgX3B5ZGlvTW9kZWxOb2RlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxOb2RlKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgTWV0YUNsaWVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWV0YUNsaWVudCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1ldGFDbGllbnQpO1xuXG4gICAgICAgIHRoaXMuY2xpZW50ID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBtZXRhcyB0byBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gbm9kZXMgW3tOb2RlfV1cbiAgICAgKiBAcGFyYW0gdmFsdWVzIHtPYmplY3R9XG4gICAgICovXG5cbiAgICBfY3JlYXRlQ2xhc3MoTWV0YUNsaWVudCwgW3tcbiAgICAgICAga2V5OiAnc2F2ZU1ldGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZU1ldGEobm9kZXMsIHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkodGhpcy5jbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5sb2FkQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21zID0gW107XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuSWRtVXBkYXRlVXNlck1ldGFSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk1ldGFEYXRhcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5PcGVyYXRpb24gPSAnUFVUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY0RhdGEsIGNOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzKGNOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXRhID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLklkbVVzZXJNZXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Ob2RlVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJ1dWlkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGEuTmFtZXNwYWNlID0gY05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Kc29uVmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZXMuZ2V0KGNOYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Qb2xpY2llcyA9IFtfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbjogJ1JFQUQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdWJqZWN0OiAnKicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ2FsbG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbjogJ1dSSVRFJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ViamVjdDogJyonLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFZmZlY3Q6ICdhbGxvdydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5NZXRhRGF0YXMucHVzaChtZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KGNOYW1lLCB2YWx1ZXMuZ2V0KGNOYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2goYXBpLnVwZGF0ZVVzZXJNZXRhKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLm5vdGlmeSgnbm9kZV9yZXBsYWNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckNvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJDb25maWdzKCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdzID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlPE1hcD59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZENvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZENvbmZpZ3MoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlncykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5jb25maWdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb21pc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZnMgPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlnTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVXNlck1ldGFTZXJ2aWNlQXBpKF90aGlzMi5jbGllbnQpO1xuICAgICAgICAgICAgICAgIGFwaS5saXN0VXNlck1ldGFOYW1lc3BhY2UoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lk5hbWVzcGFjZXMubWFwKGZ1bmN0aW9uIChucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBucy5OYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbnMuTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhhYmxlOiBucy5JbmRleGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IG5zLk9yZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnMuSnNvbkRlZmluaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgakRlZiA9IEpTT04ucGFyc2UobnMuSnNvbkRlZmluaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqRGVmKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2Vba10gPSBqRGVmW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5zLlBvbGljaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnMuUG9saWNpZXMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwLkFjdGlvbiA9PT0gJ1JFQUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlWydyZWFkU3ViamVjdCddID0gcC5TdWJqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHAuQWN0aW9uID09PSAnV1JJVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlWyd3cml0ZVN1YmplY3QnXSA9IHAuU3ViamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmc1tuYW1lXSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyQ29uZmlncyA9IE9iamVjdC5lbnRyaWVzKGRlZnMpLm1hcChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5WzFdLm5zID0gZW50cnlbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50cnlbMV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhcnJDb25maWdzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmRlckEgPSBhLm9yZGVyIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JkZXJCID0gYi5vcmRlciB8fCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyQSA+IG9yZGVyQiA/IDEgOiBvcmRlckEgPT09IG9yZGVyQiA/IDAgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFyckNvbmZpZ3MubWFwKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB2YWx1ZS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjaG9pY2UnICYmIHZhbHVlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhLnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24gKGtleUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBrZXlMYWJlbC5zcGxpdChcInxcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc2V0KHBhcnRzWzBdLCBwYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhID0gdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdNYXAuc2V0KHZhbHVlLm5zLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuY29uZmlncyA9IGNvbmZpZ01hcDtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb25maWdNYXApO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBNYXAoKSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lc3BhY2UgU3RyaW5nXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2U8QXJyYXk+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xpc3RUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxpc3RUYWdzKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkoX3RoaXMzLmNsaWVudCk7XG4gICAgICAgICAgICAgICAgYXBpLmxpc3RVc2VyTWV0YVRhZ3MobmFtZXNwYWNlKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuVGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5UYWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbmFtZXNwYWNlIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gbmV3VGFnIHN0cmluZ1xuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NyZWF0ZVRhZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVUYWcobmFtZXNwYWNlLCBuZXdUYWcpIHtcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkodGhpcy5jbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5wdXRVc2VyTWV0YVRhZyhuYW1lc3BhY2UsIF9weWRpb0h0dHBSZXN0QXBpLlJlc3RQdXRVc2VyTWV0YVRhZ1JlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgTmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgVGFnOiBuZXdUYWdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNZXRhQ2xpZW50O1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTWV0YUNsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9NZXRhQ2xpZW50ID0gcmVxdWlyZSgnLi9NZXRhQ2xpZW50Jyk7XG5cbnZhciBfTWV0YUNsaWVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NZXRhQ2xpZW50KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZSgnY29sb3InKTtcblxudmFyIF9jb2xvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb2xvcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuU2VsZWN0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TZWxlY3RGaWVsZDtcbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG52YXIgTW9kZXJuU3R5bGVzID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU3R5bGVzO1xuXG52YXIgY29sb3JzQ2FjaGUgPSB7fTtcblxuZnVuY3Rpb24gY29sb3JzRnJvbVN0cmluZyhzKSB7XG4gICAgaWYgKHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgaWYgKGNvbG9yc0NhY2hlW3NdKSB7XG4gICAgICAgIHJldHVybiBjb2xvcnNDYWNoZVtzXTtcbiAgICB9XG4gICAgdmFyIGhhc2ggPSAwLFxuICAgICAgICBpID0gdW5kZWZpbmVkLFxuICAgICAgICBjaHIgPSB1bmRlZmluZWQsXG4gICAgICAgIGxlbiA9IHVuZGVmaW5lZDtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNociA9IHMuY2hhckNvZGVBdChpKSAqIDEwMDA7XG4gICAgICAgIGhhc2ggPSAoaGFzaCA8PCA1KSAtIGhhc2ggKyBjaHI7XG4gICAgICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gICAgfVxuICAgIHZhciBjID0gKGhhc2ggJiAweDAwRkZGRkZGKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICB2YXIgaGV4ID0gXCIwMDAwMFwiLnN1YnN0cmluZygwLCA2IC0gYy5sZW5ndGgpICsgYztcbiAgICB2YXIgY29sb3IgPSBuZXcgX2NvbG9yMlsnZGVmYXVsdCddKCcjJyArIGhleCkuaHNsKCk7XG4gICAgdmFyIGh1ZSA9IGNvbG9yLmh1ZSgpO1xuICAgIHZhciBiZyA9IG5ldyBfY29sb3IyWydkZWZhdWx0J10oeyBoOiBodWUsIHM6IGNvbG9yLnNhdHVyYXRpb25sKCksIGw6IDkwIH0pO1xuICAgIHZhciBmZyA9IG5ldyBfY29sb3IyWydkZWZhdWx0J10oeyBoOiBodWUsIHM6IGNvbG9yLnNhdHVyYXRpb25sKCksIGw6IDQwIH0pO1xuICAgIHZhciByZXN1bHQgPSB7IGNvbG9yOiBmZy5zdHJpbmcoKSwgYmFja2dyb3VuZENvbG9yOiBiZy5zdHJpbmcoKSB9O1xuICAgIGNvbG9yc0NhY2hlW3NdID0gcmVzdWx0O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBSZW5kZXJlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUmVuZGVyZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZW5kZXJlcik7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFJlbmRlcmVyLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdnZXRNZXRhZGF0YUNvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWV0YWRhdGFDb25maWdzKCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlbmRlcmVyLmdldENsaWVudCgpLmxvYWRDb25maWdzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybiB7TWV0YUNsaWVudH1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRDbGllbnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2xpZW50KCkge1xuICAgICAgICAgICAgaWYgKCFSZW5kZXJlci5DbGllbnQpIHtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5DbGllbnQgPSBuZXcgX01ldGFDbGllbnQyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJlci5DbGllbnQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlclN0YXJzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlclN0YXJzKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTdGFyc1JlbmRlcmVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uLCBzaXplOiAnc21hbGwnIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJTZWxlY3RvcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJTZWxlY3Rvcihub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTZWxlY3RvckZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyQ1NTTGFiZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyQ1NTTGFiZWwobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQ1NTTGFiZWxzRmlsdGVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJUYWdzQ2xvdWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyVGFnc0Nsb3VkKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRhZ1N0eWxlID0ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNFMUJFRTcnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzNweCAxMHB4IDEwcHggM3B4JyxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDE4LFxuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxOHB4JyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCAxMnB4IDAgNnB4JyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM5QzI3QjAnLFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQ6IDZcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKTtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHRhZ1N0eWxlLCBjb2xvcnNGcm9tU3RyaW5nKHRhZykpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsU3RhcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsU3RhcnMocHJvcHMpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTdGFyc0Zvcm1QYW5lbCwgcHJvcHMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxDc3NMYWJlbHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsQ3NzTGFiZWxzKHByb3BzKSB7XG5cbiAgICAgICAgICAgIHZhciBtZW51SXRlbXMgPSBPYmplY3Qua2V5cyhDU1NMYWJlbHNGaWx0ZXIuQ1NTX0xBQkVMUykubWFwKChmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBDU1NMYWJlbHNGaWx0ZXIuQ1NTX0xBQkVMU1tpZF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBpZCwgcHJpbWFyeVRleHQ6IGxhYmVsLmxhYmVsIH0pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU2VsZWN0b3JGb3JtUGFuZWwsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBtZW51SXRlbXM6IG1lbnVJdGVtcyB9KSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbFNlbGVjdG9yRmlsdGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFNlbGVjdG9yRmlsdGVyKHByb3BzKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtc0xvYWRlciA9IGZ1bmN0aW9uIGl0ZW1zTG9hZGVyKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCkudGhlbihmdW5jdGlvbiAobWV0YUNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSBtZXRhQ29uZmlncy5nZXQocHJvcHMuZmllbGRuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlncyAmJiBjb25maWdzLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3MuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IGtleSwgcHJpbWFyeVRleHQ6IHZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG1lbnVJdGVtcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWV0YVNlbGVjdG9yRm9ybVBhbmVsLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgbWVudUl0ZW1zOiBbXSwgaXRlbXNMb2FkZXI6IGl0ZW1zTG9hZGVyIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsVGFncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxUYWdzKHByb3BzKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVGFnc0Nsb3VkLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgZWRpdE1vZGU6IHRydWUgfSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFJlbmRlcmVyO1xufSkoKTtcblxudmFyIENhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FsbGJhY2tzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2FsbGJhY2tzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2FsbGJhY2tzLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdlZGl0TWV0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBlZGl0TWV0YSgpIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdSZWFjdE1ldGEnLCAnVXNlck1ldGFEaWFsb2cnLCB7XG4gICAgICAgICAgICAgICAgZGlhbG9nVGl0bGVJZDogNDg5LFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjogcHlkaW8uZ2V0VXNlclNlbGVjdGlvbigpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDYWxsYmFja3M7XG59KSgpO1xuXG52YXIgTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW4gPSB7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbGFiZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBmaWVsZG5hbWU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBvbkNoYW5nZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IGNvbmZpZ3M6IG5ldyBNYXAoKSB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCkudGhlbihmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBjb25maWdzOiBjIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlVmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHZhciBzdWJtaXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0ge307XG4gICAgICAgICAgICBvYmplY3RbJ2FqeHBfbWV0YV8nICsgdGhpcy5wcm9wcy5maWVsZG5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG9iamVjdCwgc3VibWl0KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLm9uVmFsdWVDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWx1ZUNoYW5nZSh0aGlzLnByb3BzLmZpZWxkbmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xuXG52YXIgTWV0YUZpZWxkUmVuZGVyZXJNaXhpbiA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBub2RlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpLFxuICAgICAgICBjb2x1bW46IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfHwgMCxcbiAgICAgICAgICAgIGNvbmZpZ3M6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGNvbmZpZ3MgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRSZWFsVmFsdWU6IGZ1bmN0aW9uIGdldFJlYWxWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubm9kZS5nZXRNZXRhZGF0YSgpLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKTtcbiAgICB9XG5cbn07XG5cbnZhciBzdGFyc1N0eWxlID0geyBmb250U2l6ZTogMjAsIGNvbG9yOiAnI0ZCQzAyRCcsIG1hcmdpblRvcDogNiwgbWFyZ2luQm90dG9tOiA2IH07XG5cbnZhciBTdGFyc0Zvcm1QYW5lbCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTdGFyc0Zvcm1QYW5lbCcsXG5cbiAgICBtaXhpbnM6IFtNZXRhRmllbGRGb3JtUGFuZWxNaXhpbl0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfHwgMCB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgdmFyIHN0YXJzID0gWy0xLCAwLCAxLCAyLCAzLCA0XS5tYXAoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICB2YXIgaWMgPSAnc3RhcicgKyAodiA9PT0gLTEgPyAnLW9mZicgOiB2YWx1ZSA+IHYgPyAnJyA6ICctb3V0bGluZScpO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gdiA9PT0gLTEgPyB7IG1hcmdpblJpZ2h0OiA1LCBjdXJzb3I6ICdwb2ludGVyJyB9IDogeyBjdXJzb3I6ICdwb2ludGVyJyB9O1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBrZXk6IFwic3Rhci1cIiArIHYsIG9uQ2xpY2s6IHRoaXMudXBkYXRlVmFsdWUuYmluZCh0aGlzLCB2ICsgMSksIGNsYXNzTmFtZTogXCJtZGkgbWRpLVwiICsgaWMsIHN0eWxlOiBzdHlsZSB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdhZHZhbmNlZC1zZWFyY2gtc3RhcnMnLCBzdHlsZTogX2V4dGVuZHMoe30sIE1vZGVyblN0eWxlcy5kaXYsIHN0YXJzU3R5bGUpIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIE1ldGFTdGFyc1JlbmRlcmVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ01ldGFTdGFyc1JlbmRlcmVyJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCkgfHwgMDtcbiAgICAgICAgdmFyIHN0YXJzID0gWzAsIDEsIDIsIDMsIDRdLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBrZXk6IFwic3Rhci1cIiArIHYsIGNsYXNzTmFtZTogXCJtZGkgbWRpLXN0YXJcIiArICh2YWx1ZSA+IHYgPyAnJyA6ICctb3V0bGluZScpIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHN0eWxlID0gdGhpcy5wcm9wcy5zaXplID09PSAnc21hbGwnID8geyBjb2xvcjogc3RhcnNTdHlsZS5jb2xvciB9IDogc3RhcnNTdHlsZTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBzdHlsZTogc3R5bGUgfSxcbiAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIFNlbGVjdG9yRmlsdGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1NlbGVjdG9yRmlsdGVyJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBjb25maWdzID0gdGhpcy5zdGF0ZS5jb25maWdzO1xuXG4gICAgICAgIHZhciB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGRpc3BsYXlWYWx1ZSA9IHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKTtcbiAgICAgICAgdmFyIGZpZWxkQ29uZmlnID0gY29uZmlncy5nZXQodGhpcy5wcm9wcy5jb2x1bW4ubmFtZSk7XG4gICAgICAgIGlmIChmaWVsZENvbmZpZyAmJiBmaWVsZENvbmZpZy5kYXRhKSB7XG4gICAgICAgICAgICBkaXNwbGF5VmFsdWUgPSBmaWVsZENvbmZpZy5kYXRhLmdldCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIGRpc3BsYXlWYWx1ZVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBDU1NMYWJlbHNGaWx0ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQ1NTTGFiZWxzRmlsdGVyJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICBDU1NfTEFCRUxTOiB7XG4gICAgICAgICAgICAnbG93JzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci40J10sIHNvcnRWYWx1ZTogJzUnLCBjb2xvcjogJyM2NmMnIH0sXG4gICAgICAgICAgICAndG9kbyc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNSddLCBzb3J0VmFsdWU6ICc0JywgY29sb3I6ICcjNjljJyB9LFxuICAgICAgICAgICAgJ3BlcnNvbmFsJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci42J10sIHNvcnRWYWx1ZTogJzMnLCBjb2xvcjogJyM2YzYnIH0sXG4gICAgICAgICAgICAnd29yayc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNyddLCBzb3J0VmFsdWU6ICcyJywgY29sb3I6ICcjYzk2JyB9LFxuICAgICAgICAgICAgJ2ltcG9ydGFudCc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuOCddLCBzb3J0VmFsdWU6ICcxJywgY29sb3I6ICcjYzY2JyB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIHZhciBkYXRhID0gQ1NTTGFiZWxzRmlsdGVyLkNTU19MQUJFTFM7XG4gICAgICAgIGlmICh2YWx1ZSAmJiBkYXRhW3ZhbHVlXSkge1xuICAgICAgICAgICAgdmFyIGRWID0gZGF0YVt2YWx1ZV07XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktbGFiZWwnLCBzdHlsZTogeyBjb2xvcjogZFYuY29sb3IgfSB9KSxcbiAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgZFYubGFiZWxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG52YXIgTWV0YVNlbGVjdG9yRm9ybVBhbmVsID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ01ldGFTZWxlY3RvckZvcm1QYW5lbCcsXG5cbiAgICBtaXhpbnM6IFtNZXRhRmllbGRGb3JtUGFuZWxNaXhpbl0sXG5cbiAgICBjaGFuZ2VTZWxlY3RvcjogZnVuY3Rpb24gY2hhbmdlU2VsZWN0b3IoZSwgc2VsZWN0ZWRJbmRleCwgcGF5bG9hZCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHBheWxvYWQpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLml0ZW1zTG9hZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLml0ZW1zTG9hZGVyKGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IG1lbnVJdGVtczogaXRlbXMgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICBpID0gMTtcbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVudUl0ZW1zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5wcm9wcy5tZW51SXRlbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zdGF0ZS5tZW51SXRlbXMpKTtcbiAgICAgICAgfVxuICAgICAgICBtZW51SXRlbXMudW5zaGlmdChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogJycsIHByaW1hcnlUZXh0OiAnJyB9KSk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJyB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGludFRleHQ6IHRoaXMucHJvcHMubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZVNlbGVjdG9yIH0sXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIFRhZ3NDbG91ZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdUYWdzQ2xvdWQnLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG5vZGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihBanhwTm9kZSksXG4gICAgICAgIGNvbHVtbjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5nZXRSZWFsVmFsdWUoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHZhciBub2RlID0gbmV4dFByb3BzLm5vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IG5leHRQcm9wcy52YWx1ZTtcbiAgICAgICAgdmFyIGNvbHVtbiA9IG5leHRQcm9wcy5jb2x1bW47XG5cbiAgICAgICAgaWYgKG5vZGUgJiYgbm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWdzOiB2YWx1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV4dFByb3BzLmVkaXRNb2RlICYmICF0aGlzLnN0YXRlLmxvYWRlZCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0UmVhbFZhbHVlOiBmdW5jdGlvbiBnZXRSZWFsVmFsdWUoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBfcHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBjb2x1bW4gPSBfcHJvcHMuY29sdW1uO1xuXG4gICAgICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWdzOiB2YWx1ZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWdzOiBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbm9kZSA9IF9wcm9wczIubm9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzMi52YWx1ZTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBkYXRhU291cmNlOiBbXSxcbiAgICAgICAgICAgIHRhZ3M6IG5vZGUgPyBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KHRoaXMucHJvcHMuY29sdW1uLm5hbWUpIDogdmFsdWUsXG4gICAgICAgICAgICBzZWFyY2hUZXh0OiAnJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBzdWdnZXN0aW9uTG9hZGVyOiBmdW5jdGlvbiBzdWdnZXN0aW9uTG9hZGVyKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0aGlzLnN0YXRlLmxvYWRpbmcgKyAxIH0pO1xuXG4gICAgICAgIFJlbmRlcmVyLmdldENsaWVudCgpLmxpc3RUYWdzKHRoaXMucHJvcHMuZmllbGRuYW1lIHx8IHRoaXMucHJvcHMuY29sdW1uLm5hbWUpLnRoZW4oZnVuY3Rpb24gKHRhZ3MpIHtcbiAgICAgICAgICAgIF90aGlzNC5zZXRTdGF0ZSh7IGxvYWRpbmc6IF90aGlzNC5zdGF0ZS5sb2FkaW5nIC0gMSB9KTtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRhZ3MpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbG9hZDogZnVuY3Rpb24gbG9hZCgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbkxvYWRlcigoZnVuY3Rpb24gKHRhZ3MpIHtcbiAgICAgICAgICAgIHZhciBjcnRWYWx1ZUZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gdGFncy5tYXAoKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IHRhZyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkYXRhU291cmNlOiB2YWx1ZXMsIGxvYWRpbmc6IGZhbHNlLCBsb2FkZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZXF1ZXN0RGVsZXRlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0RGVsZXRlKHRhZykge1xuICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICB2YXIgdGFncyA9IHRoaXMuc3RhdGUudGFncy5zcGxpdCgnLCcpO1xuICAgICAgICB2YXIgaW5kZXggPSB0YWdzLmluZGV4T2YodGFnKTtcbiAgICAgICAgdGFncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhZ3M6IHRhZ3MudG9TdHJpbmcoKSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczUudXBkYXRlVmFsdWUoX3RoaXM1LnN0YXRlLnRhZ3MpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlVXBkYXRlSW5wdXQ6IGZ1bmN0aW9uIGhhbmRsZVVwZGF0ZUlucHV0KHNlYXJjaFRleHQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlYXJjaFRleHQ6IHNlYXJjaFRleHQgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZU5ld1JlcXVlc3Q6IGZ1bmN0aW9uIGhhbmRsZU5ld1JlcXVlc3QoKSB7XG4gICAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YWdzID0gW107XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRhZ3MpIHtcbiAgICAgICAgICAgIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoJywnKTtcbiAgICAgICAgfVxuICAgICAgICB0YWdzLnB1c2godGhpcy5zdGF0ZS5zZWFyY2hUZXh0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YWdzOiB0YWdzLnRvU3RyaW5nKCkgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM2LnVwZGF0ZVZhbHVlKF90aGlzNi5zdGF0ZS50YWdzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoVGV4dDogJydcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlckNoaXA6IGZ1bmN0aW9uIHJlbmRlckNoaXAodGFnKSB7XG4gICAgICAgIHZhciBfY29sb3JzRnJvbVN0cmluZyA9IGNvbG9yc0Zyb21TdHJpbmcodGFnKTtcblxuICAgICAgICB2YXIgY29sb3IgPSBfY29sb3JzRnJvbVN0cmluZy5jb2xvcjtcbiAgICAgICAgdmFyIGJhY2tncm91bmRDb2xvciA9IF9jb2xvcnNGcm9tU3RyaW5nLmJhY2tncm91bmRDb2xvcjtcblxuICAgICAgICB2YXIgY2hpcFN0eWxlID0geyBtYXJnaW46IDIsIGJvcmRlclJhZGl1czogJzRweCAxNnB4IDE2cHggNHB4JyB9O1xuICAgICAgICB2YXIgbGFiZWxTdHlsZSA9IHsgY29sb3I6IGNvbG9yLCBmb250V2VpZ2h0OiA1MDAsIHBhZGRpbmdMZWZ0OiAxMCwgcGFkZGluZ1JpZ2h0OiAxNiB9O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNoaXAsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHRhZywgYmFja2dyb3VuZENvbG9yOiBiYWNrZ3JvdW5kQ29sb3IsIGxhYmVsU3R5bGU6IGxhYmVsU3R5bGUsIHN0eWxlOiBjaGlwU3R5bGUsIG9uUmVxdWVzdERlbGV0ZTogdGhpcy5oYW5kbGVSZXF1ZXN0RGVsZXRlLmJpbmQodGhpcywgdGFnKSB9LFxuICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5DaGlwLFxuICAgICAgICAgICAgICAgIHsga2V5OiB0YWcsIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZENvbG9yLCBsYWJlbFN0eWxlOiBsYWJlbFN0eWxlLCBzdHlsZTogY2hpcFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgdGFncyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGFncykge1xuICAgICAgICAgICAgdGFncyA9IHRoaXMuc3RhdGUudGFncy5zcGxpdChcIixcIikubWFwKChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgICAgICAgdGFnID0gTGFuZ1V0aWxzLnRyaW0odGFnLCAnICcpO1xuICAgICAgICAgICAgICAgIGlmICghdGFnKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJDaGlwKHRhZyk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhZ3MgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF1dG9Db21wbGV0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQXV0b0NvbXBsZXRlLCBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBweWRpby5NZXNzYWdlSGFzaFsnbWV0YS51c2VyLjEwJ10sXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dDogdGhpcy5zdGF0ZS5zZWFyY2hUZXh0LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlSW5wdXQ6IHRoaXMuaGFuZGxlVXBkYXRlSW5wdXQsXG4gICAgICAgICAgICAgICAgb25OZXdSZXF1ZXN0OiB0aGlzLmhhbmRsZU5ld1JlcXVlc3QsXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZTogdGhpcy5zdGF0ZS5kYXRhU291cmNlLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKHNlYXJjaFRleHQsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH0sXG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAtOCB9XG4gICAgICAgICAgICB9LCBNb2Rlcm5TdHlsZXMudGV4dEZpZWxkKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcgfSB9LFxuICAgICAgICAgICAgICAgIHRhZ3NcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIFVzZXJNZXRhRGlhbG9nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1VzZXJNZXRhRGlhbG9nJyxcblxuICAgIHByb3BzVHlwZXM6IHtcbiAgICAgICAgc2VsZWN0aW9uOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoUHlkaW9EYXRhTW9kZWwpXG4gICAgfSxcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5yZWZzLnBhbmVsLmdldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaykge1xuICAgICAgICAgICAgcGFyYW1zW2tdID0gdjtcbiAgICAgICAgfSk7XG4gICAgICAgIFJlbmRlcmVyLmdldENsaWVudCgpLnNhdmVNZXRhKHRoaXMucHJvcHMuc2VsZWN0aW9uLmdldFNlbGVjdGVkTm9kZXMoKSwgdmFsdWVzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNy5kaXNtaXNzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyTWV0YVBhbmVsLCB7XG4gICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgIG11bHRpcGxlOiAhdGhpcy5wcm9wcy5zZWxlY3Rpb24uaXNVbmlxdWUoKSxcbiAgICAgICAgICAgIHJlZjogJ3BhbmVsJyxcbiAgICAgICAgICAgIG5vZGU6IHRoaXMucHJvcHMuc2VsZWN0aW9uLmlzVW5pcXVlKCkgPyB0aGlzLnByb3BzLnNlbGVjdGlvbi5nZXRVbmlxdWVOb2RlKCkgOiBuZXcgQWp4cE5vZGUoKSxcbiAgICAgICAgICAgIGVkaXRNb2RlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG52YXIgVXNlck1ldGFQYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhVc2VyTWV0YVBhbmVsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFVzZXJNZXRhUGFuZWwocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVzZXJNZXRhUGFuZWwpO1xuXG4gICAgICAgIGlmIChwcm9wcy5lZGl0TW9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwcm9wcy5lZGl0TW9kZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFVzZXJNZXRhUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB1cGRhdGVNZXRhOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBpc0NoZWNrZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZmllbGRzOiBbXSxcbiAgICAgICAgICAgIGNvbmZpZ3M6IG5ldyBNYXAoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVc2VyTWV0YVBhbmVsLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjb25maWdzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXM4LnNldFN0YXRlKHsgY29uZmlnczogY29uZmlncyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVWYWx1ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVWYWx1ZShuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS51cGRhdGVNZXRhLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cGRhdGVNZXRhOiB0aGlzLnN0YXRlLnVwZGF0ZU1ldGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWxldGVWYWx1ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVWYWx1ZShuYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVwZGF0ZU1ldGFbJ2RlbGV0ZSddKG5hbWUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBkYXRlTWV0YTogdGhpcy5zdGF0ZS51cGRhdGVNZXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0VXBkYXRlRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRVcGRhdGVEYXRhKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudXBkYXRlTWV0YTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVzZXRVcGRhdGVEYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0VXBkYXRlRGF0YSgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU1ldGE6IG5ldyBNYXAoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uQ2hlY2snLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25DaGVjayhlLCBpc0lucHV0Q2hlY2tlZCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBzdGF0ZVsnZmllbGRzJ11bZS50YXJnZXQudmFsdWVdID0gaXNJbnB1dENoZWNrZWQ7XG4gICAgICAgICAgICBpZiAoaXNJbnB1dENoZWNrZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnN0YXRlLmNvbmZpZ3M7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgICAgIHZhciBtZXRhZGF0YSA9IHRoaXMucHJvcHMubm9kZS5nZXRNZXRhZGF0YSgpO1xuICAgICAgICAgICAgdmFyIHVwZGF0ZU1ldGEgPSB0aGlzLnN0YXRlLnVwZGF0ZU1ldGE7XG4gICAgICAgICAgICB2YXIgbm9uRW1wdHlEYXRhQ291bnQgPSAwO1xuICAgICAgICAgICAgdmFyIGlzQWRtaW4gPSBweWRpby51c2VyLmlzQWRtaW47XG5cbiAgICAgICAgICAgIGNvbmZpZ3MuZm9yRWFjaCgoZnVuY3Rpb24gKG1ldGEsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpczkgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRvbmx5ID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IG1ldGEubGFiZWw7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBtZXRhLnR5cGU7XG4gICAgICAgICAgICAgICAgdmFyIHdyaXRlU3ViamVjdCA9IG1ldGEud3JpdGVTdWJqZWN0O1xuICAgICAgICAgICAgICAgIHZhciByZWFkU3ViamVjdCA9IG1ldGEucmVhZFN1YmplY3Q7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVhZFN1YmplY3QgPT09ICdwcm9maWxlOmFkbWluJyAmJiAhaXNBZG1pbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh3cml0ZVN1YmplY3QgPT09ICdwcm9maWxlOmFkbWluJyAmJiAhaXNBZG1pbikge1xuICAgICAgICAgICAgICAgICAgICByZWFkb25seSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlID0gbWV0YWRhdGEuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU1ldGEuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1cGRhdGVNZXRhLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcmVhbFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZSAmJiAhcmVhZG9ubHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZVByb3BzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNDaGVja2VkOiB0aGlzLnN0YXRlLmlzQ2hlY2tlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkbmFtZToga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25WYWx1ZUNoYW5nZTogdGhpcy51cGRhdGVWYWx1ZS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3RhcnNfcmF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU3RhcnNGb3JtUGFuZWwsIGJhc2VQcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gUmVuZGVyZXIuZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXIoYmFzZVByb3BzLCBjb25maWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY3NzX2xhYmVsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxDc3NMYWJlbHMoYmFzZVByb3BzLCBjb25maWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gUmVuZGVyZXIuZm9ybVBhbmVsVGFncyhiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiByZWFkb25seSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaW50VGV4dDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM5LnVwZGF0ZVZhbHVlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm11bHRpcGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiaW5mb1BhbmVsUm93XCIsIGtleToga2V5LCBzdHlsZTogeyBtYXJnaW5Cb3R0b206IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyB2YWx1ZToga2V5LCBsYWJlbDogbGFiZWwsIG9uQ2hlY2s6IHRoaXMub25DaGVjay5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGVbJ2ZpZWxkcyddW2tleV0gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2luZm9QYW5lbFZhbHVlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiLCBrZXk6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxMYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2x1bW4gPSB7IG5hbWU6IGtleSB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3N0YXJzX3JhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTdGFyc1JlbmRlcmVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjc3NfbGFiZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KENTU0xhYmVsc0ZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2hvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTZWxlY3RvckZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVGFnc0Nsb3VkLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vbkVtcHR5RGF0YUNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJpbmZvUGFuZWxSb3dcIiArICghcmVhbFZhbHVlID8gJyBuby12YWx1ZScgOiAnJyksIGtleToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2luZm9QYW5lbExhYmVsJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHZhciBtZXNzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5lZGl0TW9kZSAmJiAhbm9uRW1wdHlEYXRhQ291bnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC4yMyknLCBwYWRkaW5nQm90dG9tOiAxMCB9LCBvblRvdWNoVGFwOiB0aGlzLnByb3BzLm9uUmVxdWVzdEVkaXRNb2RlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnVzZXIuMTEnXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlZ2VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjEyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnVzZXIuMTMnXVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIG92ZXJmbG93WTogJ3Njcm9sbCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVzZXJNZXRhUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIEluZm9QYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoSW5mb1BhbmVsLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBJbmZvUGFuZWwocHJvcHMpIHtcbiAgICAgICAgdmFyIF90aGlzMTAgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbmZvUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEluZm9QYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgZWRpdE1vZGU6IGZhbHNlIH07XG4gICAgICAgIHRoaXMuX25vZGVPYnNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpczEwLnJlZnMucGFuZWwpIHtcbiAgICAgICAgICAgICAgICBfdGhpczEwLnJlZnMucGFuZWwucmVzZXRVcGRhdGVEYXRhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpczEwLnNldFN0YXRlKHsgZWRpdE1vZGU6IGZhbHNlIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczEwLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgIHByb3BzLm5vZGUub2JzZXJ2ZSgnbm9kZV9yZXBsYWNlZCcsIHRoaXMuX25vZGVPYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoSW5mb1BhbmVsLCBbe1xuICAgICAgICBrZXk6ICdvcGVuRWRpdE1vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkVkaXRNb2RlKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXNldCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcy5wYW5lbC5yZXNldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubm9kZS5zdG9wT2JzZXJ2aW5nKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXdQcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUgJiYgdGhpcy5yZWZzLnBhbmVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgICAgIG5ld1Byb3BzLm5vZGUub2JzZXJ2ZSgnbm9kZV9yZXBsYWNlZCcsIHRoaXMuX25vZGVPYnNlcnZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubm9kZS5zdG9wT2JzZXJ2aW5nKCdub2RlX3JlcGxhY2VkJywgdGhpcy5fbm9kZU9ic2VydmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2F2ZUNoYW5nZXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZUNoYW5nZXMoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMxMSA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLnJlZnMucGFuZWwuZ2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNba10gPSB2O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBSZW5kZXJlci5nZXRDbGllbnQoKS5zYXZlTWV0YSh0aGlzLnByb3BzLnB5ZGlvLmdldENvbnRleHRIb2xkZXIoKS5nZXRTZWxlY3RlZE5vZGVzKCksIHZhbHVlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMxMS5yZXNldCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMxMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgICAgICAgICB2YXIgTWVzc2FnZUhhc2ggPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBNZXNzYWdlSGFzaFsnNTQnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMxMi5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoKS5oYXMoJ25vZGVfcmVhZG9ubHknKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2VkaXQnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5zdGF0ZS5lZGl0TW9kZSA/IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTUnXSA6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMTQnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgIV90aGlzMTIuc3RhdGUuZWRpdE1vZGUgPyBfdGhpczEyLm9wZW5FZGl0TW9kZSgpIDogX3RoaXMxMi5zYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgUHlkaW9Xb3Jrc3BhY2VzLkluZm9QYW5lbENhcmQsXG4gICAgICAgICAgICAgICAgeyBpZGVudGlmaWVyOiBcIm1ldGEtdXNlclwiLCBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSwgdGl0bGU6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xJ10sIGFjdGlvbnM6IGFjdGlvbnMubGVuZ3RoID8gYWN0aW9ucyA6IG51bGwsIGljb246ICd0YWctbXVsdGlwbGUnLCBpY29uQ29sb3I6ICcjMDBBQ0MxJyB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJNZXRhUGFuZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICBub2RlOiB0aGlzLnByb3BzLm5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGVkaXRNb2RlOiB0aGlzLnN0YXRlLmVkaXRNb2RlLFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RFZGl0TW9kZTogdGhpcy5vcGVuRWRpdE1vZGUuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW9cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBJbmZvUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0cy5SZW5kZXJlciA9IFJlbmRlcmVyO1xuZXhwb3J0cy5JbmZvUGFuZWwgPSBJbmZvUGFuZWw7XG5leHBvcnRzLkNhbGxiYWNrcyA9IENhbGxiYWNrcztcbmV4cG9ydHMuVXNlck1ldGFEaWFsb2cgPSBVc2VyTWV0YURpYWxvZztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuXG5leHBvcnRzLlJlbmRlcmVyID0gX2NvbXBvbmVudHMuUmVuZGVyZXI7XG5leHBvcnRzLkluZm9QYW5lbCA9IF9jb21wb25lbnRzLkluZm9QYW5lbDtcbmV4cG9ydHMuQ2FsbGJhY2tzID0gX2NvbXBvbmVudHMuQ2FsbGJhY2tzO1xuZXhwb3J0cy5Vc2VyTWV0YURpYWxvZyA9IF9jb21wb25lbnRzLlVzZXJNZXRhRGlhbG9nO1xuIl19
