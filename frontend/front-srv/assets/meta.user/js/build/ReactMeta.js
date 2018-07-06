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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _MetaClient = require('./MetaClient');

var _MetaClient2 = _interopRequireDefault(_MetaClient);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

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
            return _react2['default'].createElement(MetaStarsRenderer, { node: node, column: column, size: 'small' });
        }
    }, {
        key: 'renderSelector',
        value: function renderSelector(node, column) {
            return _react2['default'].createElement(SelectorFilter, { node: node, column: column });
        }
    }, {
        key: 'renderCSSLabel',
        value: function renderCSSLabel(node, column) {
            return _react2['default'].createElement(CSSLabelsFilter, { node: node, column: column });
        }
    }, {
        key: 'renderTagsCloud',
        value: function renderTagsCloud(node, column) {
            return _react2['default'].createElement(
                'span',
                null,
                node.getMetadata().get(column.name)
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
        var chipStyle = { margin: 2, backgroundColor: '#F5F5F5' };
        if (this.props.editMode) {
            return _react2['default'].createElement(
                _materialUi.Chip,
                { key: tag, style: chipStyle, onRequestDelete: this.handleRequestDelete.bind(this, tag) },
                tag
            );
        } else {
            return _react2['default'].createElement(
                _materialUi.Chip,
                { key: tag, style: chipStyle },
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
        _classCallCheck(this, InfoPanel);

        _get(Object.getPrototypeOf(InfoPanel.prototype), 'constructor', this).call(this, props);
        this.state = { editMode: false };
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
            if (newProps.node !== this.props.node && this.refs.panel) {
                this.reset();
            }
        }
    }, {
        key: 'saveChanges',
        value: function saveChanges() {
            var _this10 = this;

            var values = this.refs.panel.getUpdateData();
            var params = {};
            values.forEach(function (v, k) {
                params[k] = v;
            });
            Renderer.getClient().saveMeta(this.props.pydio.getContextHolder().getSelectedNodes(), values).then(function () {
                _this10.reset();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this11 = this;

            var actions = [];
            var MessageHash = this.props.pydio.MessageHash;

            if (this.state.editMode) {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'cancel',
                    label: MessageHash['54'],
                    onClick: function () {
                        _this11.reset();
                    }
                }));
            }
            if (!this.props.node.getMetadata().has('node_readonly')) {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'edit',
                    label: this.state.editMode ? MessageHash['meta.user.15'] : MessageHash['meta.user.14'],
                    onClick: function () {
                        !_this11.state.editMode ? _this11.openEditMode() : _this11.saveChanges();
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

},{"./MetaClient":1,"material-ui":"material-ui","react":"react"}],3:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9NZXRhQ2xpZW50LmpzIiwianMvYnVpbGQvY29tcG9uZW50cy5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2g1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbE5vZGUpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBNZXRhQ2xpZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNZXRhQ2xpZW50KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWV0YUNsaWVudCk7XG5cbiAgICAgICAgdGhpcy5jbGllbnQgPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIG1ldGFzIHRvIHNlcnZlclxuICAgICAqIEBwYXJhbSBub2RlcyBbe05vZGV9XVxuICAgICAqIEBwYXJhbSB2YWx1ZXMge09iamVjdH1cbiAgICAgKi9cblxuICAgIF9jcmVhdGVDbGFzcyhNZXRhQ2xpZW50LCBbe1xuICAgICAgICBrZXk6ICdzYXZlTWV0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlTWV0YShub2RlcywgdmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlVzZXJNZXRhU2VydmljZUFwaSh0aGlzLmNsaWVudCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmxvYWRDb25maWdzKCkudGhlbihmdW5jdGlvbiAoY29uZmlncykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5JZG1VcGRhdGVVc2VyTWV0YVJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuTWV0YURhdGFzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk9wZXJhdGlvbiA9ICdQVVQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjRGF0YSwgY05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5oYXMoY05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1ldGEgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuSWRtVXNlck1ldGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLk5vZGVVdWlkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldChcInV1aWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS5OYW1lc3BhY2UgPSBjTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLkpzb25WYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlcy5nZXQoY05hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLlBvbGljaWVzID0gW19weWRpb0h0dHBSZXN0QXBpLlNlcnZpY2VSZXNvdXJjZVBvbGljeS5jb25zdHJ1Y3RGcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWN0aW9uOiAnUkVBRCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN1YmplY3Q6ICcqJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRWZmZWN0OiAnYWxsb3cnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIF9weWRpb0h0dHBSZXN0QXBpLlNlcnZpY2VSZXNvdXJjZVBvbGljeS5jb25zdHJ1Y3RGcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWN0aW9uOiAnV1JJVEUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdWJqZWN0OiAnKicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ2FsbG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Lk1ldGFEYXRhcy5wdXNoKG1ldGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoY05hbWUsIHZhbHVlcy5nZXQoY05hbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChhcGkudXBkYXRlVXNlck1ldGEocmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubm90aWZ5KCdub2RlX3JlcGxhY2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBQcm9taXNlLmFsbChwcm9tcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NsZWFyQ29uZmlncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckNvbmZpZ3MoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3MgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2U8TWFwPn1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkQ29uZmlncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQ29uZmlncygpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWdzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmNvbmZpZ3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvbWlzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVmcyA9IHt9O1xuICAgICAgICAgICAgICAgIHZhciBjb25maWdNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Vc2VyTWV0YVNlcnZpY2VBcGkoX3RoaXMyLmNsaWVudCk7XG4gICAgICAgICAgICAgICAgYXBpLmxpc3RVc2VyTWV0YU5hbWVzcGFjZSgpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuTmFtZXNwYWNlcy5tYXAoZnVuY3Rpb24gKG5zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG5zLk5hbWVzcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiYXNlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBucy5MYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleGFibGU6IG5zLkluZGV4YWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogbnMuT3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChucy5Kc29uRGVmaW5pdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBqRGVmID0gSlNPTi5wYXJzZShucy5Kc29uRGVmaW5pdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpEZWYpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVtrXSA9IGpEZWZba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnMuUG9saWNpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBucy5Qb2xpY2llcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHAuQWN0aW9uID09PSAnUkVBRCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VbJ3JlYWRTdWJqZWN0J10gPSBwLlN1YmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocC5BY3Rpb24gPT09ICdXUklURScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VbJ3dyaXRlU3ViamVjdCddID0gcC5TdWJqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZzW25hbWVdID0gYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnJDb25maWdzID0gT2JqZWN0LmVudHJpZXMoZGVmcykubWFwKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlbMV0ubnMgPSBlbnRyeVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRyeVsxXTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFyckNvbmZpZ3Muc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9yZGVyQSA9IGEub3JkZXIgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvcmRlckIgPSBiLm9yZGVyIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3JkZXJBID4gb3JkZXJCID8gMSA6IG9yZGVyQSA9PT0gb3JkZXJCID8gMCA6IC0xO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYXJyQ29uZmlncy5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHZhbHVlLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Nob2ljZScgJiYgdmFsdWUuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGEuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbiAoa2V5TGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IGtleUxhYmVsLnNwbGl0KFwifFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcy5zZXQocGFydHNbMF0sIHBhcnRzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGEgPSB2YWx1ZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ01hcC5zZXQodmFsdWUubnMsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5jb25maWdzID0gY29uZmlnTWFwO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNvbmZpZ01hcCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IE1hcCgpKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIG5hbWVzcGFjZSBTdHJpbmdcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZTxBcnJheT59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbGlzdFRhZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbGlzdFRhZ3MobmFtZXNwYWNlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlVzZXJNZXRhU2VydmljZUFwaShfdGhpczMuY2xpZW50KTtcbiAgICAgICAgICAgICAgICBhcGkubGlzdFVzZXJNZXRhVGFncyhuYW1lc3BhY2UpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5UYWdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLlRhZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lc3BhY2Ugc3RyaW5nXG4gICAgICAgICAqIEBwYXJhbSBuZXdUYWcgc3RyaW5nXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY3JlYXRlVGFnJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZVRhZyhuYW1lc3BhY2UsIG5ld1RhZykge1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlVzZXJNZXRhU2VydmljZUFwaSh0aGlzLmNsaWVudCk7XG4gICAgICAgICAgICByZXR1cm4gYXBpLnB1dFVzZXJNZXRhVGFnKG5hbWVzcGFjZSwgX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFB1dFVzZXJNZXRhVGFnUmVxdWVzdC5jb25zdHJ1Y3RGcm9tT2JqZWN0KHtcbiAgICAgICAgICAgICAgICBOYW1lc3BhY2U6IG5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICBUYWc6IG5ld1RhZ1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE1ldGFDbGllbnQ7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNZXRhQ2xpZW50O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gyLCBfeDMsIF94NCkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDIsIHByb3BlcnR5ID0gX3gzLCByZWNlaXZlciA9IF94NDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDIgPSBwYXJlbnQ7IF94MyA9IHByb3BlcnR5OyBfeDQgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX01ldGFDbGllbnQgPSByZXF1aXJlKCcuL01ldGFDbGllbnQnKTtcblxudmFyIF9NZXRhQ2xpZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX01ldGFDbGllbnQpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBSZW5kZXJlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUmVuZGVyZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZW5kZXJlcik7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFJlbmRlcmVyLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdnZXRNZXRhZGF0YUNvbmZpZ3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWV0YWRhdGFDb25maWdzKCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlbmRlcmVyLmdldENsaWVudCgpLmxvYWRDb25maWdzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybiB7TWV0YUNsaWVudH1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRDbGllbnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2xpZW50KCkge1xuICAgICAgICAgICAgaWYgKCFSZW5kZXJlci5DbGllbnQpIHtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5DbGllbnQgPSBuZXcgX01ldGFDbGllbnQyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJlci5DbGllbnQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlclN0YXJzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlclN0YXJzKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTdGFyc1JlbmRlcmVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uLCBzaXplOiAnc21hbGwnIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJTZWxlY3RvcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJTZWxlY3Rvcihub2RlLCBjb2x1bW4pIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTZWxlY3RvckZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyQ1NTTGFiZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyQ1NTTGFiZWwobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQ1NTTGFiZWxzRmlsdGVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJUYWdzQ2xvdWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyVGFnc0Nsb3VkKG5vZGUsIGNvbHVtbikge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxTdGFycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxTdGFycyhwcm9wcykge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFN0YXJzRm9ybVBhbmVsLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbENzc0xhYmVscycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxDc3NMYWJlbHMocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IE9iamVjdC5rZXlzKENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTKS5tYXAoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTW2lkXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IGlkLCBwcmltYXJ5VGV4dDogbGFiZWwubGFiZWwgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTZWxlY3RvckZvcm1QYW5lbCwgX2V4dGVuZHMoe30sIHByb3BzLCB7IG1lbnVJdGVtczogbWVudUl0ZW1zIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsU2VsZWN0b3JGaWx0ZXIocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zTG9hZGVyID0gZnVuY3Rpb24gaXRlbXNMb2FkZXIoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChtZXRhQ29uZmlncykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29uZmlncyA9IG1ldGFDb25maWdzLmdldChwcm9wcy5maWVsZG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWdzICYmIGNvbmZpZ3MuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlncy5kYXRhLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobWVudUl0ZW1zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNZXRhU2VsZWN0b3JGb3JtUGFuZWwsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBtZW51SXRlbXM6IFtdLCBpdGVtc0xvYWRlcjogaXRlbXNMb2FkZXIgfSkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFRhZ3MocHJvcHMpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUYWdzQ2xvdWQsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBlZGl0TW9kZTogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVuZGVyZXI7XG59KSgpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2VkaXRNZXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRNZXRhKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1JlYWN0TWV0YScsICdVc2VyTWV0YURpYWxvZycsIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dUaXRsZUlkOiA0ODksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiBweWRpby5nZXRVc2VyU2VsZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBNZXRhRmllbGRGb3JtUGFuZWxNaXhpbiA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsYWJlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGZpZWxkbmFtZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgY29uZmlnczogbmV3IE1hcCgpIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBSZW5kZXJlci5nZXRNZXRhZGF0YUNvbmZpZ3MoKS50aGVuKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGMgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZTogZnVuY3Rpb24gdXBkYXRlVmFsdWUodmFsdWUpIHtcbiAgICAgICAgdmFyIHN1Ym1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICAgICAgICAgIG9iamVjdFsnYWp4cF9tZXRhXycgKyB0aGlzLnByb3BzLmZpZWxkbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2Uob2JqZWN0LCBzdWJtaXQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMub25WYWx1ZUNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbHVlQ2hhbmdlKHRoaXMucHJvcHMuZmllbGRuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn07XG5cbnZhciBNZXRhRmllbGRSZW5kZXJlck1peGluID0ge1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG5vZGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihBanhwTm9kZSksXG4gICAgICAgIGNvbHVtbjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB8fCAwLFxuICAgICAgICAgICAgY29uZmlnczogbmV3IE1hcCgpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCkudGhlbihmdW5jdGlvbiAoY29uZmlncykge1xuICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgY29uZmlnczogY29uZmlncyB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldFJlYWxWYWx1ZTogZnVuY3Rpb24gZ2V0UmVhbFZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuZ2V0KHRoaXMucHJvcHMuY29sdW1uLm5hbWUpO1xuICAgIH1cblxufTtcblxudmFyIHN0YXJzU3R5bGUgPSB7IGZvbnRTaXplOiAyMCwgY29sb3I6ICcjRkJDMDJEJyB9O1xuXG52YXIgU3RhcnNGb3JtUGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU3RhcnNGb3JtUGFuZWwnLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIHx8IDAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIHZhciBzdGFycyA9IFstMSwgMCwgMSwgMiwgMywgNF0ubWFwKChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgdmFyIGljID0gJ3N0YXInICsgKHYgPT09IC0xID8gJy1vZmYnIDogdmFsdWUgPiB2ID8gJycgOiAnLW91dGxpbmUnKTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IHYgPT09IC0xID8geyBtYXJnaW5SaWdodDogNSwgY3Vyc29yOiAncG9pbnRlcicgfSA6IHsgY3Vyc29yOiAncG9pbnRlcicgfTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiBcInN0YXItXCIgKyB2LCBvbkNsaWNrOiB0aGlzLnVwZGF0ZVZhbHVlLmJpbmQodGhpcywgdiArIDEpLCBjbGFzc05hbWU6IFwibWRpIG1kaS1cIiArIGljLCBzdHlsZTogc3R5bGUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnYWR2YW5jZWQtc2VhcmNoLXN0YXJzJywgc3R5bGU6IHN0YXJzU3R5bGUgfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgc3RhcnNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgTWV0YVN0YXJzUmVuZGVyZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVN0YXJzUmVuZGVyZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKSB8fCAwO1xuICAgICAgICB2YXIgc3RhcnMgPSBbMCwgMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogXCJzdGFyLVwiICsgdiwgY2xhc3NOYW1lOiBcIm1kaSBtZGktc3RhclwiICsgKHZhbHVlID4gdiA/ICcnIDogJy1vdXRsaW5lJykgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgc3R5bGUgPSB0aGlzLnByb3BzLnNpemUgPT09ICdzbWFsbCcgPyB7IGNvbG9yOiBzdGFyc1N0eWxlLmNvbG9yIH0gOiBzdGFyc1N0eWxlO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICB7IHN0eWxlOiBzdHlsZSB9LFxuICAgICAgICAgICAgc3RhcnNcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgU2VsZWN0b3JGaWx0ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU2VsZWN0b3JGaWx0ZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnN0YXRlLmNvbmZpZ3M7XG5cbiAgICAgICAgdmFyIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgZGlzcGxheVZhbHVlID0gdmFsdWUgPSB0aGlzLmdldFJlYWxWYWx1ZSgpO1xuICAgICAgICB2YXIgZmllbGRDb25maWcgPSBjb25maWdzLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKTtcbiAgICAgICAgaWYgKGZpZWxkQ29uZmlnICYmIGZpZWxkQ29uZmlnLmRhdGEpIHtcbiAgICAgICAgICAgIGRpc3BsYXlWYWx1ZSA9IGZpZWxkQ29uZmlnLmRhdGEuZ2V0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgZGlzcGxheVZhbHVlXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIENTU0xhYmVsc0ZpbHRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdDU1NMYWJlbHNGaWx0ZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIENTU19MQUJFTFM6IHtcbiAgICAgICAgICAgICdsb3cnOiB7IGxhYmVsOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjQnXSwgc29ydFZhbHVlOiAnNScsIGNvbG9yOiAnIzY2YycgfSxcbiAgICAgICAgICAgICd0b2RvJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci41J10sIHNvcnRWYWx1ZTogJzQnLCBjb2xvcjogJyM2OWMnIH0sXG4gICAgICAgICAgICAncGVyc29uYWwnOiB7IGxhYmVsOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjYnXSwgc29ydFZhbHVlOiAnMycsIGNvbG9yOiAnIzZjNicgfSxcbiAgICAgICAgICAgICd3b3JrJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci43J10sIHNvcnRWYWx1ZTogJzInLCBjb2xvcjogJyNjOTYnIH0sXG4gICAgICAgICAgICAnaW1wb3J0YW50JzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci44J10sIHNvcnRWYWx1ZTogJzEnLCBjb2xvcjogJyNjNjYnIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKTtcbiAgICAgICAgdmFyIGRhdGEgPSBDU1NMYWJlbHNGaWx0ZXIuQ1NTX0xBQkVMUztcbiAgICAgICAgaWYgKHZhbHVlICYmIGRhdGFbdmFsdWVdKSB7XG4gICAgICAgICAgICB2YXIgZFYgPSBkYXRhW3ZhbHVlXTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1sYWJlbCcsIHN0eWxlOiB7IGNvbG9yOiBkVi5jb2xvciB9IH0pLFxuICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICBkVi5sYWJlbFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5cbnZhciBNZXRhU2VsZWN0b3JGb3JtUGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVNlbGVjdG9yRm9ybVBhbmVsJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZEZvcm1QYW5lbE1peGluXSxcblxuICAgIGNoYW5nZVNlbGVjdG9yOiBmdW5jdGlvbiBjaGFuZ2VTZWxlY3RvcihlLCBzZWxlY3RlZEluZGV4LCBwYXlsb2FkKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmFsdWUocGF5bG9hZCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXRlbXNMb2FkZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuaXRlbXNMb2FkZXIoZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgbWVudUl0ZW1zOiBpdGVtcyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGkgPSAxO1xuICAgICAgICB2YXIgbWVudUl0ZW1zID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5tZW51SXRlbXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbWVudUl0ZW1zID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnByb3BzLm1lbnVJdGVtcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVudUl0ZW1zID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnN0YXRlLm1lbnVJdGVtcykpO1xuICAgICAgICB9XG4gICAgICAgIG1lbnVJdGVtcy51bnNoaWZ0KF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiAnJywgcHJpbWFyeVRleHQ6ICcnIH0pKTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJzEwMCUnIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VTZWxlY3RvciB9LFxuICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBUYWdzQ2xvdWQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVGFnc0Nsb3VkJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZEZvcm1QYW5lbE1peGluXSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBub2RlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpLFxuICAgICAgICBjb2x1bW46IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB2YXIgbm9kZSA9IG5leHRQcm9wcy5ub2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBuZXh0UHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBjb2x1bW4gPSBuZXh0UHJvcHMuY29sdW1uO1xuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhZ3M6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5leHRQcm9wcy5lZGl0TW9kZSAmJiAhdGhpcy5zdGF0ZS5sb2FkZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFJlYWxWYWx1ZTogZnVuY3Rpb24gZ2V0UmVhbFZhbHVlKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzLnZhbHVlO1xuICAgICAgICB2YXIgY29sdW1uID0gX3Byb3BzLmNvbHVtbjtcblxuICAgICAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9wcm9wczIudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YVNvdXJjZTogW10sXG4gICAgICAgICAgICB0YWdzOiBub2RlID8gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKSA6IHZhbHVlLFxuICAgICAgICAgICAgc2VhcmNoVGV4dDogJydcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VnZ2VzdGlvbkxvYWRlcjogZnVuY3Rpb24gc3VnZ2VzdGlvbkxvYWRlcihjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdGhpcy5zdGF0ZS5sb2FkaW5nICsgMSB9KTtcblxuICAgICAgICBSZW5kZXJlci5nZXRDbGllbnQoKS5saXN0VGFncyh0aGlzLnByb3BzLmZpZWxkbmFtZSB8fCB0aGlzLnByb3BzLmNvbHVtbi5uYW1lKS50aGVuKGZ1bmN0aW9uICh0YWdzKSB7XG4gICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyBsb2FkaW5nOiBfdGhpczQuc3RhdGUubG9hZGluZyAtIDEgfSk7XG4gICAgICAgICAgICBjYWxsYmFjayh0YWdzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25Mb2FkZXIoKGZ1bmN0aW9uICh0YWdzKSB7XG4gICAgICAgICAgICB2YXIgY3J0VmFsdWVGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IHRhZ3MubWFwKChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0YWcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb21wb25lbnRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGF0YVNvdXJjZTogdmFsdWVzLCBsb2FkaW5nOiBmYWxzZSwgbG9hZGVkOiB0cnVlIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgaGFuZGxlUmVxdWVzdERlbGV0ZTogZnVuY3Rpb24gaGFuZGxlUmVxdWVzdERlbGV0ZSh0YWcpIHtcbiAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoJywnKTtcbiAgICAgICAgdmFyIGluZGV4ID0gdGFncy5pbmRleE9mKHRhZyk7XG4gICAgICAgIHRhZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YWdzOiB0YWdzLnRvU3RyaW5nKCkgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM1LnVwZGF0ZVZhbHVlKF90aGlzNS5zdGF0ZS50YWdzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZVVwZGF0ZUlucHV0OiBmdW5jdGlvbiBoYW5kbGVVcGRhdGVJbnB1dChzZWFyY2hUZXh0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0IH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVOZXdSZXF1ZXN0OiBmdW5jdGlvbiBoYW5kbGVOZXdSZXF1ZXN0KCkge1xuICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgICB2YXIgdGFncyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS50YWdzKSB7XG4gICAgICAgICAgICB0YWdzID0gdGhpcy5zdGF0ZS50YWdzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGFncy5wdXNoKHRoaXMuc3RhdGUuc2VhcmNoVGV4dCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGFnczogdGFncy50b1N0cmluZygpIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNi51cGRhdGVWYWx1ZShfdGhpczYuc3RhdGUudGFncyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXJDaGlwOiBmdW5jdGlvbiByZW5kZXJDaGlwKHRhZykge1xuICAgICAgICB2YXIgY2hpcFN0eWxlID0geyBtYXJnaW46IDIsIGJhY2tncm91bmRDb2xvcjogJyNGNUY1RjUnIH07XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2hpcCxcbiAgICAgICAgICAgICAgICB7IGtleTogdGFnLCBzdHlsZTogY2hpcFN0eWxlLCBvblJlcXVlc3REZWxldGU6IHRoaXMuaGFuZGxlUmVxdWVzdERlbGV0ZS5iaW5kKHRoaXMsIHRhZykgfSxcbiAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuQ2hpcCxcbiAgICAgICAgICAgICAgICB7IGtleTogdGFnLCBzdHlsZTogY2hpcFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgdGFnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgdGFncyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudGFncykge1xuICAgICAgICAgICAgdGFncyA9IHRoaXMuc3RhdGUudGFncy5zcGxpdChcIixcIikubWFwKChmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICAgICAgICAgdGFnID0gTGFuZ1V0aWxzLnRyaW0odGFnLCAnICcpO1xuICAgICAgICAgICAgICAgIGlmICghdGFnKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJDaGlwKHRhZyk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhZ3MgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF1dG9Db21wbGV0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciB0ZXh0RmllbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQXV0b0NvbXBsZXRlLCB7XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBweWRpby5NZXNzYWdlSGFzaFsnbWV0YS51c2VyLjEwJ10sXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dDogdGhpcy5zdGF0ZS5zZWFyY2hUZXh0LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlSW5wdXQ6IHRoaXMuaGFuZGxlVXBkYXRlSW5wdXQsXG4gICAgICAgICAgICAgICAgb25OZXdSZXF1ZXN0OiB0aGlzLmhhbmRsZU5ld1JlcXVlc3QsXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZTogdGhpcy5zdGF0ZS5kYXRhU291cmNlLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKHNlYXJjaFRleHQsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXV0b0NvbXBsZXRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnIH0gfSxcbiAgICAgICAgICAgICAgICB0YWdzXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYXV0b0NvbXBsZXRlclxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBVc2VyTWV0YURpYWxvZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdVc2VyTWV0YURpYWxvZycsXG5cbiAgICBwcm9wc1R5cGVzOiB7XG4gICAgICAgIHNlbGVjdGlvbjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKFB5ZGlvRGF0YU1vZGVsKVxuICAgIH0sXG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5DYW5jZWxCdXR0b25Qcm92aWRlck1peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzNyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMucmVmcy5wYW5lbC5nZXRVcGRhdGVEYXRhKCk7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgIHBhcmFtc1trXSA9IHY7XG4gICAgICAgIH0pO1xuICAgICAgICBSZW5kZXJlci5nZXRDbGllbnQoKS5zYXZlTWV0YSh0aGlzLnByb3BzLnNlbGVjdGlvbi5nZXRTZWxlY3RlZE5vZGVzKCksIHZhbHVlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczcuZGlzbWlzcygpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVXNlck1ldGFQYW5lbCwge1xuICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICBtdWx0aXBsZTogIXRoaXMucHJvcHMuc2VsZWN0aW9uLmlzVW5pcXVlKCksXG4gICAgICAgICAgICByZWY6ICdwYW5lbCcsXG4gICAgICAgICAgICBub2RlOiB0aGlzLnByb3BzLnNlbGVjdGlvbi5pc1VuaXF1ZSgpID8gdGhpcy5wcm9wcy5zZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpIDogbmV3IEFqeHBOb2RlKCksXG4gICAgICAgICAgICBlZGl0TW9kZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxudmFyIFVzZXJNZXRhUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVXNlck1ldGFQYW5lbCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVc2VyTWV0YVBhbmVsKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyTWV0YVBhbmVsKTtcblxuICAgICAgICBpZiAocHJvcHMuZWRpdE1vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvcHMuZWRpdE1vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihVc2VyTWV0YVBhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdXBkYXRlTWV0YTogbmV3IE1hcCgpLFxuICAgICAgICAgICAgaXNDaGVja2VkOiBmYWxzZSxcbiAgICAgICAgICAgIGZpZWxkczogW10sXG4gICAgICAgICAgICBjb25maWdzOiBuZXcgTWFwKClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXNlck1ldGFQYW5lbCwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM4ID0gdGhpcztcblxuICAgICAgICAgICAgUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCkudGhlbihmdW5jdGlvbiAoY29uZmlncykge1xuICAgICAgICAgICAgICAgIF90aGlzOC5zZXRTdGF0ZSh7IGNvbmZpZ3M6IGNvbmZpZ3MgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlVmFsdWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlVmFsdWUobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudXBkYXRlTWV0YS5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBkYXRlTWV0YTogdGhpcy5zdGF0ZS51cGRhdGVNZXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVsZXRlVmFsdWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlVmFsdWUobmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS51cGRhdGVNZXRhWydkZWxldGUnXShuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwZGF0ZU1ldGE6IHRoaXMuc3RhdGUudXBkYXRlTWV0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFVwZGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VXBkYXRlRGF0YSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnVwZGF0ZU1ldGE7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc2V0VXBkYXRlRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldFVwZGF0ZURhdGEoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cGRhdGVNZXRhOiBuZXcgTWFwKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkNoZWNrJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uQ2hlY2soZSwgaXNJbnB1dENoZWNrZWQsIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgc3RhdGVbJ2ZpZWxkcyddW2UudGFyZ2V0LnZhbHVlXSA9IGlzSW5wdXRDaGVja2VkO1xuICAgICAgICAgICAgaWYgKGlzSW5wdXRDaGVja2VkID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVWYWx1ZShlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5zdGF0ZS5jb25maWdzO1xuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgICAgICB2YXIgbWV0YWRhdGEgPSB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoKTtcbiAgICAgICAgICAgIHZhciB1cGRhdGVNZXRhID0gdGhpcy5zdGF0ZS51cGRhdGVNZXRhO1xuICAgICAgICAgICAgdmFyIG5vbkVtcHR5RGF0YUNvdW50ID0gMDtcbiAgICAgICAgICAgIHZhciBpc0FkbWluID0gcHlkaW8udXNlci5pc0FkbWluO1xuXG4gICAgICAgICAgICBjb25maWdzLmZvckVhY2goKGZ1bmN0aW9uIChtZXRhLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXM5ID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHZhciByZWFkb25seSA9IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBtZXRhLmxhYmVsO1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gbWV0YS50eXBlO1xuICAgICAgICAgICAgICAgIHZhciB3cml0ZVN1YmplY3QgPSBtZXRhLndyaXRlU3ViamVjdDtcbiAgICAgICAgICAgICAgICB2YXIgcmVhZFN1YmplY3QgPSBtZXRhLnJlYWRTdWJqZWN0O1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlYWRTdWJqZWN0ID09PSAncHJvZmlsZTphZG1pbicgJiYgIWlzQWRtaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAod3JpdGVTdWJqZWN0ID09PSAncHJvZmlsZTphZG1pbicgJiYgIWlzQWRtaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG1ldGFkYXRhLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVNZXRhLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdXBkYXRlTWV0YS5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlYWxWYWx1ZSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdE1vZGUgJiYgIXJlYWRvbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWVsZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2VQcm9wcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQ2hlY2tlZDogdGhpcy5zdGF0ZS5pc0NoZWNrZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsdWVDaGFuZ2U6IHRoaXMudXBkYXRlVmFsdWUuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3N0YXJzX3JhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFN0YXJzRm9ybVBhbmVsLCBiYXNlUHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjaG9pY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlbmRlcmVyLmZvcm1QYW5lbFNlbGVjdG9yRmlsdGVyKGJhc2VQcm9wcywgY29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nzc19sYWJlbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gUmVuZGVyZXIuZm9ybVBhbmVsQ3NzTGFiZWxzKGJhc2VQcm9wcywgY29uZmlncyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlbmRlcmVyLmZvcm1QYW5lbFRhZ3MoYmFzZVByb3BzLCBjb25maWdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogcmVhZG9ubHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM5LnVwZGF0ZVZhbHVlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm11bHRpcGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiaW5mb1BhbmVsUm93XCIsIGtleToga2V5LCBzdHlsZTogeyBtYXJnaW5Cb3R0b206IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyB2YWx1ZToga2V5LCBsYWJlbDogbGFiZWwsIG9uQ2hlY2s6IHRoaXMub25DaGVjay5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGVbJ2ZpZWxkcyddW2tleV0gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2luZm9QYW5lbFZhbHVlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiLCBrZXk6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxMYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2x1bW4gPSB7IG5hbWU6IGtleSB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3N0YXJzX3JhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1ldGFTdGFyc1JlbmRlcmVyLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjc3NfbGFiZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KENTU0xhYmVsc0ZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2hvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTZWxlY3RvckZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVGFnc0Nsb3VkLCB7IG5vZGU6IG5vZGUsIGNvbHVtbjogY29sdW1uIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vbkVtcHR5RGF0YUNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJpbmZvUGFuZWxSb3dcIiArICghcmVhbFZhbHVlID8gJyBuby12YWx1ZScgOiAnJyksIGtleToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2luZm9QYW5lbExhYmVsJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHZhciBtZXNzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5lZGl0TW9kZSAmJiAhbm9uRW1wdHlEYXRhQ291bnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC4yMyknLCBwYWRkaW5nQm90dG9tOiAxMCB9LCBvblRvdWNoVGFwOiB0aGlzLnByb3BzLm9uUmVxdWVzdEVkaXRNb2RlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnVzZXIuMTEnXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlZ2VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZW0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjEyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnVzZXIuMTMnXVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIG92ZXJmbG93WTogJ3Njcm9sbCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVzZXJNZXRhUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIEluZm9QYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoSW5mb1BhbmVsLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBJbmZvUGFuZWwocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEluZm9QYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoSW5mb1BhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBlZGl0TW9kZTogZmFsc2UgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoSW5mb1BhbmVsLCBbe1xuICAgICAgICBrZXk6ICdvcGVuRWRpdE1vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkVkaXRNb2RlKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXNldCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcy5wYW5lbC5yZXNldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICAgICAgaWYgKG5ld1Byb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSAmJiB0aGlzLnJlZnMucGFuZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NhdmVDaGFuZ2VzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNhdmVDaGFuZ2VzKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTAgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5yZWZzLnBhbmVsLmdldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zW2tdID0gdjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgUmVuZGVyZXIuZ2V0Q2xpZW50KCkuc2F2ZU1ldGEodGhpcy5wcm9wcy5weWRpby5nZXRDb250ZXh0SG9sZGVyKCkuZ2V0U2VsZWN0ZWROb2RlcygpLCB2YWx1ZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMTAucmVzZXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMTEgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogTWVzc2FnZUhhc2hbJzU0J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMTEucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuaGFzKCdub2RlX3JlYWRvbmx5JykpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICdlZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuc3RhdGUuZWRpdE1vZGUgPyBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjE1J10gOiBNZXNzYWdlSGFzaFsnbWV0YS51c2VyLjE0J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICFfdGhpczExLnN0YXRlLmVkaXRNb2RlID8gX3RoaXMxMS5vcGVuRWRpdE1vZGUoKSA6IF90aGlzMTEuc2F2ZUNoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgIHsgaWRlbnRpZmllcjogXCJtZXRhLXVzZXJcIiwgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUsIHRpdGxlOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuMSddLCBhY3Rpb25zOiBhY3Rpb25zLmxlbmd0aCA/IGFjdGlvbnMgOiBudWxsLCBpY29uOiAndGFnLW11bHRpcGxlJywgaWNvbkNvbG9yOiAnIzAwQUNDMScgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyTWV0YVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ3BhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZTogdGhpcy5wcm9wcy5ub2RlLFxuICAgICAgICAgICAgICAgICAgICBlZGl0TW9kZTogdGhpcy5zdGF0ZS5lZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0RWRpdE1vZGU6IHRoaXMub3BlbkVkaXRNb2RlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbmV4cG9ydHMuSW5mb1BhbmVsID0gSW5mb1BhbmVsO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLlVzZXJNZXRhRGlhbG9nID0gVXNlck1ldGFEaWFsb2c7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcblxuZXhwb3J0cy5SZW5kZXJlciA9IF9jb21wb25lbnRzLlJlbmRlcmVyO1xuZXhwb3J0cy5JbmZvUGFuZWwgPSBfY29tcG9uZW50cy5JbmZvUGFuZWw7XG5leHBvcnRzLkNhbGxiYWNrcyA9IF9jb21wb25lbnRzLkNhbGxiYWNrcztcbmV4cG9ydHMuVXNlck1ldGFEaWFsb2cgPSBfY29tcG9uZW50cy5Vc2VyTWV0YURpYWxvZztcbiJdfQ==
