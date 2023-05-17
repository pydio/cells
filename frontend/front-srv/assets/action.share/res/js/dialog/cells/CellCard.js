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
import React, {Fragment} from 'react'
import Pydio from 'pydio'
import CellModel from 'pydio/model/cell'
import ResourcesManager from 'pydio/http/resources-manager'
import {MenuItem} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

import ShareHelper from "../main/ShareHelper";
import EditCellDialog from './EditCellDialog'

const {moment} = Pydio.requireLib('boot')
const {GenericCard, GenericLine, Mui3CardLine, QuotaUsageLine, SharedUsersStack} = Pydio.requireLib("components");

class CellCard extends React.Component{

    constructor(props){
        super(props);
        this.state = {edit: false, model: new CellModel(), loading:true};
        this._observer = () => {this.forceUpdate()};
        ResourcesManager.loadClass('PydioActivityStreams').then(as => {
            this.setState({asLib: as})
        })
        ResourcesManager.loadClass('PydioCoreActions').then(cs => {
            this.setState({coreActionsLib: cs})
        })
        const {rootNode} = this.props;
        if(rootNode){
            if(rootNode.getMetadata().has('virtual_root')){
                // Use node children instead
                if(rootNode.isLoaded()){
                    this.state.rootNodes = [];
                    rootNode.getChildren().forEach(n => this.state.rootNodes.push(n));
                } else {
                    // Trigger children load
                    rootNode.observe('loaded', () => {
                        const rootNodes = [];
                        rootNode.getChildren().forEach(n => rootNodes.push(n));
                        this.setState({rootNodes});
                    });
                    rootNode.load();
                }
            } else {
                this.state.rootNodes = [rootNode];
            }
        }

    }

    componentDidMount(){
        const {pydio, cellId} = this.props;
        if(pydio.user.activeRepository === cellId) {
            pydio.user.getActiveRepositoryAsCell().then(cell => {
                if(!cell) {
                    this.setState({loading: false})
                    return;
                }
                this.setState({model: cell, loading: false});
                cell.observe('update', this._observer);
            })
        } else {
            this.state.model.observe('update', ()=>{
                this.setState({loading: false});
                this.forceUpdate();
            });
            this.state.model.load(this.props.cellId);
        }
    }

    componentWillUnmount(){
        this.state.model.stopObserving('update', this._observer);
    }

    usersInvitations(userObjects) {
        ShareHelper.sendCellInvitation(this.props.node, this.state.model, userObjects);
    }

