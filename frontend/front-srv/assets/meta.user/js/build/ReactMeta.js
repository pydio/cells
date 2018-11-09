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

var starsStyle = { fontSize: 20, color: '#FBC02D' };

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
            { className: 'advanced-search-stars', style: starsStyle },
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
                _materialUi.SelectField,
                {
                    style: { width: '100%' },
                    value: this.state.value,
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
        var textField = undefined;
        if (this.props.editMode) {
            autoCompleter = _react2['default'].createElement(_materialUi.AutoComplete, {
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
                menuProps: { maxHeight: 200 }
            });
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
                        field = _react2['default'].createElement(_materialUi.TextField, {
                            value: value,
                            fullWidth: true,
                            disabled: readonly,
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

},{"./MetaClient":1,"color":"color","material-ui":"material-ui","react":"react"}],3:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9NZXRhQ2xpZW50LmpzIiwianMvYnVpbGQvY29tcG9uZW50cy5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvTW9kZWxOb2RlID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvbm9kZScpO1xuXG52YXIgX3B5ZGlvTW9kZWxOb2RlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxOb2RlKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgTWV0YUNsaWVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWV0YUNsaWVudCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1ldGFDbGllbnQpO1xuXG4gICAgICAgIHRoaXMuY2xpZW50ID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBtZXRhcyB0byBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gbm9kZXMgW3tOb2RlfV1cbiAgICAgKiBAcGFyYW0gdmFsdWVzIHtPYmplY3R9XG4gICAgICovXG5cbiAgICBfY3JlYXRlQ2xhc3MoTWV0YUNsaWVudCwgW3tcbiAgICAgICAga2V5OiAnc2F2ZU1ldGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZU1ldGEobm9kZXMsIHZhbHVlcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkodGhpcy5jbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5sb2FkQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21zID0gW107XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuSWRtVXBkYXRlVXNlck1ldGFSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk1ldGFEYXRhcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5PcGVyYXRpb24gPSAnUFVUJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY0RhdGEsIGNOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMuaGFzKGNOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXRhID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLklkbVVzZXJNZXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Ob2RlVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJ1dWlkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGEuTmFtZXNwYWNlID0gY05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Kc29uVmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZXMuZ2V0KGNOYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5Qb2xpY2llcyA9IFtfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbjogJ1JFQUQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdWJqZWN0OiAnKicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ2FsbG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3kuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjdGlvbjogJ1dSSVRFJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ViamVjdDogJyonLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFZmZlY3Q6ICdhbGxvdydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5NZXRhRGF0YXMucHVzaChtZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KGNOYW1lLCB2YWx1ZXMuZ2V0KGNOYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2goYXBpLnVwZGF0ZVVzZXJNZXRhKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLm5vdGlmeSgnbm9kZV9yZXBsYWNlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckNvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJDb25maWdzKCkge1xuICAgICAgICAgICAgdGhpcy5jb25maWdzID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlPE1hcD59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZENvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZENvbmZpZ3MoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlncykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5jb25maWdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb21pc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZnMgPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlnTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVXNlck1ldGFTZXJ2aWNlQXBpKF90aGlzMi5jbGllbnQpO1xuICAgICAgICAgICAgICAgIGFwaS5saXN0VXNlck1ldGFOYW1lc3BhY2UoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lk5hbWVzcGFjZXMubWFwKGZ1bmN0aW9uIChucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBucy5OYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbnMuTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhhYmxlOiBucy5JbmRleGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IG5zLk9yZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnMuSnNvbkRlZmluaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgakRlZiA9IEpTT04ucGFyc2UobnMuSnNvbkRlZmluaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhqRGVmKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2Vba10gPSBqRGVmW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5zLlBvbGljaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnMuUG9saWNpZXMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwLkFjdGlvbiA9PT0gJ1JFQUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlWydyZWFkU3ViamVjdCddID0gcC5TdWJqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHAuQWN0aW9uID09PSAnV1JJVEUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlWyd3cml0ZVN1YmplY3QnXSA9IHAuU3ViamVjdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmc1tuYW1lXSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyQ29uZmlncyA9IE9iamVjdC5lbnRyaWVzKGRlZnMpLm1hcChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5WzFdLm5zID0gZW50cnlbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50cnlbMV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhcnJDb25maWdzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmRlckEgPSBhLm9yZGVyIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3JkZXJCID0gYi5vcmRlciB8fCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyQSA+IG9yZGVyQiA/IDEgOiBvcmRlckEgPT09IG9yZGVyQiA/IDAgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFyckNvbmZpZ3MubWFwKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB2YWx1ZS50eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjaG9pY2UnICYmIHZhbHVlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhLnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24gKGtleUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBrZXlMYWJlbC5zcGxpdChcInxcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc2V0KHBhcnRzWzBdLCBwYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kYXRhID0gdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWdNYXAuc2V0KHZhbHVlLm5zLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuY29uZmlncyA9IGNvbmZpZ01hcDtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb25maWdNYXApO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBNYXAoKSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lc3BhY2UgU3RyaW5nXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2U8QXJyYXk+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xpc3RUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxpc3RUYWdzKG5hbWVzcGFjZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkoX3RoaXMzLmNsaWVudCk7XG4gICAgICAgICAgICAgICAgYXBpLmxpc3RVc2VyTWV0YVRhZ3MobmFtZXNwYWNlKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuVGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5UYWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbmFtZXNwYWNlIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gbmV3VGFnIHN0cmluZ1xuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NyZWF0ZVRhZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVUYWcobmFtZXNwYWNlLCBuZXdUYWcpIHtcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkodGhpcy5jbGllbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5wdXRVc2VyTWV0YVRhZyhuYW1lc3BhY2UsIF9weWRpb0h0dHBSZXN0QXBpLlJlc3RQdXRVc2VyTWV0YVRhZ1JlcXVlc3QuY29uc3RydWN0RnJvbU9iamVjdCh7XG4gICAgICAgICAgICAgICAgTmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgVGFnOiBuZXdUYWdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNZXRhQ2xpZW50O1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTWV0YUNsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9NZXRhQ2xpZW50ID0gcmVxdWlyZSgnLi9NZXRhQ2xpZW50Jyk7XG5cbnZhciBfTWV0YUNsaWVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NZXRhQ2xpZW50KTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZSgnY29sb3InKTtcblxudmFyIF9jb2xvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb2xvcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBjb2xvcnNDYWNoZSA9IHt9O1xuXG5mdW5jdGlvbiBjb2xvcnNGcm9tU3RyaW5nKHMpIHtcbiAgICBpZiAocy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBpZiAoY29sb3JzQ2FjaGVbc10pIHtcbiAgICAgICAgcmV0dXJuIGNvbG9yc0NhY2hlW3NdO1xuICAgIH1cbiAgICB2YXIgaGFzaCA9IDAsXG4gICAgICAgIGkgPSB1bmRlZmluZWQsXG4gICAgICAgIGNociA9IHVuZGVmaW5lZCxcbiAgICAgICAgbGVuID0gdW5kZWZpbmVkO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2hyID0gcy5jaGFyQ29kZUF0KGkpICogMTAwMDtcbiAgICAgICAgaGFzaCA9IChoYXNoIDw8IDUpIC0gaGFzaCArIGNocjtcbiAgICAgICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgICB9XG4gICAgdmFyIGMgPSAoaGFzaCAmIDB4MDBGRkZGRkYpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgIHZhciBoZXggPSBcIjAwMDAwXCIuc3Vic3RyaW5nKDAsIDYgLSBjLmxlbmd0aCkgKyBjO1xuICAgIHZhciBjb2xvciA9IG5ldyBfY29sb3IyWydkZWZhdWx0J10oJyMnICsgaGV4KS5oc2woKTtcbiAgICB2YXIgaHVlID0gY29sb3IuaHVlKCk7XG4gICAgdmFyIGJnID0gbmV3IF9jb2xvcjJbJ2RlZmF1bHQnXSh7IGg6IGh1ZSwgczogY29sb3Iuc2F0dXJhdGlvbmwoKSwgbDogOTAgfSk7XG4gICAgdmFyIGZnID0gbmV3IF9jb2xvcjJbJ2RlZmF1bHQnXSh7IGg6IGh1ZSwgczogY29sb3Iuc2F0dXJhdGlvbmwoKSwgbDogNDAgfSk7XG4gICAgdmFyIHJlc3VsdCA9IHsgY29sb3I6IGZnLnN0cmluZygpLCBiYWNrZ3JvdW5kQ29sb3I6IGJnLnN0cmluZygpIH07XG4gICAgY29sb3JzQ2FjaGVbc10gPSByZXN1bHQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIFJlbmRlcmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBSZW5kZXJlcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlbmRlcmVyKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUmVuZGVyZXIsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2dldE1ldGFkYXRhQ29uZmlncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNZXRhZGF0YUNvbmZpZ3MoKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVuZGVyZXIuZ2V0Q2xpZW50KCkubG9hZENvbmZpZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJuIHtNZXRhQ2xpZW50fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldENsaWVudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDbGllbnQoKSB7XG4gICAgICAgICAgICBpZiAoIVJlbmRlcmVyLkNsaWVudCkge1xuICAgICAgICAgICAgICAgIFJlbmRlcmVyLkNsaWVudCA9IG5ldyBfTWV0YUNsaWVudDJbJ2RlZmF1bHQnXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlbmRlcmVyLkNsaWVudDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyU3RhcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyU3RhcnMobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWV0YVN0YXJzUmVuZGVyZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4sIHNpemU6ICdzbWFsbCcgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlclNlbGVjdG9yJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlclNlbGVjdG9yKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFNlbGVjdG9yRmlsdGVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJDU1NMYWJlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJDU1NMYWJlbChub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChDU1NMYWJlbHNGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlclRhZ3NDbG91ZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJUYWdzQ2xvdWQobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdGFnU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI0UxQkVFNycsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnM3B4IDEwcHggMTBweCAzcHgnLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMTgsXG4gICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzE4cHgnLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwIDEycHggMCA2cHgnLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzlDMjdCMCcsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogNTAwLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogNlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWUuc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgdGFnU3R5bGUsIGNvbG9yc0Zyb21TdHJpbmcodGFnKSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxTdGFycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxTdGFycyhwcm9wcykge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFN0YXJzRm9ybVBhbmVsLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbENzc0xhYmVscycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxDc3NMYWJlbHMocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IE9iamVjdC5rZXlzKENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTKS5tYXAoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTW2lkXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IGlkLCBwcmltYXJ5VGV4dDogbGFiZWwubGFiZWwgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTZWxlY3RvckZvcm1QYW5lbCwgX2V4dGVuZHMoe30sIHByb3BzLCB7IG1lbnVJdGVtczogbWVudUl0ZW1zIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXIocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zTG9hZGVyID0gZnVuY3Rpb24gaXRlbXNMb2FkZXIoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChtZXRhQ29uZmlncykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZmlncyA9IG1ldGFDb25maWdzLmdldChwcm9wcy5maWVsZG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWdzICYmIGNvbmZpZ3MuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlncy5kYXRhLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobWVudUl0ZW1zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU2VsZWN0b3JGb3JtUGFuZWwsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBtZW51SXRlbXM6IFtdLCBpdGVtc0xvYWRlcjogaXRlbXNMb2FkZXIgfSkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFRhZ3MocHJvcHMpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUYWdzQ2xvdWQsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBlZGl0TW9kZTogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVuZGVyZXI7XG59KSgpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2VkaXRNZXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRNZXRhKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1JlYWN0TWV0YScsICdVc2VyTWV0YURpYWxvZycsIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dUaXRsZUlkOiA0ODksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiBweWRpby5nZXRVc2VyU2VsZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBNZXRhRmllbGRGb3JtUGFuZWxNaXhpbiA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsYWJlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGZpZWxkbmFtZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgY29uZmlnczogbmV3IE1hcCgpIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGMgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZTogZnVuY3Rpb24gdXBkYXRlVmFsdWUodmFsdWUpIHtcbiAgICAgICAgdmFyIHN1Ym1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICAgICAgICAgIG9iamVjdFsnYWp4cF9tZXRhXycgKyB0aGlzLnByb3BzLmZpZWxkbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uob2JqZWN0LCBzdWJtaXQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMub25WYWx1ZUNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbHVlQ2hhbmdlKHRoaXMucHJvcHMuZmllbGRuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbnZhciBNZXRhRmllbGRSZW5kZXJlck1peGluID0ge1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG5vZGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihBanhwTm9kZSksXG4gICAgICAgIGNvbHVtbjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB8fCAwLFxuICAgICAgICAgICAgY29uZmlnczogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCkudGhlbihmdW5jdGlvbiAoY29uZmlncykge1xuICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgY29uZmlnczogY29uZmlncyB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldFJlYWxWYWx1ZTogZnVuY3Rpb24gZ2V0UmVhbFZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuZ2V0KHRoaXMucHJvcHMuY29sdW1uLm5hbWUpO1xuICAgIH1cblxufTtcblxudmFyIHN0YXJzU3R5bGUgPSB7IGZvbnRTaXplOiAyMCwgY29sb3I6ICcjRkJDMDJEJyB9O1xuXG52YXIgU3RhcnNGb3JtUGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU3RhcnNGb3JtUGFuZWwnLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIHx8IDAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIHZhciBzdGFycyA9IFstMSwgMCwgMSwgMiwgMywgNF0ubWFwKChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdmFyIGljID0gJ3N0YXInICsgKHYgPT09IC0xID8gJy1vZmYnIDogdmFsdWUgPiB2ID8gJycgOiAnLW91dGxpbmUnKTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IHYgPT09IC0xID8geyBtYXJnaW5SaWdodDogNSwgY3Vyc29yOiAncG9pbnRlcicgfSA6IHsgY3Vyc29yOiAncG9pbnRlcicgfTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiBcInN0YXItXCIgKyB2LCBvbkNsaWNrOiB0aGlzLnVwZGF0ZVZhbHVlLmJpbmQodGhpcywgdiArIDEpLCBjbGFzc05hbWU6IFwibWRpIG1kaS1cIiArIGljLCBzdHlsZTogc3R5bGUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnYWR2YW5jZWQtc2VhcmNoLXN0YXJzJywgc3R5bGU6IHN0YXJzU3R5bGUgfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgc3RhcnNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgTWV0YVN0YXJzUmVuZGVyZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVN0YXJzUmVuZGVyZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKSB8fCAwO1xuICAgICAgICB2YXIgc3RhcnMgPSBbMCwgMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogXCJzdGFyLVwiICsgdiwgY2xhc3NOYW1lOiBcIm1kaSBtZGktc3RhclwiICsgKHZhbHVlID4gdiA/ICcnIDogJy1vdXRsaW5lJykgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgc3R5bGUgPSB0aGlzLnByb3BzLnNpemUgPT09ICdzbWFsbCcgPyB7IGNvbG9yOiBzdGFyc1N0eWxlLmNvbG9yIH0gOiBzdGFyc1N0eWxlO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICB7IHN0eWxlOiBzdHlsZSB9LFxuICAgICAgICAgICAgc3RhcnNcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgU2VsZWN0b3JGaWx0ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU2VsZWN0b3JGaWx0ZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnN0YXRlLmNvbmZpZ3M7XG5cbiAgICAgICAgdmFyIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgZGlzcGxheVZhbHVlID0gdmFsdWUgPSB0aGlzLmdldFJlYWxWYWx1ZSgpO1xuICAgICAgICB2YXIgZmllbGRDb25maWcgPSBjb25maWdzLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKTtcbiAgICAgICAgaWYgKGZpZWxkQ29uZmlnICYmIGZpZWxkQ29uZmlnLmRhdGEpIHtcbiAgICAgICAgICAgIGRpc3BsYXlWYWx1ZSA9IGZpZWxkQ29uZmlnLmRhdGEuZ2V0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgZGlzcGxheVZhbHVlXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIENTU0xhYmVsc0ZpbHRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdDU1NMYWJlbHNGaWx0ZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIENTU19MQUJFTFM6IHtcbiAgICAgICAgICAgICdsb3cnOiB7IGxhYmVsOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjQnXSwgc29ydFZhbHVlOiAnNScsIGNvbG9yOiAnIzY2YycgfSxcbiAgICAgICAgICAgICd0b2RvJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci41J10sIHNvcnRWYWx1ZTogJzQnLCBjb2xvcjogJyM2OWMnIH0sXG4gICAgICAgICAgICAncGVyc29uYWwnOiB7IGxhYmVsOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjYnXSwgc29ydFZhbHVlOiAnMycsIGNvbG9yOiAnIzZjNicgfSxcbiAgICAgICAgICAgICd3b3JrJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci43J10sIHNvcnRWYWx1ZTogJzInLCBjb2xvcjogJyNjOTYnIH0sXG4gICAgICAgICAgICAnaW1wb3J0YW50JzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci44J10sIHNvcnRWYWx1ZTogJzEnLCBjb2xvcjogJyNjNjYnIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKTtcbiAgICAgICAgdmFyIGRhdGEgPSBDU1NMYWJlbHNGaWx0ZXIuQ1NTX0xBQkVMUztcbiAgICAgICAgaWYgKHZhbHVlICYmIGRhdGFbdmFsdWVdKSB7XG4gICAgICAgICAgICB2YXIgZFYgPSBkYXRhW3ZhbHVlXTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1sYWJlbCcsIHN0eWxlOiB7IGNvbG9yOiBkVi5jb2xvciB9IH0pLFxuICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICBkVi5sYWJlbFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5cbnZhciBNZXRhU2VsZWN0b3JGb3JtUGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVNlbGVjdG9yRm9ybVBhbmVsJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZEZvcm1QYW5lbE1peGluXSxcblxuICAgIGNoYW5nZVNlbGVjdG9yOiBmdW5jdGlvbiBjaGFuZ2VTZWxlY3RvcihlLCBzZWxlY3RlZEluZGV4LCBwYXlsb2FkKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmFsdWUocGF5bG9hZCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXRlbXNMb2FkZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuaXRlbXNMb2FkZXIoZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgbWVudUl0ZW1zOiBpdGVtcyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGkgPSAxO1xuICAgICAgICB2YXIgbWVudUl0ZW1zID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tZW51SXRlbXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbWVudUl0ZW1zID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnByb3BzLm1lbnVJdGVtcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVudUl0ZW1zID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnN0YXRlLm1lbnVJdGVtcykpO1xuICAgICAgICB9XG4gICAgICAgIG1lbnVJdGVtcy51bnNoaWZ0KF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiAnJywgcHJpbWFyeVRleHQ6ICcnIH0pKTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJzEwMCUnIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VTZWxlY3RvciB9LFxuICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBUYWdzQ2xvdWQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVGFnc0Nsb3VkJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZEZvcm1QYW5lbE1peGluXSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBub2RlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpLFxuICAgICAgICBjb2x1bW46IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB2YXIgbm9kZSA9IG5leHRQcm9wcy5ub2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBuZXh0UHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBjb2x1bW4gPSBuZXh0UHJvcHMuY29sdW1uO1xuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhZ3M6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5leHRQcm9wcy5lZGl0TW9kZSAmJiAhdGhpcy5zdGF0ZS5sb2FkZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFJlYWxWYWx1ZTogZnVuY3Rpb24gZ2V0UmVhbFZhbHVlKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzLnZhbHVlO1xuICAgICAgICB2YXIgY29sdW1uID0gX3Byb3BzLmNvbHVtbjtcblxuICAgICAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9wcm9wczIudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YVNvdXJjZTogW10sXG4gICAgICAgICAgICB0YWdzOiBub2RlID8gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKSA6IHZhbHVlLFxuICAgICAgICAgICAgc2VhcmNoVGV4dDogJydcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VnZ2VzdGlvbkxvYWRlcjogZnVuY3Rpb24gc3VnZ2VzdGlvbkxvYWRlcihjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdGhpcy5zdGF0ZS5sb2FkaW5nICsgMSB9KTtcblxuICAgICAgICBSZW5kZXJlci5nZXRDbGllbnQoKS5saXN0VGFncyh0aGlzLnByb3BzLmZpZWxkbmFtZSB8fCB0aGlzLnByb3BzLmNvbHVtbi5uYW1lKS50aGVuKGZ1bmN0aW9uICh0YWdzKSB7XG4gICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyBsb2FkaW5nOiBfdGhpczQuc3RhdGUubG9hZGluZyAtIDEgfSk7XG4gICAgICAgICAgICBjYWxsYmFjayh0YWdzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25Mb2FkZXIoKGZ1bmN0aW9uICh0YWdzKSB7XG4gICAgICAgICAgICB2YXIgY3J0VmFsdWVGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHRhZ3MubWFwKChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0YWcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb21wb25lbnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGF0YVNvdXJjZTogdmFsdWVzLCBsb2FkaW5nOiBmYWxzZSwgbG9hZGVkOiB0cnVlIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlUmVxdWVzdERlbGV0ZTogZnVuY3Rpb24gaGFuZGxlUmVxdWVzdERlbGV0ZSh0YWcpIHtcbiAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoJywnKTtcbiAgICAgICAgdmFyIGluZGV4ID0gdGFncy5pbmRleE9mKHRhZyk7XG4gICAgICAgIHRhZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YWdzOiB0YWdzLnRvU3RyaW5nKCkgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM1LnVwZGF0ZVZhbHVlKF90aGlzNS5zdGF0ZS50YWdzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZVVwZGF0ZUlucHV0OiBmdW5jdGlvbiBoYW5kbGVVcGRhdGVJbnB1dChzZWFyY2hUZXh0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0IH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVOZXdSZXF1ZXN0OiBmdW5jdGlvbiBoYW5kbGVOZXdSZXF1ZXN0KCkge1xuICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgICB2YXIgdGFncyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS50YWdzKSB7XG4gICAgICAgICAgICB0YWdzID0gdGhpcy5zdGF0ZS50YWdzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGFncy5wdXNoKHRoaXMuc3RhdGUuc2VhcmNoVGV4dCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGFnczogdGFncy50b1N0cmluZygpIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNi51cGRhdGVWYWx1ZShfdGhpczYuc3RhdGUudGFncyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXJDaGlwOiBmdW5jdGlvbiByZW5kZXJDaGlwKHRhZykge1xuICAgICAgICB2YXIgX2NvbG9yc0Zyb21TdHJpbmcgPSBjb2xvcnNGcm9tU3RyaW5nKHRhZyk7XG5cbiAgICAgICAgdmFyIGNvbG9yID0gX2NvbG9yc0Zyb21TdHJpbmcuY29sb3I7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kQ29sb3IgPSBfY29sb3JzRnJvbVN0cmluZy5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICAgICAgdmFyIGNoaXBTdHlsZSA9IHsgbWFyZ2luOiAyLCBib3JkZXJSYWRpdXM6ICc0cHggMTZweCAxNnB4IDRweCcgfTtcbiAgICAgICAgdmFyIGxhYmVsU3R5bGUgPSB7IGNvbG9yOiBjb2xvciwgZm9udFdlaWdodDogNTAwLCBwYWRkaW5nTGVmdDogMTAsIHBhZGRpbmdSaWdodDogMTYgfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5DaGlwLFxuICAgICAgICAgICAgICAgIHsga2V5OiB0YWcsIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZENvbG9yLCBsYWJlbFN0eWxlOiBsYWJlbFN0eWxlLCBzdHlsZTogY2hpcFN0eWxlLCBvblJlcXVlc3REZWxldGU6IHRoaXMuaGFuZGxlUmVxdWVzdERlbGV0ZS5iaW5kKHRoaXMsIHRhZykgfSxcbiAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2hpcCxcbiAgICAgICAgICAgICAgICB7IGtleTogdGFnLCBiYWNrZ3JvdW5kQ29sb3I6IGJhY2tncm91bmRDb2xvciwgbGFiZWxTdHlsZTogbGFiZWxTdHlsZSwgc3R5bGU6IGNoaXBTdHlsZSB9LFxuICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHRhZ3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRhZ3MpIHtcbiAgICAgICAgICAgIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoXCIsXCIpLm1hcCgoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgIHRhZyA9IExhbmdVdGlscy50cmltKHRhZywgJyAnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRhZykgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyQ2hpcCh0YWcpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWdzID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhdXRvQ29tcGxldGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgdGV4dEZpZWxkID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0TW9kZSkge1xuICAgICAgICAgICAgYXV0b0NvbXBsZXRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkF1dG9Db21wbGV0ZSwge1xuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaW50VGV4dDogcHlkaW8uTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xMCddLFxuICAgICAgICAgICAgICAgIHNlYXJjaFRleHQ6IHRoaXMuc3RhdGUuc2VhcmNoVGV4dCxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZUlucHV0OiB0aGlzLmhhbmRsZVVwZGF0ZUlucHV0LFxuICAgICAgICAgICAgICAgIG9uTmV3UmVxdWVzdDogdGhpcy5oYW5kbGVOZXdSZXF1ZXN0LFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IHRoaXMuc3RhdGUuZGF0YVNvdXJjZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWFyY2hUZXh0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSA9PT0gMDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wZW5PbkZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lbnVQcm9wczogeyBtYXhIZWlnaHQ6IDIwMCB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJyB9IH0sXG4gICAgICAgICAgICAgICAgdGFnc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZXJcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgVXNlck1ldGFEaWFsb2cgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVXNlck1ldGFEaWFsb2cnLFxuXG4gICAgcHJvcHNUeXBlczoge1xuICAgICAgICBzZWxlY3Rpb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihQeWRpb0RhdGFNb2RlbClcbiAgICB9LFxuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuQ2FuY2VsQnV0dG9uUHJvdmlkZXJNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLnJlZnMucGFuZWwuZ2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICB2YXIgcGFyYW1zID0ge307XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgICAgICBwYXJhbXNba10gPSB2O1xuICAgICAgICB9KTtcbiAgICAgICAgUmVuZGVyZXIuZ2V0Q2xpZW50KCkuc2F2ZU1ldGEodGhpcy5wcm9wcy5zZWxlY3Rpb24uZ2V0U2VsZWN0ZWROb2RlcygpLCB2YWx1ZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM3LmRpc21pc3MoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJNZXRhUGFuZWwsIHtcbiAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgbXVsdGlwbGU6ICF0aGlzLnByb3BzLnNlbGVjdGlvbi5pc1VuaXF1ZSgpLFxuICAgICAgICAgICAgcmVmOiAncGFuZWwnLFxuICAgICAgICAgICAgbm9kZTogdGhpcy5wcm9wcy5zZWxlY3Rpb24uaXNVbmlxdWUoKSA/IHRoaXMucHJvcHMuc2VsZWN0aW9uLmdldFVuaXF1ZU5vZGUoKSA6IG5ldyBBanhwTm9kZSgpLFxuICAgICAgICAgICAgZWRpdE1vZGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbnZhciBVc2VyTWV0YVBhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVzZXJNZXRhUGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVXNlck1ldGFQYW5lbChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXNlck1ldGFQYW5lbCk7XG5cbiAgICAgICAgaWYgKHByb3BzLmVkaXRNb2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHByb3BzLmVkaXRNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXNlck1ldGFQYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHVwZGF0ZU1ldGE6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGlzQ2hlY2tlZDogZmFsc2UsXG4gICAgICAgICAgICBmaWVsZHM6IFtdLFxuICAgICAgICAgICAgY29uZmlnczogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFVzZXJNZXRhUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzOCA9IHRoaXM7XG5cbiAgICAgICAgICAgIFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpczguc2V0U3RhdGUoeyBjb25maWdzOiBjb25maWdzIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZVZhbHVlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVZhbHVlKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVwZGF0ZU1ldGEuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU1ldGE6IHRoaXMuc3RhdGUudXBkYXRlTWV0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlbGV0ZVZhbHVlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlbGV0ZVZhbHVlKG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudXBkYXRlTWV0YVsnZGVsZXRlJ10obmFtZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cGRhdGVNZXRhOiB0aGlzLnN0YXRlLnVwZGF0ZU1ldGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRVcGRhdGVEYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFVwZGF0ZURhdGEoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS51cGRhdGVNZXRhO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXNldFVwZGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXRVcGRhdGVEYXRhKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBkYXRlTWV0YTogbmV3IE1hcCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25DaGVjaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkNoZWNrKGUsIGlzSW5wdXRDaGVja2VkLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHN0YXRlWydmaWVsZHMnXVtlLnRhcmdldC52YWx1ZV0gPSBpc0lucHV0Q2hlY2tlZDtcbiAgICAgICAgICAgIGlmIChpc0lucHV0Q2hlY2tlZCA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlVmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMuc3RhdGUuY29uZmlncztcblxuICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICAgICAgdmFyIG1ldGFkYXRhID0gdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCk7XG4gICAgICAgICAgICB2YXIgdXBkYXRlTWV0YSA9IHRoaXMuc3RhdGUudXBkYXRlTWV0YTtcbiAgICAgICAgICAgIHZhciBub25FbXB0eURhdGFDb3VudCA9IDA7XG4gICAgICAgICAgICB2YXIgaXNBZG1pbiA9IHB5ZGlvLnVzZXIuaXNBZG1pbjtcblxuICAgICAgICAgICAgY29uZmlncy5mb3JFYWNoKChmdW5jdGlvbiAobWV0YSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzOSA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVhZG9ubHkgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gbWV0YS5sYWJlbDtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IG1ldGEudHlwZTtcbiAgICAgICAgICAgICAgICB2YXIgd3JpdGVTdWJqZWN0ID0gbWV0YS53cml0ZVN1YmplY3Q7XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRTdWJqZWN0ID0gbWV0YS5yZWFkU3ViamVjdDtcblxuICAgICAgICAgICAgICAgIGlmIChyZWFkU3ViamVjdCA9PT0gJ3Byb2ZpbGU6YWRtaW4nICYmICFpc0FkbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHdyaXRlU3ViamVjdCA9PT0gJ3Byb2ZpbGU6YWRtaW4nICYmICFpc0FkbWluKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtZXRhZGF0YS5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlTWV0YS5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHVwZGF0ZU1ldGEuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZWFsVmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlICYmICFyZWFkb25seSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUHJvcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0NoZWNrZWQ6IHRoaXMuc3RhdGUuaXNDaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbHVlQ2hhbmdlOiB0aGlzLnVwZGF0ZVZhbHVlLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdGFyc19yYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTdGFyc0Zvcm1QYW5lbCwgYmFzZVByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2hvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxTZWxlY3RvckZpbHRlcihiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjc3NfbGFiZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlbmRlcmVyLmZvcm1QYW5lbENzc0xhYmVscyhiYXNlUHJvcHMsIGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd0YWdzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxUYWdzKGJhc2VQcm9wcywgY29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHJlYWRvbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzOS51cGRhdGVWYWx1ZShrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiLCBrZXk6IGtleSwgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgdmFsdWU6IGtleSwgbGFiZWw6IGxhYmVsLCBvbkNoZWNrOiB0aGlzLm9uQ2hlY2suYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlWydmaWVsZHMnXVtrZXldICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJpbmZvUGFuZWxSb3dcIiwga2V5OiBrZXkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsTGFiZWwnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29sdW1uID0geyBuYW1lOiBrZXkgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdGFyc19yYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU3RhcnNSZW5kZXJlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY3NzX2xhYmVsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChDU1NMYWJlbHNGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2VsZWN0b3JGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRhZ3NDbG91ZCwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhbFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub25FbXB0eURhdGFDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiaW5mb1BhbmVsUm93XCIgKyAoIXJlYWxWYWx1ZSA/ICcgbm8tdmFsdWUnIDogJycpLCBrZXk6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxMYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuZWRpdE1vZGUgJiYgIW5vbkVtcHR5RGF0YUNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMjMpJywgcGFkZGluZ0JvdHRvbTogMTAgfSwgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5vblJlcXVlc3RFZGl0TW9kZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjExJ11cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBsZWdlbmQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2VtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NbJ21ldGEudXNlci4xMiddXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjEzJ11cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBvdmVyZmxvd1k6ICdzY3JvbGwnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kLFxuICAgICAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVc2VyTWV0YVBhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBJbmZvUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKEluZm9QYW5lbCwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gSW5mb1BhbmVsKHByb3BzKSB7XG4gICAgICAgIHZhciBfdGhpczEwID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5mb1BhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihJbmZvUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IGVkaXRNb2RlOiBmYWxzZSB9O1xuICAgICAgICB0aGlzLl9ub2RlT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMxMC5yZWZzLnBhbmVsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMxMC5yZWZzLnBhbmVsLnJlc2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMxMC5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBmYWxzZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMxMC5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChwcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICBwcm9wcy5ub2RlLm9ic2VydmUoJ25vZGVfcmVwbGFjZWQnLCB0aGlzLl9ub2RlT2JzZXJ2ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEluZm9QYW5lbCwgW3tcbiAgICAgICAga2V5OiAnb3BlbkVkaXRNb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5FZGl0TW9kZSgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVzZXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgICAgICB0aGlzLnJlZnMucGFuZWwucmVzZXRVcGRhdGVEYXRhKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5vZGUuc3RvcE9ic2VydmluZygnbm9kZV9yZXBsYWNlZCcsIHRoaXMuX25vZGVPYnNlcnZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmV3UHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlICYmIHRoaXMucmVmcy5wYW5lbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgICAgICBuZXdQcm9wcy5ub2RlLm9ic2VydmUoJ25vZGVfcmVwbGFjZWQnLCB0aGlzLl9ub2RlT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm5vZGUuc3RvcE9ic2VydmluZygnbm9kZV9yZXBsYWNlZCcsIHRoaXMuX25vZGVPYnNlcnZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NhdmVDaGFuZ2VzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNhdmVDaGFuZ2VzKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTEgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5yZWZzLnBhbmVsLmdldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zW2tdID0gdjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgUmVuZGVyZXIuZ2V0Q2xpZW50KCkuc2F2ZU1ldGEodGhpcy5wcm9wcy5weWRpby5nZXRDb250ZXh0SG9sZGVyKCkuZ2V0U2VsZWN0ZWROb2RlcygpLCB2YWx1ZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMTEucmVzZXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogTWVzc2FnZUhhc2hbJzU0J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTIucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuaGFzKCdub2RlX3JlYWRvbmx5JykpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuc3RhdGUuZWRpdE1vZGUgPyBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjE1J10gOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjE0J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICFfdGhpczEyLnN0YXRlLmVkaXRNb2RlID8gX3RoaXMxMi5vcGVuRWRpdE1vZGUoKSA6IF90aGlzMTIuc2F2ZUNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgIHsgaWRlbnRpZmllcjogXCJtZXRhLXVzZXJcIiwgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUsIHRpdGxlOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMSddLCBhY3Rpb25zOiBhY3Rpb25zLmxlbmd0aCA/IGFjdGlvbnMgOiBudWxsLCBpY29uOiAndGFnLW11bHRpcGxlJywgaWNvbkNvbG9yOiAnIzAwQUNDMScgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyTWV0YVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ3BhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZTogdGhpcy5wcm9wcy5ub2RlLFxuICAgICAgICAgICAgICAgICAgICBlZGl0TW9kZTogdGhpcy5zdGF0ZS5lZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0RWRpdE1vZGU6IHRoaXMub3BlbkVkaXRNb2RlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbmV4cG9ydHMuSW5mb1BhbmVsID0gSW5mb1BhbmVsO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLlVzZXJNZXRhRGlhbG9nID0gVXNlck1ldGFEaWFsb2c7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcblxuZXhwb3J0cy5SZW5kZXJlciA9IF9jb21wb25lbnRzLlJlbmRlcmVyO1xuZXhwb3J0cy5JbmZvUGFuZWwgPSBfY29tcG9uZW50cy5JbmZvUGFuZWw7XG5leHBvcnRzLkNhbGxiYWNrcyA9IF9jb21wb25lbnRzLkNhbGxiYWNrcztcbmV4cG9ydHMuVXNlck1ldGFEaWFsb2cgPSBfY29tcG9uZW50cy5Vc2VyTWV0YURpYWxvZztcbiJdfQ==
