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

const React = require('react')

let PermissionsDialog = React.createClass({
    propsTypes: {
        selection: React.PropTypes.instanceOf(PydioDataModel),
    },

    mixins: [
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.CancelButtonProviderMixin,
        PydioReactUI.SubmitButtonProviderMixin
    ],

    componentWillMount: function() {
        let nodes = this.props.selection;
        this.setState({
            permissions: this.props.selection.getUniqueNode().getMetadata().get('file_perms'),
            uPermissions: [false, false, false],  // USER
            gPermissions: [false, false, false],  // GROUP
            aPermissions: [false, false, false],  // ALL

            dropDownValue: 1,
            recursive: false,
            recursiveRange: 'both',
        }, () => {
            this.getPermissionsMasks();
        }) ;
    },
    getDefaultProps: function() {
        return {
            dialogTitleId: 88,
            dialogIsModal: true
        };
    },
    getPermissionValue: function(byteMask) {
        let value = 0;
        value += byteMask[2] ? 4 : 0;
        value += byteMask[1] ? 2 : 0;
        value += byteMask[0] ? 1 : 0;
        return value
    },
    getChmodValue: function() {
        let value = 0;
        value += this.getPermissionValue(this.state.uPermissions) * 100;
        value += this.getPermissionValue(this.state.gPermissions) * 10;
        value += this.getPermissionValue(this.state.aPermissions);
        return (value);
    },
    getByteMask: function(nMask) {
        if (nMask > 0x7fffffff || nMask < -0x80000000) {
            throw new TypeError("tableauMasque - intervalle de valeur dépassé");
        }
        for (var nShifted = nMask, aFromMask = []; nShifted;
             aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1);
        return aFromMask;
    },
    getPermissionsMasks: function() {
        this.setState({
            uPermissions: this.getByteMask(Math.floor(this.state.permissions / 100 % 10)),  // USER
            gPermissions: this.getByteMask(Math.floor(this.state.permissions / 10 % 10)),   // GROUP
            aPermissions: this.getByteMask(Math.floor(this.state.permissions % 10))         // ALL
        });
    },
    onTextFieldChange: function(event, value) {
        this.setState({
            permissions: value,
        }, () => {
            this.getPermissionsMasks();
        }) ;
    },
    onCheck: function(row, column, event) {
        let perm = [...this.state[row]];
        perm[column] = !perm[column];
        let newState = {}
        newState[row] = perm
        this.setState(newState, () => {
            this.setState({permissions: this.getChmodValue()});
        });
    },
    onDropDownMenuChange: function(event, index, value) {
        this.setState({dropDownValue: value});
        switch (value) {
            case 1:
                this.setState({
                    recursiveRange: "",
                    recursive: false,
                });
                break;
            case 2:
                this.setState({
                    recursiveRange: 'file',
                    recursive: true,
                });
                break;
            case 3:
                this.setState({
                    recursiveRange: 'dir',
                    recursive: true,
                });
                break;
            case 4:
                this.setState({
                    recursiveRange: 'both',
                    recursive: true,
                });
                break;
            default: break;
        }
    },
    submit: function() {
        PydioApi.getClient().request({
            get_action:'chmod',
            file: this.props.selection.getUniqueNode().getPath(),
            chmod_value: this.state.permissions,
            recursive: this.state.recursive ? 'on' : '',
            recur_apply_to: this.state.recursiveRange,
        }, function (transport) {
            this.dismiss();
        }.bind(this));
    },
    render: function() {
        const {MessageHash} = this.props.pydio;
        return (
            <div>
                <MaterialUI.Table
                    selectable={false}
                >
                    <MaterialUI.TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                    >
                        <MaterialUI.TableRow>
                            <MaterialUI.TableHeaderColumn></MaterialUI.TableHeaderColumn>
                            <MaterialUI.TableHeaderColumn tooltip="R">{MessageHash[361]}</MaterialUI.TableHeaderColumn>
                            <MaterialUI.TableHeaderColumn tooltip="W">{MessageHash[362]}</MaterialUI.TableHeaderColumn>
                            <MaterialUI.TableHeaderColumn tooltip="X">{MessageHash[615]}</MaterialUI.TableHeaderColumn>
                        </MaterialUI.TableRow>
                    </MaterialUI.TableHeader>
                    <MaterialUI.TableBody
                        displayRowCheckbox={false}
                    >
                        <MaterialUI.TableRow>
                            <MaterialUI.TableRowColumn>{MessageHash[288]}</MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'uPermissions', 2)} checked={this.state.uPermissions[2]} /></MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'uPermissions', 1)} checked={this.state.uPermissions[1]}/></MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'uPermissions', 0)} checked={this.state.uPermissions[0]}/></MaterialUI.TableRowColumn>
                        </MaterialUI.TableRow>
                        <MaterialUI.TableRow>
                            <MaterialUI.TableRowColumn>{MessageHash[289]}</MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'gPermissions', 2)} checked={this.state.gPermissions[2]} /></MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'gPermissions', 1)} checked={this.state.gPermissions[1]}/></MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'gPermissions', 0)} checked={this.state.gPermissions[0]}/></MaterialUI.TableRowColumn>
                        </MaterialUI.TableRow>
                        <MaterialUI.TableRow>
                            <MaterialUI.TableRowColumn>{MessageHash[290]}</MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'aPermissions', 2)} checked={this.state.aPermissions[2]} /></MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'aPermissions', 1)} checked={this.state.aPermissions[1]}/></MaterialUI.TableRowColumn>
                            <MaterialUI.TableRowColumn><MaterialUI.Checkbox onCheck={this.onCheck.bind(this, 'aPermissions', 0)} checked={this.state.aPermissions[0]}/></MaterialUI.TableRowColumn>
                        </MaterialUI.TableRow>
                    </MaterialUI.TableBody>
                </MaterialUI.Table>
                <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <p>{MessageHash[616]}</p>
                    <MaterialUI.TextField value={this.state.permissions} onChange={this.onTextFieldChange} style={{marginLeft: 4, width: 50}} type='number' />
                    <p style={{marginLeft: 20}}>{MessageHash[291]}</p>
                    <MaterialUI.DropDownMenu value={this.state.dropDownValue} onChange={this.onDropDownMenuChange} style={{marginLeft: -10}}>
                        <MaterialUI.MenuItem value={1} primaryText={MessageHash[441]} />
                        <MaterialUI.MenuItem value={2} primaryText={MessageHash[265]} />
                        <MaterialUI.MenuItem value={3} primaryText={MessageHash[130]} />
                        <MaterialUI.MenuItem value={4} primaryText={MessageHash[597]} />
                    </MaterialUI.DropDownMenu>
                </div>

            </div>
        );
    }

});

export {PermissionsDialog as default}