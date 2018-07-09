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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _modelWorkspace = require('../model/Workspace');

var _modelWorkspace2 = _interopRequireDefault(_modelWorkspace);

var _panelSharesList = require('../panel/SharesList');

var _panelSharesList2 = _interopRequireDefault(_panelSharesList);

var _TplFieldsChooser = require('./TplFieldsChooser');

var _TplFieldsChooser2 = _interopRequireDefault(_TplFieldsChooser);

var _FeaturesList = require('./FeaturesList');

var _FeaturesList2 = _interopRequireDefault(_FeaturesList);

var WorkspaceEditor = (function (_React$Component) {
    _inherits(WorkspaceEditor, _React$Component);

    function WorkspaceEditor(props, context) {
        _classCallCheck(this, WorkspaceEditor);

        _get(Object.getPrototypeOf(WorkspaceEditor.prototype), 'constructor', this).call(this, props, context);
        this.state = {
            dirty: false,
            model: new _modelWorkspace2['default'](this.getWsId(), this.props.node.getAjxpMime() == "repository_editable"),
            edit: this.props.initialEditSection || 'general',
            saveData: {},
            saveMetaSourceData: { "delete": {}, "add": {}, "edit": {} }
        };
    }

    _createClass(WorkspaceEditor, [{
        key: 'getWsId',
        value: function getWsId() {
            return PathUtils.getBasename(this.props.node.getPath());
        }
    }, {
        key: 'getMetaSourceLabel',
        value: function getMetaSourceLabel(metaKey) {
            return this.state.model.getMetaSourceLabel(metaKey);
        }
    }, {
        key: 'getMetaSourceDescription',
        value: function getMetaSourceDescription(metaKey) {
            return this.state.model.getMetaSourceDescription(metaKey);
        }
    }, {
        key: 'clearMetaSourceDiff',
        value: function clearMetaSourceDiff() {
            this.setState({ saveMetaSourceData: { "delete": {}, "add": {}, "edit": {} } });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!this.state.model.loaded) this.loadModel();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (!this.state.model.loaded) this.loadModel();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (this.props.node.getPath() != newProps.node.getPath()) {
                var initState = {
                    dirty: false,
                    model: new _modelWorkspace2['default'](PathUtils.getBasename(newProps.node.getPath()), newProps.node.getAjxpMime() == "repository_editable"),
                    edit: this.props.initialEditSection || 'general',
                    saveData: {},
                    saveMetaSourceData: { "delete": {}, "add": {}, "edit": {} }
                };
                this.setState(initState);
            }
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.state.dirty;
        }
    }, {
        key: 'loadModel',
        value: function loadModel() {
            this.state.model.load((function (model) {
                if (model.isTemplate() && this.state.edit == 'activity') {
                    this.setState({ edit: 'tpl_children' });
                }
                this.setState({
                    model: model
                });
                if (this.props.registerCloseCallback) {
                    this.props.registerCloseCallback((function () {
                        if (this.isDirty() && !confirm(pydio.MessageHash["role_editor.19"])) {
                            return false;
                        }
                    }).bind(this));
                }
            }).bind(this));
        }
    }, {
        key: 'editMeta',
        value: function editMeta(metaKey) {
            this.setState({ edit: metaKey });
        }
    }, {
        key: 'onFormChange',
        value: function onFormChange(values) {
            var saveData = this.state.saveData || {};
            var saveMS = this.state.saveMetaSourceData;
            var metaKey = this.state.edit;
            if (this.refs.form) {
                if (metaKey == 'driver' || metaKey == 'general') {
                    saveData[metaKey + '_POST'] = this.refs.form.getValuesForPOST(values);
                } else {
                    saveMS['edit'][metaKey] = values;
                    if (saveMS['delete'][metaKey]) delete saveMS['delete'][metaKey];
                }
            }
            saveData[metaKey] = values;
            this.setState({
                dirty: true,
                saveData: saveData
            });
        }
    }, {
        key: 'updateValidStatus',
        value: function updateValidStatus(newStatus) {
            var validRecord = this.state.valid || {};
            validRecord[this.state.edit] = newStatus;
            this.setState({ valid: validRecord });
        }
    }, {
        key: 'onMaskChange',
        value: function onMaskChange(maskValues) {
            var saveData = this.state.saveData || {};
            saveData['permission-mask'] = maskValues;
            this.setState({ saveData: saveData, dirty: true });
        }
    }, {
        key: 'saveWorkspace',
        value: function saveWorkspace() {
            var dPost = this.state.saveData['driver_POST'] || {};
            var gPost = this.state.saveData['general_POST'] || {};
            this.props.saveWorkspace(this.state.model, LangUtils.mergeObjectsRecursive(gPost, dPost), LangUtils.mergeObjectsRecursive(this.state.saveData, { META_SOURCES: this.state.saveMetaSourceData }));
            this.setState({ dirty: false, valid: {} });
        }
    }, {
        key: 'deleteWorkspace',
        value: function deleteWorkspace() {
            this.props.deleteWorkspace(this.getWsId());
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.state.model.resetFromXml();
            this.setState({
                dirty: false,
                saveData: null,
                edit: 'activity',
                valid: {}
            });
        }
    }, {
        key: 'toggleTemplateField',
        value: function toggleTemplateField(name, value, oldSelectedFields) {
            var values = this.state.saveData ? this.state.saveData[this.state.edit] ? this.state.saveData[this.state.edit] : null : null;
            if (!values) {
                values = this.refs.form.getValues();
            }
            var selectedFields = {};
            oldSelectedFields.map(function (f) {
                selectedFields[f] = '';
            });
            values = LangUtils.mergeObjectsRecursive(selectedFields, values);
            if (value) {
                this.state.model.options.set(name, '');
                values[name] = '';
            } else if (this.state.model.options.has(name)) {
                this.state.model.options['delete'](name);
                if (values[name] !== undefined) {
                    delete values[name];
                }
            }
            this.onFormChange(values);
            this.setState({
                model: this.state.model
            });
        }
    }, {
        key: 'render',
        value: function render() {

            var editor, rightFill, tplFieldsComponent, h1, readonlyPanel;
            var workspaceLabel = this.context.getMessage('home.6'),
                driverLabel,
                driverDescription,
                featuresList = _react2['default'].createElement('div', { className: 'workspace-editor-left' });
            if (this.state.model.loaded) {

                switch (this.state.edit) {

                    case 'shares':

                        rightFill = true;
                        editor = _react2['default'].createElement(_panelSharesList2['default'], { model: this.state.model });

                        break;

                    default:

                        var formDefs = [],
                            formValues = {},
                            templateAllFormDefs = [];
                        editor = this.state.model.buildEditor(this.state.edit, formDefs, formValues, this.state.saveData, templateAllFormDefs);

                        if (!formDefs.length) {
                            editor = _react2['default'].createElement(
                                'div',
                                null,
                                this.context.getMessage('ws.68')
                            );
                            break;
                        }

                        editor = _react2['default'].createElement(PydioForm.FormPanel, {
                            ref: 'form',
                            parameters: formDefs,
                            values: formValues,
                            className: 'full-width',
                            onChange: this.onFormChange.bind(this),
                            onValidStatusChange: this.updateValidStatus.bind(this),
                            depth: -2,
                            disabled: !this.state.model.isEditable()
                        });

                        if (!this.state.model.isEditable()) {
                            readonlyPanel = _react2['default'].createElement(
                                'div',
                                { className: 'workspace-readonly-label' },
                                this.context.getMessage('ws.48')
                            );
                        }

                        if (this.state.edit == 'driver' && this.state.model.isTemplate()) {
                            var selectedFields = formDefs.map(function (p) {
                                return p.name;
                            });
                            tplFieldsComponent = _react2['default'].createElement(_TplFieldsChooser2['default'], {
                                driverName: this.state.model.getDriverLabel(),
                                driverFields: templateAllFormDefs,
                                selectedFields: selectedFields,
                                onToggleField: this.toggleTemplateField.bind(this),
                                style: { padding: '0 16px' }
                            });
                        } else if (this.state.edit == 'general') {
                            if (this.state.model.isTemplate()) {
                                h1 = _react2['default'].createElement(
                                    'h1',
                                    { className: 'workspace-general-h1' },
                                    this.context.getMessage('ws.21')
                                );
                            } else {
                                h1 = _react2['default'].createElement(
                                    'h1',
                                    { className: 'workspace-general-h1' },
                                    this.context.getMessage('ws.22')
                                );
                            }
                        }

                        break;
                }

                driverLabel = this.state.model.getDriverLabel();
                driverDescription = this.state.model.getDriverDescription();
                workspaceLabel = this.state.model.getOption('display');

                featuresList = _react2['default'].createElement(_FeaturesList2['default'], {
                    onSelectionChange: this.editMeta.bind(this),
                    currentSelection: this.state.edit,
                    model: this.state.model,
                    driverLabel: driverLabel,
                    driverDescription: driverDescription,
                    metaSourceProvider: this,
                    tplFieldsComponent: tplFieldsComponent
                });
            }

            var currentValid = true;
            if (this.state.valid) {
                LangUtils.objectValues(this.state.valid).map(function (v) {
                    currentValid = currentValid && v;
                });
            }

            var titleActionBarButtons = [];
            if (this.state.model && this.state.model.isEditable()) {
                titleActionBarButtons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'delete', label: this.context.getMessage('ws.23'), secondary: true, onTouchTap: this.deleteWorkspace.bind(this) }));
                titleActionBarButtons.push(_react2['default'].createElement('div', { style: { display: 'inline', borderRight: '1px solid #757575', margin: '0 2px' }, key: 'separator' }));
            }
            titleActionBarButtons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'reset', label: this.context.getMessage('plugins.6'), onTouchTap: this.reset.bind(this), secondary: true, disabled: !this.state.dirty }));
            titleActionBarButtons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'save', label: this.context.getMessage('53', ''), onTouchTap: this.saveWorkspace.bind(this), secondary: true, disabled: !this.state.dirty || !currentValid }));
            titleActionBarButtons.push(_react2['default'].createElement(_materialUi.RaisedButton, { key: 'close', label: this.context.getMessage('86', ''), onTouchTap: this.props.closeEditor }));

            return _react2['default'].createElement(
                PydioComponents.PaperEditorLayout,
                {
                    title: workspaceLabel,
                    titleActionBar: titleActionBarButtons,
                    leftNav: featuresList,
                    className: 'workspace-editor',
                    contentFill: rightFill
                },
                readonlyPanel,
                h1,
                editor
            );
        }
    }]);

    return WorkspaceEditor;
})(_react2['default'].Component);

;

WorkspaceEditor.contextTypes = {
    messages: _react2['default'].PropTypes.object,
    getMessage: _react2['default'].PropTypes.func
};

WorkspaceEditor.propTypes = {
    node: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
    closeEditor: _react2['default'].PropTypes.func.isRequired,
    metaSourceProvider: _react2['default'].PropTypes.object,
    initialEditSection: _react2['default'].PropTypes.string,
    saveWorkspace: _react2['default'].PropTypes.func,
    deleteWorkspace: _react2['default'].PropTypes.func,
    registerCloseCallback: _react2['default'].PropTypes.func
};

exports['default'] = WorkspaceEditor;
module.exports = exports['default'];
