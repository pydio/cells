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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

/**
 * Editor for a given plugin. By default, displays documentation in a left column panel,
 * and plugin parameters as form cards on the right.
 * May take additionalPanes to be appended to the form cards.
 */
var PluginEditor = _react2['default'].createClass({
    displayName: 'PluginEditor',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        rootNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        close: _react2['default'].PropTypes.func,
        style: _react2['default'].PropTypes.string,
        className: _react2['default'].PropTypes.string,
        additionalPanes: _react2['default'].PropTypes.shape({
            top: _react2['default'].PropTypes.array,
            bottom: _react2['default'].PropTypes.array
        }),
        docAsAdditionalPane: _react2['default'].PropTypes.bool,
        additionalDescription: _react2['default'].PropTypes.string,
        registerCloseCallback: _react2['default'].PropTypes.func,
        onBeforeSave: _react2['default'].PropTypes.func,
        onAfterSave: _react2['default'].PropTypes.func,
        onRevert: _react2['default'].PropTypes.func,
        onDirtyChange: _react2['default'].PropTypes.func
    },

    loadPluginData: function loadPluginData(plugId) {

        PydioApi.getClient().request({
            get_action: 'get_plugin_manifest',
            plugin_id: plugId
        }, (function (transport) {

            var xmlData = transport.responseXML;
            var params = PydioForm.Manager.parseParameters(xmlData, "//global_param");
            var xmlValues = XMLUtils.XPathSelectNodes(xmlData, "//plugin_settings_values/param");
            var documentation = XMLUtils.XPathSelectSingleNode(xmlData, "//plugin_doc");
            var enabledAlways = false;
            var rootNode = XMLUtils.XPathSelectSingleNode(xmlData, "admin_data");
            var label = rootNode.firstChild.attributes.getNamedItem("label").value;
            var description = rootNode.firstChild.attributes.getNamedItem("description").value;
            try {
                enabledAlways = rootNode.firstChild.attributes.getNamedItem("enabled").value === 'always';
            } catch (e) {}

            var paramsValues = {};
            xmlValues.forEach(function (child) {
                if (child.nodeName != 'param') return;
                var valueParamName = child.getAttribute("name");
                if (child.getAttribute("cdatavalue")) {
                    paramsValues[valueParamName] = child.firstChild.nodeValue;
                } else {
                    paramsValues[valueParamName] = child.getAttribute('value');
                }
                var cType = null;
                params.map(function (def) {
                    if (def.name == valueParamName) cType = def.type;
                });
                if (cType == 'boolean') paramsValues[valueParamName] = paramsValues[valueParamName] == "true";else if (cType == 'integer') paramsValues[valueParamName] = parseInt(paramsValues[valueParamName]);
            });

            this.setState({
                loaded: true,
                parameters: params,
                values: paramsValues,
                originalValues: LangUtils.deepCopy(paramsValues),
                documentation: documentation,
                enabledAlways: enabledAlways,
                dirty: false,
                label: label,
                description: description,
                pluginId: plugId
            });

            if (this.props.registerCloseCallback) {
                this.props.registerCloseCallback((function () {
                    if (this.state && this.state.dirty && !confirm(this.context.getMessage('19', 'role_editor'))) {
                        return false;
                    }
                }).bind(this));
            }
        }).bind(this));
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.rootNode.getPath() != this.props.rootNode.getPath()) {
            this.loadPluginData(PathUtils.getBasename(nextProps.rootNode.getPath()));
            this.setState({ values: {} });
        }
    },

    getInitialState: function getInitialState() {

        var plugId = PathUtils.getBasename(this.props.rootNode.getPath());
        this.loadPluginData(plugId);

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

    externalSetDirty: function externalSetDirty() {
        this.setState({ dirty: true });
    },

    onChange: function onChange(formValues, dirty) {
        this.setState({ dirty: dirty, values: formValues });
        if (this.props.onDirtyChange) {
            this.props.onDirtyChange(dirty, formValues);
        }
    },

    save: function save() {
        var clientParams = {
            get_action: "edit",
            sub_action: "edit_plugin_options",
            plugin_id: this.state.pluginId
        };
        var postParams = this.refs['formPanel'].getValuesForPOST(this.state.values);
        if (postParams['DRIVER_OPTION_PYDIO_PLUGIN_ENABLED']) {
            postParams['DRIVER_OPTION_PYDIO_PLUGIN_ENABLED_ajxptype'] = "boolean";
        }
        clientParams = LangUtils.mergeObjectsRecursive(clientParams, postParams);
        if (this.props.onBeforeSave) {
            this.props.onBeforeSave(clientParams);
        }
        PydioApi.getClient().request(clientParams, (function (transport) {
            this.setState({ dirty: false });
            if (this.props.onAfterSave) {
                this.props.onAfterSave(transport);
            }
        }).bind(this));
    },

    revert: function revert() {
        this.setState({ dirty: false, values: this.state.originalValues });
        if (this.props.onRevert) {
            this.props.onRevert(this.state.originalValues);
        }
    },

    parameterHasHelper: function parameterHasHelper(paramName, testPluginId) {
        paramName = paramName.split('/').pop();
        var h = PydioForm.Manager.hasHelper(PathUtils.getBasename(this.props.rootNode.getPath()), paramName);
        if (!h && testPluginId) {
            h = PydioForm.Manager.hasHelper(testPluginId, paramName);
        }
        return h;
    },

    showHelper: function showHelper(helperData, testPluginId) {
        if (helperData) {
            var plugId = PathUtils.getBasename(this.props.rootNode.getPath());
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
        if (newState != currentScrolledState) {
            this.setState({ mainPaneScrolled: newState });
        }
    },

    render: function render() {

        var addPanes = { top: [], bottom: [] };
        if (this.props.additionalPanes) {
            addPanes.top = this.props.additionalPanes.top.slice();
            addPanes.bottom = this.props.additionalPanes.bottom.slice();
        }
        var closeButton;
        if (this.props.closeEditor) {
            closeButton = _react2['default'].createElement(_materialUi.RaisedButton, { label: this.context.getMessage('86', ''), onTouchTap: this.props.closeEditor });
        }

        var doc = this.state.documentation;
        if (doc && this.props.docAsAdditionalPane) {
            doc = doc.firstChild.nodeValue.replace('<p><ul', '<ul').replace('</ul></p>', '</ul>').replace('<p></p>', '');
            doc = doc.replace('<img src="', '<img style="width:90%;" src="plugins/' + this.state.pluginId + '/');
            var readDoc = function readDoc() {
                return { __html: doc };
            };
            var docPane = _react2['default'].createElement(
                'div',
                { className: "plugin-doc" + (this.state.docOpen ? ' plugin-doc-open' : '') },
                _react2['default'].createElement(
                    'h3',
                    null,
                    'Documentation'
                ),
                _react2['default'].createElement('div', { className: 'plugin-doc-pane', dangerouslySetInnerHTML: readDoc() })
            );
            addPanes.top.push(docPane);
        }

        var scrollingClassName = '';
        if (this.state && this.state.mainPaneScrolled) {
            scrollingClassName = ' main-pane-scrolled';
        }
        var actions = [];
        actions.push(_react2['default'].createElement(_materialUi.FlatButton, { secondary: true, disabled: !this.state.dirty, label: this.context.getMessage('plugins.6'), onTouchTap: this.revert }));
        actions.push(_react2['default'].createElement(_materialUi.FlatButton, { secondary: true, disabled: !this.state.dirty, label: this.context.getMessage('plugins.5'), onTouchTap: this.save }));
        actions.push(closeButton);

        var icon = undefined;
        if (this.props.rootNode.getMetadata().has('icon_class')) {
            icon = this.props.rootNode.getMetadata().get('icon_class');
        }
        // Building  a form
        return _react2['default'].createElement(
            'div',
            { className: (this.props.className ? this.props.className + " " : "") + "main-layout-nav-to-stack vertical-layout plugin-board" + scrollingClassName, style: this.props.style },
            _react2['default'].createElement(AdminComponents.Header, { title: this.state.label, actions: actions, scrolling: this.state && this.state.mainPaneScrolled, icon: icon }),
            _react2['default'].createElement(PydioForm.FormPanel, {
                ref: 'formPanel',
                className: 'row-flex',
                parameters: this.state.parameters,
                values: this.state.values,
                onChange: this.onChange,
                disabled: false,
                additionalPanes: addPanes,
                tabs: this.props.tabs,
                setHelperData: this.showHelper,
                checkHasHelper: this.parameterHasHelper,
                onScrollCallback: this.monitorMainPaneScrolling
            }),
            _react2['default'].createElement(PydioForm.PydioHelper, {
                helperData: this.state ? this.state.helperData : null,
                close: this.closeHelper
            })
        );
    }
});

exports['default'] = PluginEditor;
module.exports = exports['default'];
