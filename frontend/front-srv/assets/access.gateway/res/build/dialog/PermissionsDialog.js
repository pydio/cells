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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var React = require('react');

var PermissionsDialog = React.createClass({
    displayName: 'PermissionsDialog',

    propsTypes: {
        selection: React.PropTypes.instanceOf(PydioDataModel)
    },

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    componentWillMount: function componentWillMount() {
        var _this = this;

        var nodes = this.props.selection;
        this.setState({
            permissions: this.props.selection.getUniqueNode().getMetadata().get('file_perms'),
            uPermissions: [false, false, false], // USER
            gPermissions: [false, false, false], // GROUP
            aPermissions: [false, false, false], // ALL

            dropDownValue: 1,
            recursive: false,
            recursiveRange: 'both'
        }, function () {
            _this.getPermissionsMasks();
        });
    },
    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 88,
            dialogIsModal: true
        };
    },
    getPermissionValue: function getPermissionValue(byteMask) {
        var value = 0;
        value += byteMask[2] ? 4 : 0;
        value += byteMask[1] ? 2 : 0;
        value += byteMask[0] ? 1 : 0;
        return value;
    },
    getChmodValue: function getChmodValue() {
        var value = 0;
        value += this.getPermissionValue(this.state.uPermissions) * 100;
        value += this.getPermissionValue(this.state.gPermissions) * 10;
        value += this.getPermissionValue(this.state.aPermissions);
        return value;
    },
    getByteMask: function getByteMask(nMask) {
        if (nMask > 0x7fffffff || nMask < -0x80000000) {
            throw new TypeError("tableauMasque - intervalle de valeur dépassé");
        }
        for (var nShifted = nMask, aFromMask = []; nShifted; aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1);
        return aFromMask;
    },
    getPermissionsMasks: function getPermissionsMasks() {
        this.setState({
            uPermissions: this.getByteMask(Math.floor(this.state.permissions / 100 % 10)), // USER
            gPermissions: this.getByteMask(Math.floor(this.state.permissions / 10 % 10)), // GROUP
            aPermissions: this.getByteMask(Math.floor(this.state.permissions % 10)) // ALL
        });
    },
    onTextFieldChange: function onTextFieldChange(event, value) {
        var _this2 = this;

        this.setState({
            permissions: value
        }, function () {
            _this2.getPermissionsMasks();
        });
    },
    onCheck: function onCheck(row, column, event) {
        var _this3 = this;

        var perm = [].concat(_toConsumableArray(this.state[row]));
        perm[column] = !perm[column];
        var newState = {};
        newState[row] = perm;
        this.setState(newState, function () {
            _this3.setState({ permissions: _this3.getChmodValue() });
        });
    },
    onDropDownMenuChange: function onDropDownMenuChange(event, index, value) {
        this.setState({ dropDownValue: value });
        switch (value) {
            case 1:
                this.setState({
                    recursiveRange: "",
                    recursive: false
                });
                break;
            case 2:
                this.setState({
                    recursiveRange: 'file',
                    recursive: true
                });
                break;
            case 3:
                this.setState({
                    recursiveRange: 'dir',
                    recursive: true
                });
                break;
            case 4:
                this.setState({
                    recursiveRange: 'both',
                    recursive: true
                });
                break;
            default:
                break;
        }
    },
    submit: function submit() {
        PydioApi.getClient().request({
            get_action: 'chmod',
            file: this.props.selection.getUniqueNode().getPath(),
            chmod_value: this.state.permissions,
            recursive: this.state.recursive ? 'on' : '',
            recur_apply_to: this.state.recursiveRange
        }, (function (transport) {
            this.dismiss();
        }).bind(this));
    },
    render: function render() {
        var MessageHash = this.props.pydio.MessageHash;

        return React.createElement(
            'div',
            null,
            React.createElement(
                MaterialUI.Table,
                {
                    selectable: false
                },
                React.createElement(
                    MaterialUI.TableHeader,
                    {
                        displaySelectAll: false,
                        adjustForCheckbox: false
                    },
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(MaterialUI.TableHeaderColumn, null),
                        React.createElement(
                            MaterialUI.TableHeaderColumn,
                            { tooltip: 'R' },
                            MessageHash[361]
                        ),
                        React.createElement(
                            MaterialUI.TableHeaderColumn,
                            { tooltip: 'W' },
                            MessageHash[362]
                        ),
                        React.createElement(
                            MaterialUI.TableHeaderColumn,
                            { tooltip: 'X' },
                            MessageHash[615]
                        )
                    )
                ),
                React.createElement(
                    MaterialUI.TableBody,
                    {
                        displayRowCheckbox: false
                    },
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            MessageHash[288]
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'uPermissions', 2), checked: this.state.uPermissions[2] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'uPermissions', 1), checked: this.state.uPermissions[1] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'uPermissions', 0), checked: this.state.uPermissions[0] })
                        )
                    ),
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            MessageHash[289]
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'gPermissions', 2), checked: this.state.gPermissions[2] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'gPermissions', 1), checked: this.state.gPermissions[1] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'gPermissions', 0), checked: this.state.gPermissions[0] })
                        )
                    ),
                    React.createElement(
                        MaterialUI.TableRow,
                        null,
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            MessageHash[290]
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'aPermissions', 2), checked: this.state.aPermissions[2] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'aPermissions', 1), checked: this.state.aPermissions[1] })
                        ),
                        React.createElement(
                            MaterialUI.TableRowColumn,
                            null,
                            React.createElement(MaterialUI.Checkbox, { onCheck: this.onCheck.bind(this, 'aPermissions', 0), checked: this.state.aPermissions[0] })
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'baseline' } },
                React.createElement(
                    'p',
                    null,
                    MessageHash[616]
                ),
                React.createElement(MaterialUI.TextField, { value: this.state.permissions, onChange: this.onTextFieldChange, style: { marginLeft: 4, width: 50 }, type: 'number' }),
                React.createElement(
                    'p',
                    { style: { marginLeft: 20 } },
                    MessageHash[291]
                ),
                React.createElement(
                    MaterialUI.DropDownMenu,
                    { value: this.state.dropDownValue, onChange: this.onDropDownMenuChange, style: { marginLeft: -10 } },
                    React.createElement(MaterialUI.MenuItem, { value: 1, primaryText: MessageHash[441] }),
                    React.createElement(MaterialUI.MenuItem, { value: 2, primaryText: MessageHash[265] }),
                    React.createElement(MaterialUI.MenuItem, { value: 3, primaryText: MessageHash[130] }),
                    React.createElement(MaterialUI.MenuItem, { value: 4, primaryText: MessageHash[597] })
                )
            )
        );
    }

});

exports['default'] = PermissionsDialog;
module.exports = exports['default'];