    render(){
        const {mode, pydio, editorOneColumn, muiTheme} = this.props;
        const {edit, model, asLib, coreActionsLib, rootNodes, loading} = this.state;
        const m = (id) => pydio.MessageHash['share_center.' + id];

        let rootStyle = {width: 400, minHeight: 270};
        let content;

        if (edit) {
            if(editorOneColumn){
                rootStyle = {width: 400, height: 500};
            } else{
                rootStyle = {width: 700, height: 500};
            }
            content = <EditCellDialog {...this.props} model={model} sendInvitations={this.usersInvitations.bind(this)} editorOneColumn={editorOneColumn}/>;
        } else if (model) {
            let nodes = model.getRootNodes().map(node => {
                return model.getNodeLabelInContext(node);
            }).join(', ');
            if (!nodes) {
                nodes = model.getRootNodes().length + ' item(s)';
            }
            let deleteAction, editAction, moreMenuItems;
            if(mode !== 'infoPanel'){
                moreMenuItems = [];
                if(model.getUuid() !== pydio.user.activeRepository){
                    moreMenuItems.push(<MenuItem primaryText={m(246)} onClick={()=>{
                        pydio.triggerRepositoryChange(model.getUuid());
                        this.props.onDismiss();
                    }}/>);
                }
                if(model.isEditable()){
                    deleteAction = ()=>{model.deleteCell().then(res=>{this.props.onDismiss()})};
                    editAction = () => {
                        this.setState({edit: true});
                        if(this.props.onHeightChange){
                            this.props.onHeightChange(500);
                        }
                    };
                    moreMenuItems.push(<MenuItem primaryText={m(247)} onClick={()=>this.setState({edit:true})}/>);
                    moreMenuItems.push(<MenuItem primaryText={m(248)} onClick={deleteAction}/>);
                }
            }
            let secondaryLines = [], numbers = [];
            let watchLine, quotaLines =[], otherActions, expirationLine;
            if(rootNodes && !loading) {
                rootNodes.forEach((node) => {
                    if(node.getMetadata().get("ws_quota")) {
                        quotaLines.push(<QuotaUsageLine mui3={mode!=='infoPanel'} node={node}/>)
                    }
                })
                if(rootNodes.length > 1) {
                    numbers.push(pydio.MessageHash['share_center.cell.folder-root.multiple'].replace('%d', rootNodes.length))
                } else {
                    numbers.push(pydio.MessageHash['share_center.cell.folder-root.single'])
                }
                const plen = Object.keys(model.getAcls()).length;
                if(plen > 1) {
                    numbers.push(pydio.MessageHash['share_center.cell.participant.multiple'].replace('%d', plen))
                } else {
                    numbers.push(pydio.MessageHash['share_center.cell.participant.single'])
                }
                secondaryLines.push(numbers.join(', '))
//                secondaryLines.push('%1 participants, %2 folders'.replace('%1', Object.keys(model.getAcls()).length).replace('%2', rootNodes.length))
            }

            if(!loading && model.cell && model.cell.AccessEnd) {
                const dateObject = new Date(parseInt(model.cell.AccessEnd) * 1000)
                const dateExpired = (dateObject < new Date())
                expirationLine = (
                    <GenericLine
                        iconClassName={dateExpired?"mdi mdi-alert-outline":"mdi mdi-calendar"}
                        iconStyle={dateExpired?{color:'var(--md-sys-color-error)'}:{}}
                        legend={m(dateExpired?'21b':'21')}
                        data={moment(dateObject).calendar()}
                    />
                )
                secondaryLines.push(m(dateExpired?'21b':'21') + ' ' + moment(dateObject).calendar())
            }
            if(asLib && coreActionsLib && rootNodes && !loading) {
                const {WatchSelector, WatchSelectorMui3} = asLib
                const {BookmarkButton, MaskWsButton} = coreActionsLib
                let selector;
                if(muiTheme.userTheme === 'mui3') {
                    selector = <WatchSelectorMui3 pydio={pydio} nodes={rootNodes} fullWidth={false}/>;
                } else {
                    selector = <WatchSelector pydio={pydio} nodes={rootNodes} fullWidth={true}/>;
                }
                watchLine = (
                    <Mui3CardLine
                        legend={pydio.MessageHash['meta.watch.selector.legend'+(muiTheme.userTheme === 'mui3'?'.mui':'')]}
                        data={selector}
                        dataStyle={{marginTop: 6}}
                    />);
                otherActions = [
                    <MaskWsButton pydio={pydio} workspaceId={model.getUuid()} style={{width:40,height:40,padding:8}} iconStyle={{color:'var(--md-sys-color-primary)'}}/>,
                    <BookmarkButton pydio={pydio} nodes={rootNodes} styles={{style:{width:40,height:40,padding:8}, iconStyle:{color:'var(--md-sys-color-primary)'}}}/>
                ];
            }

            content = (
                <GenericCard
                    pydio={pydio}
                    title={model.getLabel()}
                    onDismissAction={this.props.onDismiss}
                    otherActions={otherActions}
                    onDeleteAction={deleteAction}
                    deleteTooltip={pydio.MessageHash['share_center.248']}
                    onEditAction={editAction}
                    editTooltip={pydio.MessageHash['share_center.247']}
                    headerSmall={mode === 'infoPanel'}
                    mui3={true}
                    topLeftAvatar={mode !== 'infoPanel' && <SharedUsersStack size={40} acls={model.getAcls()}/>}
                >
                    {mode !== 'infoPanel' &&
                        <Fragment>
                            <Mui3CardLine
                                legend={model.getDescription()}
                                data={<div>{secondaryLines.map(l=><div>{l}</div>)}</div>}
                            />
                            {watchLine || <GenericLine placeHolder placeHolderReady={!loading}/>}
                        </Fragment>
                    }
                    {mode === 'infoPanel' &&
                        <Fragment>
                            {!loading &&
                                <GenericLine
                                    iconClassName="mdi mdi-account-multiple"
                                    legend={"Participants"}
                                    data={<SharedUsersStack size={30} acls={model.getAcls()} />}
                                />
                            }
                            {!loading && model.getDescription() &&
                                <GenericLine iconClassName="mdi mdi-information" legend={m(145)} data={model.getDescription()}/>
                            }
                            <GenericLine
                                iconClassName="mdi mdi-folder-multiple-outline"
                                legend={m(249)}
                                data={nodes}
                                placeHolder
                                placeHolderReady={!loading}
                            />
                            {expirationLine}
                            {quotaLines}
                        </Fragment>
                    }
                </GenericCard>
            );
            if(mode === 'infoPanel'){
                return content;
            }
        }

        return <div style={rootStyle}>{content}</div>

    }

}

CellCard = muiThemeable()(CellCard);
export {CellCard as default}