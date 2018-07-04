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

var _pydioHttpRestApi = require('pydio/http/rest-api');

var MetaClient = (function () {
    function MetaClient() {
        _classCallCheck(this, MetaClient);

        this.client = _pydioHttpApi2['default'].getRestClient();
    }

    _createClass(MetaClient, [{
        key: 'loadConfigs',
        value: function loadConfigs() {

            var defs = {};
            var api = new _pydioHttpRestApi.UserMetaServiceApi(this.client);
            api.listUserMetaNamespace().then(function (result) {
                console.log(result);
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
                console.log(defs);
            });
            console.log(defs);
            return defs;
        }
    }]);

    return MetaClient;
})();

exports['default'] = MetaClient;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}],2:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _MetaClient = require('./MetaClient');

var _MetaClient2 = _interopRequireDefault(_MetaClient);

var Renderer = (function () {
    function Renderer() {
        _classCallCheck(this, Renderer);
    }

    _createClass(Renderer, null, [{
        key: 'getMetadataConfigs',
        value: function getMetadataConfigs() {

            var client = new _MetaClient2['default']();
            /*
            if(pydio && pydio.user && pydio.user.activeRepository && Renderer.__CACHE
                && Renderer.__CACHE.has(pydio.user.activeRepository)){
                return Renderer.__CACHE.get(pydio.user.activeRepository);
            }
            */
            var configMap = new Map();
            try {
                var configs = client.loadConfigs();
                console.log(configs);
                var arrConfigs = Object.entries(configs).map(function (entry) {
                    entry[1].ns = entry[0];
                    return entry[1];
                });
                arrConfigs.sort(function (a, b) {
                    var orderA = a.order;
                    var orderB = b.order;
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
            } catch (e) {}
            //console.debug(e);

            /*
            if(pydio && pydio.user && pydio.user.activeRepository){
                if(!Renderer.__CACHE) Renderer.__CACHE = new Map();
                Renderer.__CACHE.set(pydio.user.activeRepository, configMap);
            }
            */
            return configMap;
        }
    }, {
        key: 'renderStars',
        value: function renderStars(node, column) {
            return React.createElement(MetaStarsRenderer, { node: node, column: column, size: 'small' });
        }
    }, {
        key: 'renderSelector',
        value: function renderSelector(node, column) {
            return React.createElement(SelectorFilter, { node: node, column: column });
        }
    }, {
        key: 'renderCSSLabel',
        value: function renderCSSLabel(node, column) {
            return React.createElement(CSSLabelsFilter, { node: node, column: column });
        }
    }, {
        key: 'renderTagsCloud',
        value: function renderTagsCloud(node, column) {
            return React.createElement(
                'span',
                null,
                node.getMetadata().get(column.name)
            );
        }
    }, {
        key: 'formPanelStars',
        value: function formPanelStars(props) {
            return React.createElement(StarsFormPanel, props);
        }
    }, {
        key: 'formPanelCssLabels',
        value: function formPanelCssLabels(props) {

            var menuItems = Object.keys(CSSLabelsFilter.CSS_LABELS).map((function (id) {
                var label = CSSLabelsFilter.CSS_LABELS[id];
                //return {payload:id, text:label.label};
                return React.createElement(MaterialUI.MenuItem, { value: id, primaryText: label.label });
            }).bind(this));

            return React.createElement(MetaSelectorFormPanel, _extends({}, props, { menuItems: menuItems }));
        }
    }, {
        key: 'formPanelSelectorFilter',
        value: function formPanelSelectorFilter(props) {

            var configs = Renderer.getMetadataConfigs().get(props.fieldname);
            var menuItems = [];
            if (configs && configs.data) {
                configs.data.forEach(function (value, key) {
                    //menuItems.push({payload:key, text:value});
                    menuItems.push(React.createElement(MaterialUI.MenuItem, { value: key, primaryText: value }));
                });
            }

            return React.createElement(MetaSelectorFormPanel, _extends({}, props, { menuItems: menuItems }));
        }
    }, {
        key: 'formPanelTags',
        value: function formPanelTags(props) {
            var configs = Renderer.getMetadataConfigs().get(props.fieldname);
            return React.createElement(TagsCloud, _extends({}, props, { editMode: true }));
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
        label: React.PropTypes.string,
        fieldname: React.PropTypes.string,
        onChange: React.PropTypes.func,
        onValueChange: React.PropTypes.func
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
        node: React.PropTypes.instanceOf(AjxpNode),
        column: React.PropTypes.object
    },

    getRealValue: function getRealValue() {
        return this.props.node.getMetadata().get(this.props.column.name);
    }

};

var starsStyle = { fontSize: 20, color: '#FBC02D' };

var StarsFormPanel = React.createClass({
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
            return React.createElement('span', { key: "star-" + v, onClick: this.updateValue.bind(this, v + 1), className: "mdi mdi-" + ic, style: style });
        }).bind(this));
        return React.createElement(
            'div',
            { className: 'advanced-search-stars', style: starsStyle },
            React.createElement(
                'div',
                null,
                stars
            )
        );
    }

});

var MetaStarsRenderer = React.createClass({
    displayName: 'MetaStarsRenderer',

    mixins: [MetaFieldRendererMixin],

    render: function render() {
        var value = this.getRealValue() || 0;
        var stars = [0, 1, 2, 3, 4].map(function (v) {
            return React.createElement('span', { key: "star-" + v, className: "mdi mdi-star" + (value > v ? '' : '-outline') });
        });
        var style = this.props.size === 'small' ? { color: starsStyle.color } : starsStyle;
        return React.createElement(
            'span',
            { style: style },
            stars
        );
    }

});

var SelectorFilter = React.createClass({
    displayName: 'SelectorFilter',

    mixins: [MetaFieldRendererMixin],

    render: function render() {
        var value = undefined;
        var displayValue = value = this.getRealValue();
        var configs = Renderer.getMetadataConfigs().get(this.props.column.name);
        if (configs && configs.data) {
            displayValue = configs.data.get(value);
        }
        return React.createElement(
            'span',
            null,
            displayValue
        );
    }

});

var CSSLabelsFilter = React.createClass({
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
            return React.createElement(
                'span',
                null,
                React.createElement('span', { className: 'mdi mdi-label', style: { color: dV.color } }),
                ' ',
                dV.label
            );
        } else {
            return React.createElement(
                'span',
                null,
                value
            );
        }
    }

});

