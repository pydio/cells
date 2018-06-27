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

var _modelWorkspace = require('../model/Workspace');

var _modelWorkspace2 = _interopRequireDefault(_modelWorkspace);

exports['default'] = _react2['default'].createClass({
    displayName: 'FeaturesListWizard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        onSelectionChange: _react2['default'].PropTypes.func.isRequired,
        driverLabel: _react2['default'].PropTypes.string,
        driverDescription: _react2['default'].PropTypes.string,
        currentSelection: _react2['default'].PropTypes.string,
        wizardType: _react2['default'].PropTypes.string,
        driversLoaded: _react2['default'].PropTypes.bool,
        additionalComponents: _react2['default'].PropTypes.object,
        disableCreateButton: _react2['default'].PropTypes.bool
    },

    getInitialState: function getInitialState() {
        return {
            edit: this.props.wizardType == 'workspace' ? 'template' : 'general',
            step: 1,
            subStep1: 'template'
        };
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (newProps.currentSelection) {
            this.setState({ edit: newProps.currentSelection });
        }
    },

    setEditState: function setEditState(key) {
        this.props.onSelectionChange(key);
        this.setState({ edit: key });
    },

    closeCurrent: function closeCurrent(event) {
        event.stopPropagation();
    },

    dropDownChange: function dropDownChange(item) {
        if (item.payload.name) {
            this.setState({ step: 3 });
        }
        this.setState({ edit: 'driver', selectedDriver: item.payload.name });
        this.props.onSelectionChange('driver', item.payload.name);
    },

    dropChangeDriverOrTemplate: function dropChangeDriverOrTemplate(event, item) {
        if (item == 'template') {
            this.setState({ step: 1, subStep1: item });
        } else {
            this.setState({ step: 2, subStep1: 'driver' });
            this.setEditState('general');
        }
    },

    dropDownChangeTpl: function dropDownChangeTpl(item) {
        if (item.payload != -1) {
            var tpl = item.payload == "0" ? "0" : item.payload.name;
            this.setState({
                edit: 'general',
                selectedTemplate: tpl == "0" ? null : tpl,
                step: 2
            });
            this.props.onSelectionChange('general', null, tpl);
        }
    },

    render: function render() {

        var step1, step2, step3;

        if (this.props.wizardType == 'workspace') {

            // TEMPLATES SELECTOR
            var driverOrTemplate = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    ReactMUI.RadioButtonGroup,
                    { name: 'driv_or_tpl', onChange: this.dropChangeDriverOrTemplate, defaultSelected: this.state.subStep1 },
                    _react2['default'].createElement(ReactMUI.RadioButton, { value: 'template', label: this.context.getMessage('ws.8') }),
                    _react2['default'].createElement(ReactMUI.RadioButton, { value: 'driver', label: this.context.getMessage('ws.9') })
                )
            );

            var templateSelector = null;
            if (this.state.step == 1 && this.state.subStep1 == "template") {
                templateSelector = _react2['default'].createElement(PydioComponents.PaperEditorNavEntry, {
                    label: this.context.getMessage('ws.10'),
                    selectedKey: this.state.edit,
                    keyName: 'template',
                    onClick: this.setEditState,
                    dropDown: true,
                    dropDownData: this.props.driversLoaded ? _modelWorkspace2['default'].TEMPLATES : null,
                    dropDownChange: this.dropDownChangeTpl,
                    dropDownDefaultItems: []
                });
            }

            step1 = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(PydioComponents.PaperEditorNavHeader, { key: 'tpl-k', label: "1 - " + this.context.getMessage('ws.11') }),
                driverOrTemplate,
                templateSelector
            );
        }

        // DRIVER SELECTOR STEP
        if (this.state.step > 1 || this.props.wizardType == 'template') {

            if (this.props.wizardType == 'workspace' && this.state.selectedTemplate) {

                // Display remaining template options instead of generic + driver
                var tplLabel = _modelWorkspace2['default'].TEMPLATES.get(this.state.selectedTemplate).label;
                step2 = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(PydioComponents.PaperEditorNavHeader, { key: 'parameters-k', label: "2 - " + this.context.getMessage('ws.12').replace('%s', tplLabel) }),
                    _react2['default'].createElement(PydioComponents.PaperEditorNavEntry, { keyName: 'general', key: 'general', selectedKey: this.state.edit, label: this.context.getMessage('ws.13'), onClick: this.setEditState })
                );
            } else {

                step2 = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(PydioComponents.PaperEditorNavHeader, { key: 'parameters-k', label: "2 - " + this.context.getMessage('ws.14') }),
                    _react2['default'].createElement(PydioComponents.PaperEditorNavEntry, { keyName: 'general', key: 'general', selectedKey: this.state.edit, label: this.context.getMessage('ws.15'), onClick: this.setEditState }),
                    _react2['default'].createElement(PydioComponents.PaperEditorNavHeader, { key: 'driver-k', label: "3 - " + this.context.getMessage('ws.16') }),
                    _react2['default'].createElement(PydioComponents.PaperEditorNavEntry, {
                        label: this.context.getMessage(this.props.driversLoaded ? 'ws.17' : 'ws.18'),
                        selectedKey: this.state.edit,
                        keyName: 'driver',
                        onClick: this.setEditState,
                        dropDown: true,
                        dropDownData: this.props.driversLoaded ? _modelWorkspace2['default'].DRIVERS : null,
                        dropDownChange: this.dropDownChange
                    })
                );
            }
        }

        // SAVE / CANCEL BUTTONS
        if (this.state.step > 2 || this.state.step > 1 && this.props.wizardType == 'workspace' && this.state.selectedTemplate) {
            var stepNumber = 4;
            if (this.state.selectedTemplate) stepNumber = 3;
            step3 = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(PydioComponents.PaperEditorNavHeader, { key: 'save-k', label: stepNumber + " - " + this.context.getMessage('ws.19') }),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'center' } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { primary: false, label: this.context.getMessage('54', ''), onTouchTap: this.props.close }),
                    '   ',
                    _react2['default'].createElement(_materialUi.RaisedButton, { primary: true, label: this.context.getMessage('ws.20'), onTouchTap: this.props.save, disabled: this.props.disableCreateButton })
                )
            );
        } else {

            step3 = _react2['default'].createElement(
                'div',
                { style: { textAlign: 'center', marginTop: 50 } },
                _react2['default'].createElement(_materialUi.RaisedButton, { primary: false, label: this.context.getMessage('54', ''), onTouchTap: this.props.close })
            );
        }

        return _react2['default'].createElement(
            'div',
            null,
            step1,
            step2,
            this.props.additionalComponents,
            step3
        );
    }

});
module.exports = exports['default'];
