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

const React = require('react');
import createReactClass from 'create-react-class'
const {FontIcon, ListItem, List, FlatButton, Subheader} = require('material-ui');
const Pydio = require('pydio');
const PydioDataModel = require('pydio/model/data-model');
const {ActionDialogMixin} = Pydio.requireLib('boot');
import MetaNodeProvider from 'pydio/model/meta-node-provider'
import PydioApi from 'pydio/http/api'
import {MetaServiceApi,RestGetBulkMetaRequest, TreeNode} from 'cells-sdk';
import CellModel from 'pydio/model/cell'
import {muiThemeable} from 'material-ui/styles'
import PropTypes from 'prop-types'
import moveLoader from '../callback/applyCopyOrMove'

class CrossWsContent extends React.Component{
    constructor(props){
        super(props);
        this.state = {roots: []};
    }

    componentDidMount(){
        // List roots for the cell
        const {cellWs} = this.props;
        const metaService = new MetaServiceApi(PydioApi.getRestClient());
        const request = new RestGetBulkMetaRequest();
        const slug = cellWs.getSlug();
        console.log(slug);
        request.NodePaths = [slug, slug + '/*'];
        metaService.getBulkMeta(request).then(response => {
            const nodes = response.Nodes || [];
            let wsRoot = null, wsChildren = [];
            nodes.forEach(node => {
                if(node.Path === slug + '/') {
                    wsRoot = MetaNodeProvider.parseTreeNode(node, slug);
                } else {
                    const child = MetaNodeProvider.parseTreeNode(node, slug);
                    if(!child.isLeaf()){
                        wsChildren.push(child);
                    }
                }
            });
            if(wsRoot.getMetadata().has('virtual_root')){
                console.log(wsChildren);
                this.setState({roots: wsChildren});
            } else {
                console.log(wsRoot);
                this.setState({roots:[wsRoot]});
            }
        });
    }

    move(targetNode){
        const {source, cellWs, pydio, dropEffect} = this.props;
        const moveFunction = moveLoader(Pydio.getInstance());
        let selection = pydio.getContextHolder();
        const selectedNodes = selection.getSelectedNodes();
        if(selectedNodes.indexOf(source) === -1){
            // Use source node instead of current datamodel selection
            let newSel = new PydioDataModel();
            newSel.setContextNode(selection.getContextNode());
            newSel.setSelectedNodes([source]);
            moveFunction(dropEffect, newSel, targetNode.getPath(), cellWs.getId());
        }else{
            moveFunction(dropEffect, selection, targetNode.getPath(), cellWs.getId());
        }
        this.props.onDismiss();
    }

    share(){
        const {source, cellWs, pydio} = this.props;
        const model = new CellModel();
        model.load(cellWs.getId()).then(()=>{
            model.addRootNode(source);
            model.save().then(() => {
                this.props.onDismiss();
                pydio.triggerRepositoryChange(cellWs.getId());
            })
        });
    }

    render(){
        const {source, cellWs, dropEffect, pydio, muiTheme} = this.props;
        const {roots} = this.state;
        const m = (id) => pydio.MessageHash['openother.drop.cell.' + id] || id;
        let items = [];

        items.push(
            <ListItem
                onClick={()=>{this.share()}}
                primaryText={source.isLeaf() ? m('file.share') : m('folder.share')}
                secondaryText={m('share.legend').replace('%s', cellWs.getLabel())}
                leftIcon={<FontIcon style={{color:muiTheme.palette.primary1Color}} className={"mdi mdi-share-variant"}/>}
            />);
        const leaf = source.isLeaf() ? 'file' : 'folder';
        const title = m(leaf + '.' + dropEffect);
        roots.forEach((root) => {
            let secondary =  m('copymove.legend').replace('%s', cellWs.getLabel());
            if(root.getPath() !== "/" && root.getPath() !== ""){
                secondary += "/" + root.getLabel();
            }
            items.push(
                <ListItem
                    onClick={()=>{this.move(root)}}
                    primaryText={title}
                    secondaryText={secondary}
                    leftIcon={<FontIcon style={{color:muiTheme.palette.primary1Color}} className={"mdi mdi-folder-"+(dropEffect==='copy'?"plus":"move")}/>}
                />);
        });
        return (
            <List style={{maxHeight: 320, overflowY: 'scroll', width: '100%', borderTop:'1px solid #e0e0e0'}}>
                <Subheader style={{overflow:'hidden', whiteSpace:'nowrap', paddingRight:16, textOverflow:'ellipsis'}}>{m('picker').replace('%s', source.getLabel())}</Subheader>
                {items}
            </List>
        );
    }
}

CrossWsContent = muiThemeable()(CrossWsContent);

let CrossWsDropDialog = createReactClass({

    propTypes:{
        pydio: PropTypes.instanceOf(Pydio),
        selection: PropTypes.instanceOf(PydioDataModel)
    },

    mixins:[
        ActionDialogMixin
    ],

    getButtons: function(updater){
        let actions = [];
        const mess = this.props.pydio.MessageHash;
        actions.push(<FlatButton
            label={mess['49']}
            primary={true}
            keyboardFocused={true}
            onClick={this.props.onDismiss}
        />);
        return actions;
    },

    getDefaultProps: function(){
        return {
            dialogIsModal: false,
            dialogSize:'sm',
            dialogPadding: 0,
        };
    },

    render(){
        return <CrossWsContent {...this.props}/>
    }

});

export {CrossWsDropDialog as default}