var MetaSelectorFormPanel = React.createClass({
    displayName: 'MetaSelectorFormPanel',

    mixins: [MetaFieldFormPanelMixin],

    changeSelector: function changeSelector(e, selectedIndex, payload) {
        this.updateValue(payload);
    },

    getInitialState: function getInitialState() {
        return { value: this.props.value };
    },

    render: function render() {
        var index = 0,
            i = 1;
        this.props.menuItems.unshift(React.createElement(MaterialUI.MenuItem, { value: '', primaryText: '' }));
        return React.createElement(
            'div',
            null,
            React.createElement(
                MaterialUI.SelectField,
                {
                    style: { width: '100%' },
                    value: this.state.value,
                    onChange: this.changeSelector },
                this.props.menuItems
            )
        );
    }

});

var TagsCloud = React.createClass({
    displayName: 'TagsCloud',

    mixins: [MetaFieldFormPanelMixin],

    propTypes: {
        node: React.PropTypes.instanceOf(AjxpNode),
        column: React.PropTypes.object
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
        var _this = this;

        this.setState({ loading: this.state.loading + 1 });
        PydioApi.getClient().request({ get_action: 'meta_user_list_tags', namespace: this.props.fieldname || this.props.column.name }, function (transport) {
            _this.setState({ loading: _this.state.loading - 1 });
            if (transport.responseJSON && transport.responseJSON.length) {
                callback(transport.responseJSON);
            }
        });
    },

    load: function load() {
        this.setState({ loading: true });
        this.suggestionLoader((function (tags) {
            var crtValueFound = false;
            var values = tags.map((function (tag) {
                var component = React.createElement(
                    MaterialUI.MenuItem,
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
        var _this2 = this;

        var tags = this.state.tags.split(',');
        var index = tags.indexOf(tag);
        tags.splice(index, 1);
        this.setState({
            tags: tags.toString() }, function () {
            _this2.updateValue(_this2.state.tags);
        });
    },

    handleUpdateInput: function handleUpdateInput(searchText) {
        this.setState({ searchText: searchText });
    },

    handleNewRequest: function handleNewRequest() {
        var _this3 = this;

        var tags = [];
        if (this.state.tags) {
            tags = this.state.tags.split(',');
        }
        tags.push(this.state.searchText);
        this.setState({
            tags: tags.toString() }, function () {
            _this3.updateValue(_this3.state.tags);
        });
        this.setState({
            searchText: ''
        });
    },

    renderChip: function renderChip(tag) {
        var chipStyle = { margin: 2, backgroundColor: '#F5F5F5' };
        if (this.props.editMode) {
            return React.createElement(
                MaterialUI.Chip,
                { key: tag, style: chipStyle, onRequestDelete: this.handleRequestDelete.bind(this, tag) },
                tag
            );
        } else {
            return React.createElement(
                MaterialUI.Chip,
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
            tags = React.createElement('div', null);
        }
        var autoCompleter = undefined;
        var textField = undefined;
        if (this.props.editMode) {
            autoCompleter = React.createElement(MaterialUI.AutoComplete, {
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
            autoCompleter = React.createElement('div', null);
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { style: { display: 'flex', flexWrap: 'wrap' } },
                tags
            ),
            autoCompleter
        );
    }

});

var UserMetaDialog = React.createClass({
    displayName: 'UserMetaDialog',

    propsTypes: {
        selection: React.PropTypes.instanceOf(PydioDataModel)
    },

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    submit: function submit() {
        var values = this.refs.panel.getUpdateData();
        var params = {};
        values.forEach(function (v, k) {
            params[k] = v;
        });
        PydioApi.getClient().postSelectionWithAction("edit_user_meta", (function (t) {
            PydioApi.getClient().parseXmlMessage(t.responseXML);
            this.dismiss();
        }).bind(this), this.props.selection, params);
    },
    render: function render() {
        return React.createElement(UserMetaPanel, {
            pydio: this.props.pydio,
            multiple: !this.props.selection.isUnique(),
            ref: 'panel',
            node: this.props.selection.isUnique() ? this.props.selection.getUniqueNode() : new AjxpNode(),
            editMode: true
        });
    }
});

var UserMetaPanel = React.createClass({
    displayName: 'UserMetaPanel',

    propTypes: {
        editMode: React.PropTypes.bool
    },

    getDefaultProps: function getDefaultProps() {
        return { editMode: false };
    },
    getInitialState: function getInitialState() {
        return {
            updateMeta: new Map(),
            isChecked: false,
            fields: []
        };
    },
    updateValue: function updateValue(name, value) {
        this.state.updateMeta.set(name, value);
        this.setState({
            updateMeta: this.state.updateMeta
        });
    },
    deleteValue: function deleteValue(name) {
        this.state.updateMeta['delete'](name);
        this.setState({
            updateMeta: this.state.updateMeta
        });
    },
    getUpdateData: function getUpdateData() {
        return this.state.updateMeta;
    },

    resetUpdateData: function resetUpdateData() {
        this.setState({
            updateMeta: new Map()
        });
    },
    onCheck: function onCheck(e, isInputChecked, value) {
        var state = this.state;
        state['fields'][e.target.value] = isInputChecked;
        if (isInputChecked == false) {
            this.deleteValue(e.target.value);
        }
        this.setState(state);
    },
    render: function render() {
        var configs = Renderer.getMetadataConfigs();
        var data = [];
        var node = this.props.node;
        var metadata = this.props.node.getMetadata();
        var updateMeta = this.state.updateMeta;
        var nonEmptyDataCount = 0;
        var isAdmin = pydio.user.isAdmin;

        configs.forEach((function (meta, key) {
            var _this4 = this;

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
                    onValueChange: this.updateValue
                };
                if (type === 'stars_rate') {
                    field = React.createElement(StarsFormPanel, baseProps);
                } else if (type === 'choice') {
                    field = Renderer.formPanelSelectorFilter(baseProps);
                } else if (type === 'css_label') {
                    field = Renderer.formPanelCssLabels(baseProps);
                } else if (type === 'tags') {
                    field = Renderer.formPanelTags(baseProps);
                } else {
                    field = React.createElement(MaterialUI.TextField, {
                        value: value,
                        fullWidth: true,
                        disabled: readonly,
                        onChange: function (event, value) {
                            _this4.updateValue(key, value);
                        }
                    });
                }
                if (this.props.multiple) {
                    data.push(React.createElement(
                        'div',
                        { className: "infoPanelRow", key: key, style: { marginBottom: 20 } },
                        React.createElement(MaterialUI.Checkbox, { value: key, label: label, onCheck: this.onCheck.bind(value) }),
                        this.state['fields'][key] && React.createElement(
                            'div',
                            { className: 'infoPanelValue' },
                            field
                        )
                    ));
                } else {
                    data.push(React.createElement(
                        'div',
                        { className: "infoPanelRow", key: key },
                        React.createElement(
                            'div',
                            { className: 'infoPanelLabel' },
                            label
                        ),
                        React.createElement(
                            'div',
                            { className: 'infoPanelValue' },
                            field
                        )
                    ));
                }
            } else {
                var column = { name: key };
                if (type === 'stars_rate') {
                    value = React.createElement(MetaStarsRenderer, { node: node, column: column });
                } else if (type === 'css_label') {
                    value = React.createElement(CSSLabelsFilter, { node: node, column: column });
                } else if (type === 'choice') {
                    value = React.createElement(SelectorFilter, { node: node, column: column });
                } else if (type === 'tags') {
                    value = React.createElement(TagsCloud, { node: node, column: column });
                }
                if (realValue) {
                    nonEmptyDataCount++;
                }
                data.push(React.createElement(
                    'div',
                    { className: "infoPanelRow" + (!realValue ? ' no-value' : ''), key: key },
                    React.createElement(
                        'div',
                        { className: 'infoPanelLabel' },
                        label
                    ),
                    React.createElement(
                        'div',
                        { className: 'infoPanelValue' },
                        value
                    )
                ));
            }
        }).bind(this));
        var mess = this.props.pydio.MessageHash;
        if (!this.props.editMode && !nonEmptyDataCount) {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { style: { color: 'rgba(0,0,0,0.23)', paddingBottom: 10 }, onTouchTap: this.props.onRequestEditMode },
                    mess['meta.user.11']
                ),
                data
            );
        } else {
            var legend = undefined;
            if (this.props.multiple) {
                legend = React.createElement(
                    'div',
                    { style: { paddingBottom: 16 } },
                    React.createElement(
                        'em',
                        null,
                        mess['meta.user.12']
                    ),
                    ' ',
                    mess['meta.user.13']
                );
            }
            return React.createElement(
                'div',
                { style: { width: '100%', overflowY: 'scroll' } },
                legend,
                data
            );
        }
    }

});

var InfoPanel = React.createClass({
    displayName: 'InfoPanel',

    propTypes: {
        node: React.PropTypes.instanceOf(AjxpNode)
    },

    getInitialState: function getInitialState() {
        return { editMode: false };
    },

    openEditMode: function openEditMode() {
        this.setState({ editMode: true });
    },

    reset: function reset() {
        this.refs.panel.resetUpdateData();
        this.setState({ editMode: false });
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (newProps.node !== this.props.node && this.refs.panel) {
            this.reset();
        }
    },

    saveChanges: function saveChanges() {
        var values = this.refs.panel.getUpdateData();
        var params = {};
        values.forEach(function (v, k) {
            params[k] = v;
        });
        PydioApi.getClient().postSelectionWithAction("edit_user_meta", (function (t) {
            PydioApi.getClient().parseXmlMessage(t.responseXML);
            this.reset();
        }).bind(this), null, params);
    },

    render: function render() {
        var _this5 = this;

        var actions = [];
        var MessageHash = this.props.pydio.MessageHash;

        if (this.state.editMode) {
            actions.push(React.createElement(MaterialUI.FlatButton, {
                key: 'cancel',
                label: MessageHash['54'],
                onClick: function () {
                    _this5.reset();
                }
            }));
        }
        if (!this.props.node.getMetadata().has('node_readonly')) {
            actions.push(React.createElement(MaterialUI.FlatButton, {
                key: 'edit',
                label: this.state.editMode ? MessageHash['meta.user.15'] : MessageHash['meta.user.14'],
                onClick: function () {
                    !_this5.state.editMode ? _this5.openEditMode() : _this5.saveChanges();
                }
            }));
        }

        return React.createElement(
            PydioWorkspaces.InfoPanelCard,
            { identifier: "meta-user", style: this.props.style, title: this.props.pydio.MessageHash['meta.user.1'], actions: actions.length ? actions : null, icon: 'tag-multiple', iconColor: '#00ACC1' },
            React.createElement(UserMetaPanel, {
                ref: 'panel',
                node: this.props.node,
                editMode: this.state.editMode,
                onRequestEditMode: this.openEditMode.bind(this),
                pydio: this.props.pydio
            })
        );
    }

});

exports.Renderer = Renderer;
exports.InfoPanel = InfoPanel;
exports.Callbacks = Callbacks;
exports.UserMetaDialog = UserMetaDialog;

},{"./MetaClient":1}],3:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9NZXRhQ2xpZW50LmpzIiwianMvYnVpbGQvY29tcG9uZW50cy5qcyIsImpzL2J1aWxkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3AxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIE1ldGFDbGllbnQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1ldGFDbGllbnQoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNZXRhQ2xpZW50KTtcblxuICAgICAgICB0aGlzLmNsaWVudCA9IF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNZXRhQ2xpZW50LCBbe1xuICAgICAgICBrZXk6ICdsb2FkQ29uZmlncycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQ29uZmlncygpIHtcblxuICAgICAgICAgICAgdmFyIGRlZnMgPSB7fTtcbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVXNlck1ldGFTZXJ2aWNlQXBpKHRoaXMuY2xpZW50KTtcbiAgICAgICAgICAgIGFwaS5saXN0VXNlck1ldGFOYW1lc3BhY2UoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5OYW1lc3BhY2VzLm1hcChmdW5jdGlvbiAobnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBucy5OYW1lc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IG5zLkxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhhYmxlOiBucy5JbmRleGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogbnMuT3JkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChucy5Kc29uRGVmaW5pdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgakRlZiA9IEpTT04ucGFyc2UobnMuSnNvbkRlZmluaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGpEZWYpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlW2tdID0gakRlZltrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5zLlBvbGljaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBucy5Qb2xpY2llcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocC5BY3Rpb24gPT09ICdSRUFEJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlWydyZWFkU3ViamVjdCddID0gcC5TdWJqZWN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocC5BY3Rpb24gPT09ICdXUklURScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVsnd3JpdGVTdWJqZWN0J10gPSBwLlN1YmplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVmc1tuYW1lXSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGVmcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRlZnMpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZnM7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTWV0YUNsaWVudDtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1ldGFDbGllbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX01ldGFDbGllbnQgPSByZXF1aXJlKCcuL01ldGFDbGllbnQnKTtcblxudmFyIF9NZXRhQ2xpZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX01ldGFDbGllbnQpO1xuXG52YXIgUmVuZGVyZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlbmRlcmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVuZGVyZXIpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhSZW5kZXJlciwgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnZ2V0TWV0YWRhdGFDb25maWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1ldGFkYXRhQ29uZmlncygpIHtcblxuICAgICAgICAgICAgdmFyIGNsaWVudCA9IG5ldyBfTWV0YUNsaWVudDJbJ2RlZmF1bHQnXSgpO1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGlmKHB5ZGlvICYmIHB5ZGlvLnVzZXIgJiYgcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5ICYmIFJlbmRlcmVyLl9fQ0FDSEVcbiAgICAgICAgICAgICAgICAmJiBSZW5kZXJlci5fX0NBQ0hFLmhhcyhweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnkpKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVuZGVyZXIuX19DQUNIRS5nZXQocHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgY29uZmlnTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlncyA9IGNsaWVudC5sb2FkQ29uZmlncygpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbmZpZ3MpO1xuICAgICAgICAgICAgICAgIHZhciBhcnJDb25maWdzID0gT2JqZWN0LmVudHJpZXMoY29uZmlncykubWFwKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeVsxXS5ucyA9IGVudHJ5WzBdO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50cnlbMV07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXJyQ29uZmlncy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcmRlckEgPSBhLm9yZGVyO1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3JkZXJCID0gYi5vcmRlcjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9yZGVyQSA+IG9yZGVyQiA/IDEgOiBvcmRlckEgPT09IG9yZGVyQiA/IDAgOiAtMTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhcnJDb25maWdzLm1hcChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB2YWx1ZS50eXBlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Nob2ljZScgJiYgdmFsdWUuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmRhdGEuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbiAoa2V5TGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5TGFiZWwuc3BsaXQoXCJ8XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc2V0KHBhcnRzWzBdLCBwYXJ0c1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZGF0YSA9IHZhbHVlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uZmlnTWFwLnNldCh2YWx1ZS5ucywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgIC8vY29uc29sZS5kZWJ1ZyhlKTtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIGlmKHB5ZGlvICYmIHB5ZGlvLnVzZXIgJiYgcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5KXtcbiAgICAgICAgICAgICAgICBpZighUmVuZGVyZXIuX19DQUNIRSkgUmVuZGVyZXIuX19DQUNIRSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICBSZW5kZXJlci5fX0NBQ0hFLnNldChweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnksIGNvbmZpZ01hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ01hcDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyU3RhcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyU3RhcnMobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChNZXRhU3RhcnNSZW5kZXJlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiwgc2l6ZTogJ3NtYWxsJyB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyU2VsZWN0b3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyU2VsZWN0b3Iobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChTZWxlY3RvckZpbHRlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyQ1NTTGFiZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyQ1NTTGFiZWwobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChDU1NMYWJlbHNGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlclRhZ3NDbG91ZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJUYWdzQ2xvdWQobm9kZSwgY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KGNvbHVtbi5uYW1lKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9ybVBhbmVsU3RhcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9ybVBhbmVsU3RhcnMocHJvcHMpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFN0YXJzRm9ybVBhbmVsLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbENzc0xhYmVscycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtUGFuZWxDc3NMYWJlbHMocHJvcHMpIHtcblxuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IE9iamVjdC5rZXlzKENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTKS5tYXAoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IENTU0xhYmVsc0ZpbHRlci5DU1NfTEFCRUxTW2lkXTtcbiAgICAgICAgICAgICAgICAvL3JldHVybiB7cGF5bG9hZDppZCwgdGV4dDpsYWJlbC5sYWJlbH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5NZW51SXRlbSwgeyB2YWx1ZTogaWQsIHByaW1hcnlUZXh0OiBsYWJlbC5sYWJlbCB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChNZXRhU2VsZWN0b3JGb3JtUGFuZWwsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBtZW51SXRlbXM6IG1lbnVJdGVtcyB9KSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Zvcm1QYW5lbFNlbGVjdG9yRmlsdGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFNlbGVjdG9yRmlsdGVyKHByb3BzKSB7XG5cbiAgICAgICAgICAgIHZhciBjb25maWdzID0gUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCkuZ2V0KHByb3BzLmZpZWxkbmFtZSk7XG4gICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICBpZiAoY29uZmlncyAmJiBjb25maWdzLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25maWdzLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICAvL21lbnVJdGVtcy5wdXNoKHtwYXlsb2FkOmtleSwgdGV4dDp2YWx1ZX0pO1xuICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE1hdGVyaWFsVUkuTWVudUl0ZW0sIHsgdmFsdWU6IGtleSwgcHJpbWFyeVRleHQ6IHZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWV0YVNlbGVjdG9yRm9ybVBhbmVsLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgbWVudUl0ZW1zOiBtZW51SXRlbXMgfSkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JtUGFuZWxUYWdzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcm1QYW5lbFRhZ3MocHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCkuZ2V0KHByb3BzLmZpZWxkbmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChUYWdzQ2xvdWQsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBlZGl0TW9kZTogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUmVuZGVyZXI7XG59KSgpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2VkaXRNZXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVkaXRNZXRhKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1JlYWN0TWV0YScsICdVc2VyTWV0YURpYWxvZycsIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dUaXRsZUlkOiA0ODksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiBweWRpby5nZXRVc2VyU2VsZWN0aW9uKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBNZXRhRmllbGRGb3JtUGFuZWxNaXhpbiA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsYWJlbDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgZmllbGRuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIHVwZGF0ZVZhbHVlOiBmdW5jdGlvbiB1cGRhdGVWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB2YXIgc3VibWl0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHZhbHVlIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIG9iamVjdCA9IHt9O1xuICAgICAgICAgICAgb2JqZWN0WydhanhwX21ldGFfJyArIHRoaXMucHJvcHMuZmllbGRuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShvYmplY3QsIHN1Ym1pdCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5vblZhbHVlQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsdWVDaGFuZ2UodGhpcy5wcm9wcy5maWVsZG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcblxudmFyIE1ldGFGaWVsZFJlbmRlcmVyTWl4aW4gPSB7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbm9kZTogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpLFxuICAgICAgICBjb2x1bW46IFJlYWN0LlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuXG4gICAgZ2V0UmVhbFZhbHVlOiBmdW5jdGlvbiBnZXRSZWFsVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQodGhpcy5wcm9wcy5jb2x1bW4ubmFtZSk7XG4gICAgfVxuXG59O1xuXG52YXIgc3RhcnNTdHlsZSA9IHsgZm9udFNpemU6IDIwLCBjb2xvcjogJyNGQkMwMkQnIH07XG5cbnZhciBTdGFyc0Zvcm1QYW5lbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1N0YXJzRm9ybVBhbmVsJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZEZvcm1QYW5lbE1peGluXSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB8fCAwIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICB2YXIgc3RhcnMgPSBbLTEsIDAsIDEsIDIsIDMsIDRdLm1hcCgoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHZhciBpYyA9ICdzdGFyJyArICh2ID09PSAtMSA/ICctb2ZmJyA6IHZhbHVlID4gdiA/ICcnIDogJy1vdXRsaW5lJyk7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSB2ID09PSAtMSA/IHsgbWFyZ2luUmlnaHQ6IDUsIGN1cnNvcjogJ3BvaW50ZXInIH0gOiB7IGN1cnNvcjogJ3BvaW50ZXInIH07XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiBcInN0YXItXCIgKyB2LCBvbkNsaWNrOiB0aGlzLnVwZGF0ZVZhbHVlLmJpbmQodGhpcywgdiArIDEpLCBjbGFzc05hbWU6IFwibWRpIG1kaS1cIiArIGljLCBzdHlsZTogc3R5bGUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdhZHZhbmNlZC1zZWFyY2gtc3RhcnMnLCBzdHlsZTogc3RhcnNTdHlsZSB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIE1ldGFTdGFyc1JlbmRlcmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVN0YXJzUmVuZGVyZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXRSZWFsVmFsdWUoKSB8fCAwO1xuICAgICAgICB2YXIgc3RhcnMgPSBbMCwgMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiBcInN0YXItXCIgKyB2LCBjbGFzc05hbWU6IFwibWRpIG1kaS1zdGFyXCIgKyAodmFsdWUgPiB2ID8gJycgOiAnLW91dGxpbmUnKSB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBzdHlsZSA9IHRoaXMucHJvcHMuc2l6ZSA9PT0gJ3NtYWxsJyA/IHsgY29sb3I6IHN0YXJzU3R5bGUuY29sb3IgfSA6IHN0YXJzU3R5bGU7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBzdHlsZTogc3R5bGUgfSxcbiAgICAgICAgICAgIHN0YXJzXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIFNlbGVjdG9yRmlsdGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU2VsZWN0b3JGaWx0ZXInLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkUmVuZGVyZXJNaXhpbl0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgZGlzcGxheVZhbHVlID0gdmFsdWUgPSB0aGlzLmdldFJlYWxWYWx1ZSgpO1xuICAgICAgICB2YXIgY29uZmlncyA9IFJlbmRlcmVyLmdldE1ldGFkYXRhQ29uZmlncygpLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKTtcbiAgICAgICAgaWYgKGNvbmZpZ3MgJiYgY29uZmlncy5kYXRhKSB7XG4gICAgICAgICAgICBkaXNwbGF5VmFsdWUgPSBjb25maWdzLmRhdGEuZ2V0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBkaXNwbGF5VmFsdWVcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgQ1NTTGFiZWxzRmlsdGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQ1NTTGFiZWxzRmlsdGVyJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZFJlbmRlcmVyTWl4aW5dLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICBDU1NfTEFCRUxTOiB7XG4gICAgICAgICAgICAnbG93JzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci40J10sIHNvcnRWYWx1ZTogJzUnLCBjb2xvcjogJyM2NmMnIH0sXG4gICAgICAgICAgICAndG9kbyc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNSddLCBzb3J0VmFsdWU6ICc0JywgY29sb3I6ICcjNjljJyB9LFxuICAgICAgICAgICAgJ3BlcnNvbmFsJzogeyBsYWJlbDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci42J10sIHNvcnRWYWx1ZTogJzMnLCBjb2xvcjogJyM2YzYnIH0sXG4gICAgICAgICAgICAnd29yayc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuNyddLCBzb3J0VmFsdWU6ICcyJywgY29sb3I6ICcjYzk2JyB9LFxuICAgICAgICAgICAgJ2ltcG9ydGFudCc6IHsgbGFiZWw6IE1lc3NhZ2VIYXNoWydtZXRhLnVzZXIuOCddLCBzb3J0VmFsdWU6ICcxJywgY29sb3I6ICcjYzY2JyB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIHZhciBkYXRhID0gQ1NTTGFiZWxzRmlsdGVyLkNTU19MQUJFTFM7XG4gICAgICAgIGlmICh2YWx1ZSAmJiBkYXRhW3ZhbHVlXSkge1xuICAgICAgICAgICAgdmFyIGRWID0gZGF0YVt2YWx1ZV07XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWxhYmVsJywgc3R5bGU6IHsgY29sb3I6IGRWLmNvbG9yIH0gfSksXG4gICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgIGRWLmxhYmVsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG52YXIgTWV0YVNlbGVjdG9yRm9ybVBhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTWV0YVNlbGVjdG9yRm9ybVBhbmVsJyxcblxuICAgIG1peGluczogW01ldGFGaWVsZEZvcm1QYW5lbE1peGluXSxcblxuICAgIGNoYW5nZVNlbGVjdG9yOiBmdW5jdGlvbiBjaGFuZ2VTZWxlY3RvcihlLCBzZWxlY3RlZEluZGV4LCBwYXlsb2FkKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVmFsdWUocGF5bG9hZCk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGkgPSAxO1xuICAgICAgICB0aGlzLnByb3BzLm1lbnVJdGVtcy51bnNoaWZ0KFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5NZW51SXRlbSwgeyB2YWx1ZTogJycsIHByaW1hcnlUZXh0OiAnJyB9KSk7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBNYXRlcmlhbFVJLlNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJyB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuY2hhbmdlU2VsZWN0b3IgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1lbnVJdGVtc1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBUYWdzQ2xvdWQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdUYWdzQ2xvdWQnLFxuXG4gICAgbWl4aW5zOiBbTWV0YUZpZWxkRm9ybVBhbmVsTWl4aW5dLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG5vZGU6IFJlYWN0LlByb3BUeXBlcy5pbnN0YW5jZU9mKEFqeHBOb2RlKSxcbiAgICAgICAgY29sdW1uOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZ2V0UmVhbFZhbHVlKCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB2YXIgbm9kZSA9IG5leHRQcm9wcy5ub2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBuZXh0UHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBjb2x1bW4gPSBuZXh0UHJvcHMuY29sdW1uO1xuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhZ3M6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoY29sdW1uLm5hbWUpIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5leHRQcm9wcy5lZGl0TW9kZSAmJiAhdGhpcy5zdGF0ZS5sb2FkZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFJlYWxWYWx1ZTogZnVuY3Rpb24gZ2V0UmVhbFZhbHVlKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzLnZhbHVlO1xuICAgICAgICB2YXIgY29sdW1uID0gX3Byb3BzLmNvbHVtbjtcblxuICAgICAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogdmFsdWUgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFnczogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChjb2x1bW4ubmFtZSkgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9wcm9wczIudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGF0YVNvdXJjZTogW10sXG4gICAgICAgICAgICB0YWdzOiBub2RlID8gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCh0aGlzLnByb3BzLmNvbHVtbi5uYW1lKSA6IHZhbHVlLFxuICAgICAgICAgICAgc2VhcmNoVGV4dDogJydcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VnZ2VzdGlvbkxvYWRlcjogZnVuY3Rpb24gc3VnZ2VzdGlvbkxvYWRlcihjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0aGlzLnN0YXRlLmxvYWRpbmcgKyAxIH0pO1xuICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5yZXF1ZXN0KHsgZ2V0X2FjdGlvbjogJ21ldGFfdXNlcl9saXN0X3RhZ3MnLCBuYW1lc3BhY2U6IHRoaXMucHJvcHMuZmllbGRuYW1lIHx8IHRoaXMucHJvcHMuY29sdW1uLm5hbWUgfSwgZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBfdGhpcy5zdGF0ZS5sb2FkaW5nIC0gMSB9KTtcbiAgICAgICAgICAgIGlmICh0cmFuc3BvcnQucmVzcG9uc2VKU09OICYmIHRyYW5zcG9ydC5yZXNwb25zZUpTT04ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sodHJhbnNwb3J0LnJlc3BvbnNlSlNPTik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsb2FkOiBmdW5jdGlvbiBsb2FkKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5zdWdnZXN0aW9uTG9hZGVyKChmdW5jdGlvbiAodGFncykge1xuICAgICAgICAgICAgdmFyIGNydFZhbHVlRm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSB0YWdzLm1hcCgoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBNYXRlcmlhbFVJLk1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IHRhZyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkYXRhU291cmNlOiB2YWx1ZXMsIGxvYWRpbmc6IGZhbHNlLCBsb2FkZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBoYW5kbGVSZXF1ZXN0RGVsZXRlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0RGVsZXRlKHRhZykge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgdGFncyA9IHRoaXMuc3RhdGUudGFncy5zcGxpdCgnLCcpO1xuICAgICAgICB2YXIgaW5kZXggPSB0YWdzLmluZGV4T2YodGFnKTtcbiAgICAgICAgdGFncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhZ3M6IHRhZ3MudG9TdHJpbmcoKSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczIudXBkYXRlVmFsdWUoX3RoaXMyLnN0YXRlLnRhZ3MpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlVXBkYXRlSW5wdXQ6IGZ1bmN0aW9uIGhhbmRsZVVwZGF0ZUlucHV0KHNlYXJjaFRleHQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlYXJjaFRleHQ6IHNlYXJjaFRleHQgfSk7XG4gICAgfSxcblxuICAgIGhhbmRsZU5ld1JlcXVlc3Q6IGZ1bmN0aW9uIGhhbmRsZU5ld1JlcXVlc3QoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YWdzID0gW107XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRhZ3MpIHtcbiAgICAgICAgICAgIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoJywnKTtcbiAgICAgICAgfVxuICAgICAgICB0YWdzLnB1c2godGhpcy5zdGF0ZS5zZWFyY2hUZXh0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YWdzOiB0YWdzLnRvU3RyaW5nKCkgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMzLnVwZGF0ZVZhbHVlKF90aGlzMy5zdGF0ZS50YWdzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoVGV4dDogJydcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlckNoaXA6IGZ1bmN0aW9uIHJlbmRlckNoaXAodGFnKSB7XG4gICAgICAgIHZhciBjaGlwU3R5bGUgPSB7IG1hcmdpbjogMiwgYmFja2dyb3VuZENvbG9yOiAnI0Y1RjVGNScgfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIE1hdGVyaWFsVUkuQ2hpcCxcbiAgICAgICAgICAgICAgICB7IGtleTogdGFnLCBzdHlsZTogY2hpcFN0eWxlLCBvblJlcXVlc3REZWxldGU6IHRoaXMuaGFuZGxlUmVxdWVzdERlbGV0ZS5iaW5kKHRoaXMsIHRhZykgfSxcbiAgICAgICAgICAgICAgICB0YWdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBNYXRlcmlhbFVJLkNoaXAsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHRhZywgc3R5bGU6IGNoaXBTdHlsZSB9LFxuICAgICAgICAgICAgICAgIHRhZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIHRhZ3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRhZ3MpIHtcbiAgICAgICAgICAgIHRhZ3MgPSB0aGlzLnN0YXRlLnRhZ3Muc3BsaXQoXCIsXCIpLm1hcCgoZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgICAgIHRhZyA9IExhbmdVdGlscy50cmltKHRhZywgJyAnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRhZykgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyQ2hpcCh0YWcpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWdzID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF1dG9Db21wbGV0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciB0ZXh0RmllbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICBhdXRvQ29tcGxldGVyID0gUmVhY3QuY3JlYXRlRWxlbWVudChNYXRlcmlhbFVJLkF1dG9Db21wbGV0ZSwge1xuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaW50VGV4dDogcHlkaW8uTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xMCddLFxuICAgICAgICAgICAgICAgIHNlYXJjaFRleHQ6IHRoaXMuc3RhdGUuc2VhcmNoVGV4dCxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZUlucHV0OiB0aGlzLmhhbmRsZVVwZGF0ZUlucHV0LFxuICAgICAgICAgICAgICAgIG9uTmV3UmVxdWVzdDogdGhpcy5oYW5kbGVOZXdSZXF1ZXN0LFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IHRoaXMuc3RhdGUuZGF0YVNvdXJjZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWFyY2hUZXh0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSA9PT0gMDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wZW5PbkZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lbnVQcm9wczogeyBtYXhIZWlnaHQ6IDIwMCB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJyB9IH0sXG4gICAgICAgICAgICAgICAgdGFnc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZXJcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgVXNlck1ldGFEaWFsb2cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdVc2VyTWV0YURpYWxvZycsXG5cbiAgICBwcm9wc1R5cGVzOiB7XG4gICAgICAgIHNlbGVjdGlvbjogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoUHlkaW9EYXRhTW9kZWwpXG4gICAgfSxcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5yZWZzLnBhbmVsLmdldFVwZGF0ZURhdGEoKTtcbiAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaykge1xuICAgICAgICAgICAgcGFyYW1zW2tdID0gdjtcbiAgICAgICAgfSk7XG4gICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnBvc3RTZWxlY3Rpb25XaXRoQWN0aW9uKFwiZWRpdF91c2VyX21ldGFcIiwgKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5wYXJzZVhtbE1lc3NhZ2UodC5yZXNwb25zZVhNTCk7XG4gICAgICAgICAgICB0aGlzLmRpc21pc3MoKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSwgdGhpcy5wcm9wcy5zZWxlY3Rpb24sIHBhcmFtcyk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVXNlck1ldGFQYW5lbCwge1xuICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICBtdWx0aXBsZTogIXRoaXMucHJvcHMuc2VsZWN0aW9uLmlzVW5pcXVlKCksXG4gICAgICAgICAgICByZWY6ICdwYW5lbCcsXG4gICAgICAgICAgICBub2RlOiB0aGlzLnByb3BzLnNlbGVjdGlvbi5pc1VuaXF1ZSgpID8gdGhpcy5wcm9wcy5zZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpIDogbmV3IEFqeHBOb2RlKCksXG4gICAgICAgICAgICBlZGl0TW9kZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxudmFyIFVzZXJNZXRhUGFuZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdVc2VyTWV0YVBhbmVsJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBlZGl0TW9kZTogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7IGVkaXRNb2RlOiBmYWxzZSB9O1xuICAgIH0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB1cGRhdGVNZXRhOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBpc0NoZWNrZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZmllbGRzOiBbXVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgdXBkYXRlVmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVZhbHVlKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUudXBkYXRlTWV0YS5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVwZGF0ZU1ldGE6IHRoaXMuc3RhdGUudXBkYXRlTWV0YVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRlbGV0ZVZhbHVlOiBmdW5jdGlvbiBkZWxldGVWYWx1ZShuYW1lKSB7XG4gICAgICAgIHRoaXMuc3RhdGUudXBkYXRlTWV0YVsnZGVsZXRlJ10obmFtZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXBkYXRlTWV0YTogdGhpcy5zdGF0ZS51cGRhdGVNZXRhXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0VXBkYXRlRGF0YTogZnVuY3Rpb24gZ2V0VXBkYXRlRGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudXBkYXRlTWV0YTtcbiAgICB9LFxuXG4gICAgcmVzZXRVcGRhdGVEYXRhOiBmdW5jdGlvbiByZXNldFVwZGF0ZURhdGEoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXBkYXRlTWV0YTogbmV3IE1hcCgpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgb25DaGVjazogZnVuY3Rpb24gb25DaGVjayhlLCBpc0lucHV0Q2hlY2tlZCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgc3RhdGVbJ2ZpZWxkcyddW2UudGFyZ2V0LnZhbHVlXSA9IGlzSW5wdXRDaGVja2VkO1xuICAgICAgICBpZiAoaXNJbnB1dENoZWNrZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlVmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBjb25maWdzID0gUmVuZGVyZXIuZ2V0TWV0YWRhdGFDb25maWdzKCk7XG4gICAgICAgIHZhciBkYXRhID0gW107XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICB2YXIgbWV0YWRhdGEgPSB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoKTtcbiAgICAgICAgdmFyIHVwZGF0ZU1ldGEgPSB0aGlzLnN0YXRlLnVwZGF0ZU1ldGE7XG4gICAgICAgIHZhciBub25FbXB0eURhdGFDb3VudCA9IDA7XG4gICAgICAgIHZhciBpc0FkbWluID0gcHlkaW8udXNlci5pc0FkbWluO1xuXG4gICAgICAgIGNvbmZpZ3MuZm9yRWFjaCgoZnVuY3Rpb24gKG1ldGEsIGtleSkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciByZWFkb25seSA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gbWV0YS5sYWJlbDtcbiAgICAgICAgICAgIHZhciB0eXBlID0gbWV0YS50eXBlO1xuICAgICAgICAgICAgdmFyIHdyaXRlU3ViamVjdCA9IG1ldGEud3JpdGVTdWJqZWN0O1xuICAgICAgICAgICAgdmFyIHJlYWRTdWJqZWN0ID0gbWV0YS5yZWFkU3ViamVjdDtcblxuICAgICAgICAgICAgaWYgKHJlYWRTdWJqZWN0ID09PSAncHJvZmlsZTphZG1pbicgJiYgIWlzQWRtaW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAod3JpdGVTdWJqZWN0ID09PSAncHJvZmlsZTphZG1pbicgJiYgIWlzQWRtaW4pIHtcbiAgICAgICAgICAgICAgICByZWFkb25seSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZSA9IG1ldGFkYXRhLmdldChrZXkpO1xuICAgICAgICAgICAgaWYgKHVwZGF0ZU1ldGEuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHVwZGF0ZU1ldGEuZ2V0KGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVhbFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmVkaXRNb2RlICYmICFyZWFkb25seSkge1xuICAgICAgICAgICAgICAgIHZhciBmaWVsZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB2YXIgYmFzZVByb3BzID0ge1xuICAgICAgICAgICAgICAgICAgICBpc0NoZWNrZWQ6IHRoaXMuc3RhdGUuaXNDaGVja2VkLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG9uVmFsdWVDaGFuZ2U6IHRoaXMudXBkYXRlVmFsdWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3RhcnNfcmF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFN0YXJzRm9ybVBhbmVsLCBiYXNlUHJvcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxTZWxlY3RvckZpbHRlcihiYXNlUHJvcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Nzc19sYWJlbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBSZW5kZXJlci5mb3JtUGFuZWxDc3NMYWJlbHMoYmFzZVByb3BzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd0YWdzJykge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlbmRlcmVyLmZvcm1QYW5lbFRhZ3MoYmFzZVByb3BzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiByZWFkb25seSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM0LnVwZGF0ZVZhbHVlKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiLCBrZXk6IGtleSwgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1hdGVyaWFsVUkuQ2hlY2tib3gsIHsgdmFsdWU6IGtleSwgbGFiZWw6IGxhYmVsLCBvbkNoZWNrOiB0aGlzLm9uQ2hlY2suYmluZCh2YWx1ZSkgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlWydmaWVsZHMnXVtrZXldICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxWYWx1ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiaW5mb1BhbmVsUm93XCIsIGtleToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsTGFiZWwnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgY29sdW1uID0geyBuYW1lOiBrZXkgfTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3N0YXJzX3JhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChNZXRhU3RhcnNSZW5kZXJlciwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjc3NfbGFiZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChDU1NMYWJlbHNGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2hvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2VsZWN0b3JGaWx0ZXIsIHsgbm9kZTogbm9kZSwgY29sdW1uOiBjb2x1bW4gfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFRhZ3NDbG91ZCwgeyBub2RlOiBub2RlLCBjb2x1bW46IGNvbHVtbiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlYWxWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBub25FbXB0eURhdGFDb3VudCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRhLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImluZm9QYW5lbFJvd1wiICsgKCFyZWFsVmFsdWUgPyAnIG5vLXZhbHVlJyA6ICcnKSwga2V5OiBrZXkgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbmZvUGFuZWxMYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW5mb1BhbmVsVmFsdWUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5lZGl0TW9kZSAmJiAhbm9uRW1wdHlEYXRhQ291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMjMpJywgcGFkZGluZ0JvdHRvbTogMTAgfSwgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5vblJlcXVlc3RFZGl0TW9kZSB9LFxuICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnVzZXIuMTEnXVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBsZWdlbmQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgIGxlZ2VuZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS51c2VyLjEyJ11cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnVzZXIuMTMnXVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIG92ZXJmbG93WTogJ3Njcm9sbCcgfSB9LFxuICAgICAgICAgICAgICAgIGxlZ2VuZCxcbiAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcblxudmFyIEluZm9QYW5lbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0luZm9QYW5lbCcsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbm9kZTogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyBlZGl0TW9kZTogZmFsc2UgfTtcbiAgICB9LFxuXG4gICAgb3BlbkVkaXRNb2RlOiBmdW5jdGlvbiBvcGVuRWRpdE1vZGUoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogdHJ1ZSB9KTtcbiAgICB9LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnJlZnMucGFuZWwucmVzZXRVcGRhdGVEYXRhKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0TW9kZTogZmFsc2UgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgaWYgKG5ld1Byb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSAmJiB0aGlzLnJlZnMucGFuZWwpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzYXZlQ2hhbmdlczogZnVuY3Rpb24gc2F2ZUNoYW5nZXMoKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLnJlZnMucGFuZWwuZ2V0VXBkYXRlRGF0YSgpO1xuICAgICAgICB2YXIgcGFyYW1zID0ge307XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgICAgICBwYXJhbXNba10gPSB2O1xuICAgICAgICB9KTtcbiAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkucG9zdFNlbGVjdGlvbldpdGhBY3Rpb24oXCJlZGl0X3VzZXJfbWV0YVwiLCAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnBhcnNlWG1sTWVzc2FnZSh0LnJlc3BvbnNlWE1MKTtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSwgbnVsbCwgcGFyYW1zKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgICAgIHZhciBNZXNzYWdlSGFzaCA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE1hdGVyaWFsVUkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgIGtleTogJ2NhbmNlbCcsXG4gICAgICAgICAgICAgICAgbGFiZWw6IE1lc3NhZ2VIYXNoWyc1NCddLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1LnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmdldE1ldGFkYXRhKCkuaGFzKCdub2RlX3JlYWRvbmx5JykpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE1hdGVyaWFsVUkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgIGtleTogJ2VkaXQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnN0YXRlLmVkaXRNb2RlID8gTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xNSddIDogTWVzc2FnZUhhc2hbJ21ldGEudXNlci4xNCddLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgIV90aGlzNS5zdGF0ZS5lZGl0TW9kZSA/IF90aGlzNS5vcGVuRWRpdE1vZGUoKSA6IF90aGlzNS5zYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgUHlkaW9Xb3Jrc3BhY2VzLkluZm9QYW5lbENhcmQsXG4gICAgICAgICAgICB7IGlkZW50aWZpZXI6IFwibWV0YS11c2VyXCIsIHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlLCB0aXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnbWV0YS51c2VyLjEnXSwgYWN0aW9uczogYWN0aW9ucy5sZW5ndGggPyBhY3Rpb25zIDogbnVsbCwgaWNvbjogJ3RhZy1tdWx0aXBsZScsIGljb25Db2xvcjogJyMwMEFDQzEnIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFVzZXJNZXRhUGFuZWwsIHtcbiAgICAgICAgICAgICAgICByZWY6ICdwYW5lbCcsXG4gICAgICAgICAgICAgICAgbm9kZTogdGhpcy5wcm9wcy5ub2RlLFxuICAgICAgICAgICAgICAgIGVkaXRNb2RlOiB0aGlzLnN0YXRlLmVkaXRNb2RlLFxuICAgICAgICAgICAgICAgIG9uUmVxdWVzdEVkaXRNb2RlOiB0aGlzLm9wZW5FZGl0TW9kZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHMuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbmV4cG9ydHMuSW5mb1BhbmVsID0gSW5mb1BhbmVsO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLlVzZXJNZXRhRGlhbG9nID0gVXNlck1ldGFEaWFsb2c7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcblxuZXhwb3J0cy5SZW5kZXJlciA9IF9jb21wb25lbnRzLlJlbmRlcmVyO1xuZXhwb3J0cy5JbmZvUGFuZWwgPSBfY29tcG9uZW50cy5JbmZvUGFuZWw7XG5leHBvcnRzLkNhbGxiYWNrcyA9IF9jb21wb25lbnRzLkNhbGxiYWNrcztcbmV4cG9ydHMuVXNlck1ldGFEaWFsb2cgPSBfY29tcG9uZW50cy5Vc2VyTWV0YURpYWxvZztcbiJdfQ==
