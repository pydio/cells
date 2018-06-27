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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global) {
    var Renderer = (function () {
        function Renderer() {
            _classCallCheck(this, Renderer);
        }

        _createClass(Renderer, null, [{
            key: "getMetadataConfigs",
            value: function getMetadataConfigs() {

                if (pydio && pydio.user && pydio.user.activeRepository && Renderer.__CACHE && Renderer.__CACHE.has(pydio.user.activeRepository)) {
                    return Renderer.__CACHE.get(pydio.user.activeRepository);
                }
                var configMap = new Map();
                try {
                    var configs = JSON.parse(pydio.getPluginConfigs("meta.user").get("meta_definitions"));
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
                } catch (e) {
                    //console.debug(e);
                }
                if (pydio && pydio.user && pydio.user.activeRepository) {
                    if (!Renderer.__CACHE) Renderer.__CACHE = new Map();
                    Renderer.__CACHE.set(pydio.user.activeRepository, configMap);
                }
                return configMap;
            }
        }, {
            key: "renderStars",
            value: function renderStars(node, column) {
                return React.createElement(MetaStarsRenderer, { node: node, column: column, size: "small" });
            }
        }, {
            key: "renderSelector",
            value: function renderSelector(node, column) {
                return React.createElement(SelectorFilter, { node: node, column: column });
            }
        }, {
            key: "renderCSSLabel",
            value: function renderCSSLabel(node, column) {
                return React.createElement(CSSLabelsFilter, { node: node, column: column });
            }
        }, {
            key: "renderTagsCloud",
            value: function renderTagsCloud(node, column) {
                return React.createElement(
                    "span",
                    null,
                    node.getMetadata().get(column.name)
                );
            }
        }, {
            key: "formPanelStars",
            value: function formPanelStars(props) {
                return React.createElement(StarsFormPanel, props);
            }
        }, {
            key: "formPanelCssLabels",
            value: function formPanelCssLabels(props) {

                var menuItems = Object.keys(CSSLabelsFilter.CSS_LABELS).map((function (id) {
                    var label = CSSLabelsFilter.CSS_LABELS[id];
                    //return {payload:id, text:label.label};
                    return React.createElement(MaterialUI.MenuItem, { value: id, primaryText: label.label });
                }).bind(this));

                return React.createElement(MetaSelectorFormPanel, _extends({}, props, { menuItems: menuItems }));
            }
        }, {
            key: "formPanelSelectorFilter",
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
            key: "formPanelTags",
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
            key: "editMeta",
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
        displayName: "StarsFormPanel",

        mixins: [MetaFieldFormPanelMixin],

        getInitialState: function getInitialState() {
            return { value: this.props.value || 0 };
        },

        render: function render() {
            var value = this.state.value;
            var stars = [-1, 0, 1, 2, 3, 4].map((function (v) {
                var ic = 'star' + (v === -1 ? '-off' : value > v ? '' : '-outline');
                var style = v === -1 ? { marginRight: 5, cursor: 'pointer' } : { cursor: 'pointer' };
                return React.createElement("span", { key: "star-" + v, onClick: this.updateValue.bind(this, v + 1), className: "mdi mdi-" + ic, style: style });
            }).bind(this));
            return React.createElement(
                "div",
                { className: "advanced-search-stars", style: starsStyle },
                React.createElement(
                    "div",
                    null,
                    stars
                )
            );
        }

    });

    var MetaStarsRenderer = React.createClass({
        displayName: "MetaStarsRenderer",

        mixins: [MetaFieldRendererMixin],

        render: function render() {
            var value = this.getRealValue() || 0;
            var stars = [0, 1, 2, 3, 4].map(function (v) {
                return React.createElement("span", { key: "star-" + v, className: "mdi mdi-star" + (value > v ? '' : '-outline') });
            });
            var style = this.props.size === 'small' ? { color: starsStyle.color } : starsStyle;
            return React.createElement(
                "span",
                { style: style },
                stars
            );
        }

    });

    var SelectorFilter = React.createClass({
        displayName: "SelectorFilter",

        mixins: [MetaFieldRendererMixin],

        render: function render() {
            var value = undefined;
            var displayValue = value = this.getRealValue();
            var configs = Renderer.getMetadataConfigs().get(this.props.column.name);
            if (configs && configs.data) {
                displayValue = configs.data.get(value);
            }
            return React.createElement(
                "span",
                null,
                displayValue
            );
        }

    });

    var CSSLabelsFilter = React.createClass({
        displayName: "CSSLabelsFilter",

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
            var MessageHash = global.pydio.MessageHash;
            var value = this.getRealValue();
            var data = CSSLabelsFilter.CSS_LABELS;
            if (value && data[value]) {
                var dV = data[value];
                return React.createElement(
                    "span",
                    null,
                    React.createElement("span", { className: "mdi mdi-label", style: { color: dV.color } }),
                    " ",
                    dV.label
                );
            } else {
                return React.createElement(
                    "span",
                    null,
                    value
                );
            }
        }

    });

    var MetaSelectorFormPanel = React.createClass({
        displayName: "MetaSelectorFormPanel",

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
            this.props.menuItems.unshift(React.createElement(MaterialUI.MenuItem, { value: '', primaryText: "" }));
            return React.createElement(
                "div",
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
        displayName: "TagsCloud",

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

            if (node != null) {
                this.setState({ tags: node.getMetadata().get(column.name) });
            } else {
                this.setState({ tags: value });
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
                tags = React.createElement("div", null);
            }
            var autoCompleter = undefined;
            var textField = undefined;
            if (this.props.editMode) {
                autoCompleter = React.createElement(MaterialUI.AutoComplete, {
                    fullWidth: true,
                    hintText: global.pydio.MessageHash['meta.user.10'],
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
                autoCompleter = React.createElement("div", null);
            }

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { style: { display: 'flex', flexWrap: 'wrap' } },
                    tags
                ),
                autoCompleter
            );
        }

    });

    var UserMetaDialog = React.createClass({
        displayName: "UserMetaDialog",

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
                ref: "panel",
                node: this.props.selection.isUnique() ? this.props.selection.getUniqueNode() : new AjxpNode(),
                editMode: true
            });
        }
    });

    var UserMetaPanel = React.createClass({
        displayName: "UserMetaPanel",

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
            this.state.updateMeta["delete"](name);
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
                            "div",
                            { className: "infoPanelRow", key: key, style: { marginBottom: 20 } },
                            React.createElement(MaterialUI.Checkbox, { value: key, label: label, onCheck: this.onCheck.bind(value) }),
                            this.state['fields'][key] && React.createElement(
                                "div",
                                { className: "infoPanelValue" },
                                field
                            )
                        ));
                    } else {
                        data.push(React.createElement(
                            "div",
                            { className: "infoPanelRow", key: key },
                            React.createElement(
                                "div",
                                { className: "infoPanelLabel" },
                                label
                            ),
                            React.createElement(
                                "div",
                                { className: "infoPanelValue" },
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
                        "div",
                        { className: "infoPanelRow" + (!realValue ? ' no-value' : ''), key: key },
                        React.createElement(
                            "div",
                            { className: "infoPanelLabel" },
                            label
                        ),
                        React.createElement(
                            "div",
                            { className: "infoPanelValue" },
                            value
                        )
                    ));
                }
            }).bind(this));
            var mess = this.props.pydio.MessageHash;
            if (!this.props.editMode && !nonEmptyDataCount) {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "div",
                        { style: { color: 'rgba(0,0,0,0.23)', paddingBottom: 10 }, onTouchTap: this.props.onRequestEditMode },
                        mess['meta.user.11']
                    ),
                    data
                );
            } else {
                var legend = undefined;
                if (this.props.multiple) {
                    legend = React.createElement(
                        "div",
                        { style: { paddingBottom: 16 } },
                        React.createElement(
                            "em",
                            null,
                            mess['meta.user.12']
                        ),
                        " ",
                        mess['meta.user.13']
                    );
                }
                return React.createElement(
                    "div",
                    { style: { width: '100%', overflowY: 'scroll' } },
                    legend,
                    data
                );
            }
        }

    });

    var InfoPanel = React.createClass({
        displayName: "InfoPanel",

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
                    key: "cancel",
                    label: MessageHash['54'],
                    onClick: function () {
                        _this5.reset();
                    }
                }));
            }
            if (!this.props.node.getMetadata().has('node_readonly')) {
                actions.push(React.createElement(MaterialUI.FlatButton, {
                    key: "edit",
                    label: this.state.editMode ? MessageHash['meta.user.15'] : MessageHash['meta.user.14'],
                    onClick: function () {
                        !_this5.state.editMode ? _this5.openEditMode() : _this5.saveChanges();
                    }
                }));
            }

            return React.createElement(
                PydioWorkspaces.InfoPanelCard,
                { identifier: "meta-user", style: this.props.style, title: this.props.pydio.MessageHash['meta.user.1'], actions: actions.length ? actions : null, icon: "tag-multiple", iconColor: "#00ACC1" },
                React.createElement(UserMetaPanel, {
                    ref: "panel",
                    node: this.props.node,
                    editMode: this.state.editMode,
                    onRequestEditMode: this.openEditMode.bind(this),
                    pydio: this.props.pydio
                })
            );
        }

    });

    var ns = global.ReactMeta || {};
    ns.Renderer = Renderer;
    ns.InfoPanel = InfoPanel;
    ns.Callbacks = Callbacks;
    ns.UserMetaDialog = UserMetaDialog;

    global.ReactMeta = ns;
})(window);
