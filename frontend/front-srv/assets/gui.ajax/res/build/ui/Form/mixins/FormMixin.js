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

exports.__esModule = true;
var React = require('react');
var PydioApi = require('pydio/http/api');
/**
 * React Mixin for Form Element
 */
exports['default'] = {

    propTypes: {
        attributes: React.PropTypes.object.isRequired,
        name: React.PropTypes.string.isRequired,

        displayContext: React.PropTypes.oneOf(['form', 'grid']),
        disabled: React.PropTypes.bool,
        multiple: React.PropTypes.bool,
        value: React.PropTypes.any,
        onChange: React.PropTypes.func,
        onChangeEditMode: React.PropTypes.func,
        binary_context: React.PropTypes.string,
        errorText: React.PropTypes.string
    },

    getDefaultProps: function getDefaultProps() {
        return {
            displayContext: 'form',
            disabled: false
        };
    },

    isDisplayGrid: function isDisplayGrid() {
        return this.props.displayContext == 'grid';
    },

    isDisplayForm: function isDisplayForm() {
        return this.props.displayContext == 'form';
    },

    toggleEditMode: function toggleEditMode() {
        if (this.isDisplayForm()) return;
        var newState = !this.state.editMode;
        this.setState({ editMode: newState });
        if (this.props.onChangeEditMode) {
            this.props.onChangeEditMode(newState);
        }
    },

    enterToToggle: function enterToToggle(event) {
        if (event.key == 'Enter') {
            this.toggleEditMode();
        }
    },

    bufferChanges: function bufferChanges(newValue, oldValue) {
        this.triggerPropsOnChange(newValue, oldValue);
    },

    onChange: function onChange(event, value) {
        if (value === undefined) {
            value = event.currentTarget.getValue ? event.currentTarget.getValue() : event.currentTarget.value;
        }
        if (this.changeTimeout) {
            global.clearTimeout(this.changeTimeout);
        }
        var newValue = value,
            oldValue = this.state.value;
        if (this.props.skipBufferChanges) {
            this.triggerPropsOnChange(newValue, oldValue);
        }
        this.setState({
            dirty: true,
            value: newValue
        });
        if (!this.props.skipBufferChanges) {
            var timerLength = 250;
            if (this.props.attributes['type'] === 'password') {
                timerLength = 1200;
            }
            this.changeTimeout = global.setTimeout((function () {
                this.bufferChanges(newValue, oldValue);
            }).bind(this), timerLength);
        }
    },

    triggerPropsOnChange: function triggerPropsOnChange(newValue, oldValue) {
        if (this.props.attributes['type'] === 'password') {
            this.toggleEditMode();
            this.props.onChange(newValue, oldValue, { type: this.props.attributes['type'] });
        } else {
            this.props.onChange(newValue, oldValue);
        }
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.setState({
            value: newProps.value,
            dirty: false
        });
    },

    getInitialState: function getInitialState() {
        return {
            editMode: false,
            dirty: false,
            value: this.props.value
        };
    }

};
module.exports = exports['default'];
