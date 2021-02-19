'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Loader = require('./Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _SitesParameters = require("./SitesParameters");

var _SitesParameters2 = _interopRequireDefault(_SitesParameters);

/**
 * Editor for a given plugin. By default, displays documentation in a left column panel,
 * and plugin parameters as form cards on the right.
 * May take additionalPanes to be appended to the form cards.
 */
var PluginEditor = (0, _createReactClass2['default'])({
    displayName: 'PluginEditor',
    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        pluginId: _propTypes2['default'].string.isRequired,
        close: _propTypes2['default'].func,
        style: _propTypes2['default'].string,
        className: _propTypes2['default'].string,
        additionalPanes: _propTypes2['default'].shape({
            top: _propTypes2['default'].array,
            bottom: _propTypes2['default'].array
        }),
        docAsAdditionalPane: _propTypes2['default'].bool,
        additionalDescription: _propTypes2['default'].string,
        registerCloseCallback: _propTypes2['default'].func,
        onBeforeSave: _propTypes2['default'].func,
        onAfterSave: _propTypes2['default'].func,
        onRevert: _propTypes2['default'].func,
        onDirtyChange: _propTypes2['default'].func,
        accessByName: _propTypes2['default'].func
    },

    loadPluginData: function loadPluginData(plugId) {
        var _this = this;

        var loader = _Loader2['default'].getInstance(this.props.pydio);
        Promise.all([loader.loadPlugins(), loader.loadPluginConfigs(plugId)]).then(function (result) {
            var xml = result[0];
            var values = result[1];

            var xmlData = _pydioUtilXml2['default'].XPathSelectSingleNode(xml, '/plugins/*[@id="' + plugId + '"]');
            var params = PydioForm.Manager.parseParameters(xmlData, "server_settings/global_param");
            // Set Defaults
            params.forEach(function (param) {
                if (values[param.name] === undefined && param['default']) {
                    values[param.name] = param['default'];
                }
            });

            var documentation = _pydioUtilXml2['default'].XPathSelectSingleNode(xmlData, "//plugin_doc");
            var enabledAlways = false;
            var label = xmlData.getAttribute("label");
            var description = xmlData.getAttribute("description");
            try {
                enabledAlways = xmlData.getAttribute("enabled") === 'always';
            } catch (e) {}
            _this.setState({
                loaded: true,
                parameters: params,
                values: values,
                originalValues: _pydioUtilLang2['default'].deepCopy(values),
                documentation: documentation,
                enabledAlways: enabledAlways,
                dirty: false,
                label: label,
                description: description
            });

            if (_this.props.registerCloseCallback) {
                _this.props.registerCloseCallback(function () {
                    if (_this.state && _this.state.dirty && !confirm(_this.context.getMessage('19', 'role_editor'))) {
                        return false;
                    }
                });
            }
        });
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.pluginId && nextProps.pluginId !== this.props.pluginId) {
            this.loadPluginData(nextProps.pluginId);
            this.setState({ values: {} });
        }
    },

    computeButtons: function computeButtons() {
        var dirty = this.state.dirty;

        var actions = [];
        var adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
        var props = adminStyles.props.header.flatButton;
        if (!dirty) {
            props = adminStyles.props.header.flatButtonDisabled;
        }
        actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, disabled: !dirty, label: this.context.getMessage('plugins.6'), onClick: this.revert }, props)));
        actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, disabled: !dirty, label: this.context.getMessage('plugins.5'), onClick: this.save }, props)));
        return actions;
    },

    componentDidMount: function componentDidMount() {
        var onHeaderChange = this.props.onHeaderChange;

        if (onHeaderChange) {
            onHeaderChange({ buttons: this.computeButtons() });
        }
    },

    getInitialState: function getInitialState() {
        var pluginId = this.props.pluginId;

        if (pluginId) {
            this.loadPluginData(pluginId);
        }

        return {
            loaded: false,
            parameters: [],
            values: {},
            documentation: '',
            dirty: false,
            label: '',
            docOpen: false
        };
    },

    setDirty: function setDirty(value) {
        var _this2 = this;

        var onHeaderChange = this.props.onHeaderChange;

        this.setState({ dirty: value }, function () {
            if (onHeaderChange) {
                onHeaderChange({ buttons: _this2.computeButtons() });
            }
        });
    },

    externalSetDirty: function externalSetDirty() {
        this.setDirty(true);
    },

    onChange: function onChange(formValues, dirty) {
        this.setState({ values: formValues });
        this.setDirty(dirty);
        if (this.props.onDirtyChange) {
            this.props.onDirtyChange(dirty, formValues);
        }
    },

    save: function save() {
        var _this3 = this;

        _Loader2['default'].getInstance(this.props.pydio).savePluginConfigs(this.props.pluginId, this.state.values, function (newValues) {
            _this3.setDirty(false);
            if (_this3.props.onAfterSave) {
                _this3.props.onAfterSave(newValues);
            }
        });
    },

    revert: function revert() {
        this.setState({ values: this.state.originalValues });
        this.setDirty(false);
        if (this.props.onRevert) {
            this.props.onRevert(this.state.originalValues);
        }
    },

    parameterHasHelper: function parameterHasHelper(paramName, testPluginId) {
        paramName = paramName.split('/').pop();
        var h = PydioForm.Manager.hasHelper(this.props.pluginId, paramName);
        if (!h && testPluginId) {
            h = PydioForm.Manager.hasHelper(testPluginId, paramName);
        }
        return h;
    },

    showHelper: function showHelper(helperData, testPluginId) {
        if (helperData) {
            var plugId = this.props.pluginId;
            if (testPluginId && !PydioForm.Manager.hasHelper(plugId, helperData['name'])) {
                helperData['pluginId'] = testPluginId;
            } else {
                helperData['pluginId'] = plugId;
            }
            helperData['updateCallback'] = this.helperUpdateValues.bind(this);
        }
        this.setState({ helperData: helperData });
    },

    closeHelper: function closeHelper() {
        this.setState({ helperData: null });
    },

    /**
     * External helper can pass a full set of values and update them
     * @param newValues
     */
    helperUpdateValues: function helperUpdateValues(newValues) {
        this.onChange(newValues, true);
    },

    toggleDocPane: function toggleDocPane() {
        this.setState({ docOpen: !this.state.docOpen });
    },

    monitorMainPaneScrolling: function monitorMainPaneScrolling(event) {
        if (event.target.className.indexOf('pydio-form-panel') === -1) {
            return;
        }
        var scroll = event.target.scrollTop;
        var newState = scroll > 5;
        var currentScrolledState = this.state && this.state.mainPaneScrolled;
        if (newState !== currentScrolledState) {
            this.setState({ mainPaneScrolled: newState });
        }
    },

    render: function render() {
        var _props = this.props;
        var closeEditor = _props.closeEditor;
        var additionalPanes = _props.additionalPanes;
        var currentNode = _props.currentNode;
        var accessByName = _props.accessByName;
        var docAsAdditionalPane = _props.docAsAdditionalPane;
        var onHeaderChange = _props.onHeaderChange;
        var pluginId = _props.pluginId;
        var pydio = _props.pydio;
        var _state = this.state;
        var dirty = _state.dirty;
        var mainPaneScrolled = _state.mainPaneScrolled;
        var label = _state.label;
        var documentation = _state.documentation;

        var addPanes = { top: [], bottom: [] };
        if (additionalPanes) {
            addPanes.top = additionalPanes.top.slice();
            addPanes.bottom = additionalPanes.bottom.slice();
        }
        if (pluginId === 'core.pydio') {
            addPanes.bottom.push(_react2['default'].createElement(_SitesParameters2['default'], { type: "sites", pydio: pydio, m: this.context.getMessage }), _react2['default'].createElement(_SitesParameters2['default'], { type: "externals", pydio: pydio, m: this.context.getMessage }));
        }

        var doc = documentation;
        if (doc && docAsAdditionalPane) {
            doc = doc.firstChild.nodeValue.replace('<p><ul', '<ul').replace('</ul></p>', '</ul>').replace('<p></p>', '');
            doc = doc.replace('<img src="', '<img style="width:90%;" src="plug/' + this.props.pluginId + '/');
            var readDoc = function readDoc() {
                return { __html: doc };
            };
            var docPane = _react2['default'].createElement(
                'div',
                { className: "plugin-doc" + (this.state.docOpen ? ' plugin-doc-open' : '') },
                _react2['default'].createElement(
                    'h3',
                    null,
                    this.context.getMessage('plugins.documentation')
                ),
                _react2['default'].createElement('div', { className: 'plugin-doc-pane', dangerouslySetInnerHTML: readDoc() })
            );
            addPanes.top.push(docPane);
        }

        var scrollingClassName = '';
        if (mainPaneScrolled) {
            scrollingClassName = ' main-pane-scrolled';
        }
        var adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
        var bProps = adminStyles.props.header.flatButton;
        if (!dirty) {
            bProps = adminStyles.props.header.flatButtonDisabled;
        }

        var actions = [];
        if (accessByName('Create')) {
            if (closeEditor) {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-undo",
                    iconStyle: { color: dirty ? 'white' : 'rgba(255,255,255,.5)' }, disabled: !dirty,
                    tooltip: this.context.getMessage('plugins.6'), onClick: this.revert }));
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-content-save",
                    iconStyle: { color: dirty ? 'white' : 'rgba(255,255,255,.5)' }, disabled: !dirty,
                    tooltip: this.context.getMessage('plugins.5'), onClick: this.save }));
                actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", iconStyle: { color: 'white' },
                    tooltip: this.context.getMessage('86', ''), onClick: closeEditor }));
            } else {
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ secondary: true, disabled: !dirty, label: this.context.getMessage('plugins.6'),
                    onClick: this.revert }, bProps)));
                actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ secondary: true, disabled: !dirty, label: this.context.getMessage('plugins.5'),
                    onClick: this.save }, bProps)));
            }
        } else if (closeEditor) {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", iconStyle: { color: 'white' },
                tooltip: this.context.getMessage('86', ''), onClick: closeEditor }));
        }

        var titleLabel = undefined,
            titleIcon = undefined;
        if (currentNode) {
            titleLabel = currentNode.getLabel();
            titleIcon = currentNode.getMetadata().get("icon_class");
        } else {
            titleLabel = label;
        }

        // Building  a form
        return _react2['default'].createElement(
            'div',
            { className: (this.props.className ? this.props.className + " " : "") + "main-layout-nav-to-stack vertical-layout plugin-board" + scrollingClassName, style: this.props.style },
            !onHeaderChange && _react2['default'].createElement(AdminComponents.Header, { title: titleLabel, actions: actions, scrolling: this.state && this.state.mainPaneScrolled, icon: titleIcon, editorMode: !!closeEditor }),
            _react2['default'].createElement(PydioForm.FormPanel, {
                ref: 'formPanel',
                className: 'row-flex',
                parameters: this.state.parameters,
                values: this.state.values,
                onChange: this.onChange,
                disabled: !accessByName('Create'),
                additionalPanes: addPanes,
                tabs: this.props.tabs,
                setHelperData: this.showHelper,
                checkHasHelper: this.parameterHasHelper,
                onScrollCallback: this.monitorMainPaneScrolling
            }),
            _react2['default'].createElement(PydioForm.PydioHelper, {
                helperData: this.state ? this.state.helperData : null,
                close: this.closeHelper
            }),
            adminStyles.formCss()
        );
    }
});

exports['default'] = PluginEditor = (0, _materialUiStyles.muiThemeable)()(PluginEditor);

exports['default'] = PluginEditor;
module.exports = exports['default'];
