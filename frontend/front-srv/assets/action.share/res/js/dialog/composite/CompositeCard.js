/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react'
import CompositeModel from '../composite/CompositeModel'
import GenericEditor from '../main/GenericEditor'
import Pydio from 'pydio'
import Panel from '../links/Panel'
import SecureOptions from '../links/SecureOptions'
import ShareHelper from '../main/ShareHelper'
import Mailer from './Mailer'
import NewCellsList from './NewCellsList'
import Clipboard from 'clipboard'
import PublicLinkTemplate from '../links/PublicLinkTemplate'
import VisibilityPanel from '../links/VisibilityPanel'
import LabelPanel, {LinkLabelTitle} from '../links/LabelPanel'
import {Divider} from 'material-ui'

const {ThemeModifier} = require('pydio').requireLib('boot');
const {Tooltip} = Pydio.requireLib("boot");
const {GenericCard, GenericLine} = Pydio.requireLib('components');


class CompositeCard extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            mode: this.props.mode || 'view',
            model : new CompositeModel(this.props.mode === 'edit')
        };
    }

    confirmAndDismiss(){
        const {model} = this.state;
        const {pydio, onDismiss} = this.props;
        if (!model.isDirty() || confirm(pydio.MessageHash['share_center.dialog.close.confirm.unsaved'])){
            onDismiss();
        }
    }

    attachClipboard(){
        const {pydio} = this.props;
        const m = (id) => pydio.MessageHash['share_center.' + id];
        const {model} = this.state;
        this.detachClipboard();
        if(!model.getLinks().length){
            return;
        }
        const linkModel = model.getLinks()[0];
        if(!linkModel.getLink()){
            return;
        }
        if(this.refs['copy-button']){
            this._clip = new Clipboard(this.refs['copy-button'], {
                text: function(trigger) {
                    return ShareHelper.buildPublicUrl(pydio, linkModel.getLink());
                }.bind(this)
            });
            this._clip.on('success', function(){
                this.setState({copyMessage: m('192')}, ()=>{
                    setTimeout(()=>{this.setState({copyMessage:null})}, 2500);
                })
            }.bind(this));
            this._clip.on('error', function(){
                let copyMessage;
                if( global.navigator.platform.indexOf("Mac") === 0 ){
                    copyMessage = m(144);
                }else{
                    copyMessage = m(143);
                }
                this.setState({copyMessage}, ()=>{
                    setTimeout(()=>{this.setState({copyMessage:null})}, 2500);
                })
            }.bind(this));
        }
    }
    detachClipboard(){
        if(this._clip){
            this._clip.destroy();
        }
    }


    componentDidMount() {
        const {node, mode} = this.props;
        this.state.model.observe("update", ()=>{this.forceUpdate()});
        this.state.model.load(node, mode === 'infoPanel');
        this.attachClipboard();
    }

    componentWillUnmount(){
        this.state.model.stopObserving("update");
        this.detachClipboard();
    }

    componentDidUpdate(){
        this.attachClipboard();
    }

    componentWillReceiveProps(props){
        if(props.node && (props.node !== this.props.node || props.node.getMetadata('pydio_shares') !== this.props.node.getMetadata('pydio_shares') )){
            this.state.model.load(props.node, props.mode === 'infoPanel');
        }
    }

    usersInvitations(userObjects, cellModel) {
        ShareHelper.sendCellInvitation(this.props.node, cellModel, userObjects);
    }

    linkInvitation(linkModel){
        try{
            const mailData = ShareHelper.prepareEmail(this.props.node, linkModel);
            this.setState({mailerData:{...mailData, users:[], linkModel: linkModel}});
        }catch(e){
            alert(e.message);
        }
    }

    dismissMailer(){
        this.setState({mailerData: null});
    }

    submit(){
        try{
            this.state.model.save();
        } catch(e){
            this.props.pydio.UI.displayMessage('ERROR', e.message);
        }
    }

    deleteAllShares() {
        const {pydio} = this.props;
        const {model} = this.state;
        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            dialogTitleId: 'share_center.composite.deleteAll',
            message: pydio.MessageHash['share_center.' + 255],
            validCallback: () => {
                model.stopObserving('update');
                model.deleteAll().then(res => {
                    model.updateUnderlyingNode();
                });
            }
        });
    }

    render(){

        const {node, mode, pydio, editorOneColumn, popoverPanel, popoverRequestClose} = this.props;
        const {model, mailerData, linkTooltip, copyMessage} = this.state;
        const m = (id) => pydio.MessageHash['share_center.' + id];

        if (mode === 'edit') {

            // Header
            const header = (
                <div style={{fontSize: 20, padding: 10}}>
                    <Mailer {...mailerData} pydio={pydio} onDismiss={this.dismissMailer.bind(this)}/>
                    {node && m(256).replace('%s', node.getLabel()) + (model.isDirty() ? ' *' : '')}
                </div>
            );
            let tabs = {left:[], right:[]};

            // Cells
            const activeCells = model.getCells().filter(c => c.getUuid());
            let label;
            if (activeCells.length > 1) {
                label = m('254c').replace('%d', activeCells.length)
            } else if (activeCells.length === 1) {
                label = m('254d').replace('%s', activeCells[0].getLabel())
            }  else {
                label= m('254b');
            }
            tabs.right.push({
                Label:label,
                Value:"cells",
                Icon:'mdi mdi-account-multiple',
                Component:(
                    <NewCellsList pydio={pydio} compositeModel={model} usersInvitations={this.usersInvitations.bind(this)}/>
                )
            });

            // Links
            const links = model.getLinks();
            let publicLinkModel;
            if(links.length){
                publicLinkModel = links[0];
            }
            if (publicLinkModel){

                const additionalPanes = [];
                let active = false
                if(publicLinkModel.getLinkUuid()){
                    // LABEL PANEL
                    active = true
                    additionalPanes.push({
                        ...LinkLabelTitle(model, publicLinkModel, m),
                        content:<LabelPanel pydio={pydio} linkModel={links[0]} model={model} showLayout={true}/>
                    });
                    if(links[0].isEditable()){
                        additionalPanes.push({
                            title:m('link.visibility.title'),
                            content:<VisibilityPanel pydio={pydio} linkModel={links[0]} style={{margin:-10}}/>
                        });
                    }
                }

                tabs.left.push({
                    Label:m(121) + (active?' ('+m('link.active')+')':''),
                    Value:'public-link',
                    Icon:'mdi mdi-link',
                    Component:(<Panel
                        pydio={pydio}
                        compositeModel={model}
                        linkModel={links[0]}
                        showMailer={ShareHelper.mailerSupported(pydio) ? this.linkInvitation.bind(this) : null}
                        additionalPanes={additionalPanes}
                    />)
                });
            }

            // If there are only active Cells, open directly on it
            console.log(links.filter(l => l.getLinkUuid()), activeCells.length);
            const defaultLeft = (!links.filter(l => l.getLinkUuid()).length && activeCells.length > 0) ? 'cells' : null

            return (
                <GenericEditor
                    tabs={tabs}
                    defaultLeft={defaultLeft}
                    pydio={pydio}
                    header={header}
                    saveEnabled={model.isDirty()}
                    onSaveAction={this.submit.bind(this)}
                    onCloseAction={() => this.confirmAndDismiss()}
                    onRevertAction={()=>{model.revertChanges(true)}}
                    editorOneColumn={editorOneColumn}
                    style={{width:'100%', height: null, flex: 1, minHeight:350, color: 'rgba(0,0,0,.83)', fontSize: 13}}
                />
            );

        } else {

            let lines = [];
            let cells = [];
            model.getCells().map(cell => {
                cells.push(cell.getLabel());
            });
            const links = model.getLinks();
            if (links.length){
                const ln = links[0];
                if (ln.hasError()) {
                    const err = ln.hasError();
                    lines.push(
                        <GenericLine iconClassName={"mdi mdi-alert-outline"} legend={"Error"} data={err.Detail || err.Msg || err}/>
                    );
                } else if(ln.getLink() && ln.getLink().LinkHash){
                    const publicLink = ShareHelper.buildPublicUrl(pydio, ln.getLink(), mode === 'infoPanel');
                    lines.push(
                        <GenericLine iconClassName="mdi mdi-link" legend={m(121)} style={{overflow:'visible'}} dataStyle={{overflow:'visible'}} data={
                            <div
                                ref="copy-button"
                                style={{cursor:'pointer', position:'relative'}}
                                onMouseOver={()=>{this.setState({linkTooltip:true})}}
                                onMouseOut={()=>{this.setState({linkTooltip:false})}}
                            >
                                <Tooltip
                                    label={copyMessage ? copyMessage : m(191)}
                                    horizontalPosition={"left"}
                                    verticalPosition={"top"}
                                    show={linkTooltip}
                                />
                                {publicLink}
                            </div>
                        }/>
                    )
                }
            }
            if(cells.length){
                lines.push(
                    <GenericLine iconClassName="mdi mdi-account-multiple" legend={m(254)} data={cells.join(', ')}/>
                );
            }
            return (
                <GenericCard
                    pydio={pydio}
                    title={pydio.MessageHash['share_center.50']}
                    onDismissAction={this.props.onDismiss}
                    onDeleteAction={()=>{
                        if(popoverRequestClose){
                            popoverRequestClose()
                        }
                        this.deleteAllShares()
                    }}
                    onEditAction={()=>{
                        if(popoverRequestClose){
                            popoverRequestClose()
                        }
                        pydio.Controller.fireAction('share-edit-shared')
                    }}
                    editTooltip={pydio.MessageHash['share_center.125']}
                    deleteTooltip={pydio.MessageHash['share_center.composite.deleteAll']}
                    headerSmall={mode === 'infoPanel'}
                    popoverPanel={popoverPanel}
                    popoverRequestClose={popoverRequestClose}
                >
                    {lines}
                    {!lines.length && <GenericLine placeHolder/>}
                </GenericCard>

            );

        }


    }

}

CompositeCard = ThemeModifier({primary1Color:'#009688'})(CompositeCard);
export {CompositeCard as default}