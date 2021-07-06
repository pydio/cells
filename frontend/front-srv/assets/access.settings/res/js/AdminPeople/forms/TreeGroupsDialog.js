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

import React from "react";
import Pydio from 'pydio';
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'
import PydioDataModel from "pydio/model/data-model";
import {Paper} from "material-ui";
const {ModernTextField, ModernSelectField} = Pydio.requireLib("hoc");
const {FoldersTree} = Pydio.requireLib('components');
const {ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin} = Pydio.requireLib('boot')

const TreeGroupsDialog = createReactClass({

    propTypes:{
        dataModel: PropTypes.instanceOf(PydioDataModel),
        submitValue:PropTypes.func.isRequired
    },

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps(){
        return {
            dialogTitle: 'Move',
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    submit(){
        const {selectedNode, selectedPath} = this.state;
        this.props.submitValue(selectedPath, selectedNode);
        this.dismiss();
    },

    getInitialState(){
        return{
            selectedNode: this.props.dataModel.getContextNode(),
            selectedPath: '/'
        }
    },

    onNodeSelected(n){
        const {dataModel} = this.props;
        n.load(dataModel.getAjxpNodeProvider());
        const rootPath = dataModel.getContextNode().getPath()
        const ex = new RegExp('^'+rootPath);
        const selectedNodePath = n.getPath().replace(ex, '')
        this.setState({
            selectedNode: n,
            selectedPath: selectedNodePath
        })
    },

    render(){
        const {selectedPath} = this.state;

        return (
            <div style={{width:'100%'}}>
                <div style={{fontSize: 13}}>{Pydio.getMessages()['ajxp_admin.user.moveto.hint']}</div>
                <Paper zDepth={0} style={{height: 300, overflowX:'auto', color: '#546E7A', fontSize: 14, padding: '6px 0px', backgroundColor: 'rgb(246, 246, 248)', marginTop:4}}>
                    <div style={{marginTop: -41, marginLeft: -21}}>
                        <FoldersTree
                            pydio={this.props.pydio}
                            dataModel={this.props.dataModel}
                            rootNode={this.props.dataModel.getContextNode()}
                            onNodeSelected={this.onNodeSelected}
                            showRoot={true}
                            draggable={false}
                        />
                    </div>
                </Paper>
                <div>
                    <ModernTextField
                        variant={'v2'}
                        fullWidth={true}
                        hintText={this.props.pydio.MessageHash[373]}
                        ref="input"
                        value={selectedPath}
                        disabled={false}
                        onChange={()=>{}}
                    />
                </div>
            </div>
        );
    }

});

export {TreeGroupsDialog as default}