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

import React from 'react'
import CompositeModel from '../composite/CompositeModel'
import GenericEditor from '../main/GenericEditor'
const {ThemeModifier} = require('pydio').requireLib('boot');
import Panel from '../links/Panel'
import SecureOptions from '../links/SecureOptions'
import ShareHelper from '../main/ShareHelper'
import Mailer from './Mailer'
import PublicLinkTemplate from '../links/PublicLinkTemplate'
import VisibilityPanel from '../links/VisibilityPanel'
import LabelPanel from '../links/LabelPanel'
import {Divider} from 'material-ui'

class SimpleLinkCard extends React.Component {

    constructor(props){
        props.editorOneColumn = true;
        super(props);
        const model = new CompositeModel(true);
        model.skipUpdateUnderlyingNode = true;
        this.state = {
            mode: this.props.mode || 'view',
            model : model
        };
    }

    componentDidMount() {
        const {node, linkUuid, onRemoveLink} = this.props;
        const {model} = this.state;
        model.observe("update", ()=>{
            this.forceUpdate();
        });
        const linkModel = model.loadUniqueLink(linkUuid, node);
        linkModel.observeOnce("delete", () => {
            if(onRemoveLink) onRemoveLink();
        })
    }

    componentWillUnmount(){
        this.state.model.stopObserving("update");
    }

    componentWillReceiveProps(props){
        if(props.LinkUuid && props.LinkUuid !== this.props.LinkUuid){
            this.state.model.loadUniqueLink(props.LinkUuid, props.node);
        }
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
        const {model} = this.state;
        try{
            let publicLinkModel;
            if(model.getLinks().length){
                publicLinkModel = model.getLinks()[0];
                publicLinkModel.save();
            }
        } catch(e){
            this.props.pydio.UI.displayMessage('ERROR', e.message);
        }
    }

    render(){

        const {node, pydio, editorOneColumn} = this.props;
        const {model, mailerData} = this.state;
        const m = (id) => pydio.MessageHash['share_center.' + id];

        let publicLinkModel;
        if(model.getLinks().length){
            publicLinkModel = model.getLinks()[0];
        }
        let header;
        if(publicLinkModel && publicLinkModel.getLinkUuid() && publicLinkModel.isEditable()) {
            header = (
                <div>
                    <Mailer {...mailerData} pydio={pydio} onDismiss={this.dismissMailer.bind(this)}/>
                    <LabelPanel pydio={pydio} linkModel={publicLinkModel} model={model}/>
                </div>
            )
        } else {
            header = (
                <div style={{fontSize: 24, padding: '26px 10px 0 ', lineHeight: '26px'}}>
                    <Mailer {...mailerData} pydio={pydio} onDismiss={this.dismissMailer.bind(this)}/>
                    {m(256).replace('%s', node.getLabel())}
                </div>
            );

        }
        let tabs = {left:[], right:[], leftStyle:{padding:0}};
        const links = model.getLinks();
        if (publicLinkModel){
            tabs.left.push({
                Label:m(251),
                Value:'public-link',
                Component:(<Panel
                    pydio={pydio}
                    compositeModel={model}
                    linkModel={links[0]}
                    showMailer={ShareHelper.mailerSupported(pydio) ? this.linkInvitation.bind(this) : null}
                />)
            });

            if(publicLinkModel.getLinkUuid()){

                /*
                const layoutData = ShareHelper.compileLayoutData(pydio, model);
                let templatePane;
                if(layoutData.length > 1){
                    templatePane = <PublicLinkTemplate
                        linkModel={publicLinkModel}
                        pydio={pydio}
                        layoutData={layoutData}
                        style={{padding: '10px 16px'}}
                        readonly={model.getNode().isLeaf()}
                    />;
                }
                tabs.left.push({
                    Label:m(252),
                    Value:'link-secure',
                    Component:(
                        <div>
                            <SecureOptions pydio={pydio} linkModel={links[0]} />
                            {templatePane && <Divider/>}
                            {templatePane}
                        </div>
                    )
                });
                 */
                tabs.left.push({
                    Label:m(253),
                    Value:'link-visibility',
                    Component:( <VisibilityPanel pydio={pydio} linkModel={links[0]}/> ),
                    AlwaysLast: true
                })
            }
        }

        return (
            <GenericEditor
                tabs={tabs}
                pydio={pydio}
                header={header}
                saveEnabled={model.isDirty()}
                onSaveAction={this.submit.bind(this)}
                onCloseAction={this.props.onDismiss}
                onRevertAction={()=>{model.revertChanges()}}
                editorOneColumn={editorOneColumn}
                style={{width:'100%', height: null, flex: 1, minHeight:550, color: 'rgba(0,0,0,.83)', fontSize: 13}}
            />
        );


    }

}

//SimpleLinkCard = ThemeModifier({primary1Color:'#009688'})(SimpleLinkCard);
export {SimpleLinkCard as default}