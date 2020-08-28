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
