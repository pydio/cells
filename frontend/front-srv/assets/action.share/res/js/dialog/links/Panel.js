import React from 'react';
import ShareContextConsumer from '../ShareContextConsumer'
import PublicLinkField from './Field'
import PublicLinkPermissions, {PermissionsTitle} from './Permissions'
import TargetedUsers from './TargetedUsers'
import {RaisedButton, Toggle, Divider, CircularProgress} from 'material-ui'
import LinkModel from './LinkModel'
import CompositeModel from '../composite/CompositeModel'

/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import PropTypes from 'prop-types';

import Pydio from 'pydio'
import ShareHelper from '../main/ShareHelper'
import PublicLinkSecureOptions, {SecureOptionsTitle} from "./SecureOptions";
const {ValidPassword} = Pydio.requireLib('form');
const {ModernStyles} = Pydio.requireLib('hoc');

export class PaneToggler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {active:!!props.active}
    }
    render() {
        const {title, legend, children} = this.props;
        const {active} = this.state;
        let styles = {
            title: {
                cursor: 'pointer',
                fontSize: 15,
                padding: 16,
                paddingBottom: active?8: 16,
                display:'flex',
                alignItems:'center'
            },
            legend: {
                opacity:0.4,
                fontSize: 12,
                fontWeight: 500,
                fontStyle:'italic'
            },
            content:{
                padding: '0 16px 8px'
            },
            chevron:{
                fontSize: 24,
                color:'rgba(0,0,0,.3)',
                transition: 'transform 250ms ease',
                transform: active?'rotate(90deg)':''
            }
        }
        return (
            <React.Fragment>
                <div style={{...styles.title}} onClick={() => {this.setState({active:!active})}}>
                    <span style={{flex: 1}}>{title}{legend && <span style={styles.legend}> - {legend}</span>}</span><span className={"mdi mdi-chevron-right"} style={styles.chevron}/>
                </div>
                {active && <div style={{...styles.content}}>{children}</div>}
            </React.Fragment>
        )
    }
}

class PublicLinkPanel extends React.Component {
    static propTypes = {
        linkModel:PropTypes.instanceOf(LinkModel),
        compositeModel:PropTypes.instanceOf(CompositeModel),
        pydio:PropTypes.instanceOf(Pydio),
        authorizations: PropTypes.object,
        showMailer:PropTypes.func
    };

    state = {showTemporaryPassword: false, temporaryPassword: null, saving: false};

    toggleLink = () => {
        const {linkModel, pydio} = this.props;
        const {showTemporaryPassword} = this.state;
        if(showTemporaryPassword){
            this.setState({showTemporaryPassword: false, temporaryPassword: null});
        }else if(!linkModel.getLinkUuid() && ShareHelper.getAuthorizations().password_mandatory){
            this.setState({showTemporaryPassword: true, temporaryPassword: ''});
        }else{
            this.setState({saving: true})
            if(linkModel.getLinkUuid()){
                this.props.compositeModel.deleteLink(linkModel).catch(()=>{
                    this.setState({saving: false});
                }).then(() => {
                    this.setState({saving: false});
                });
            } else {
                linkModel.save().catch(()=>{
                    this.setState({saving: false});
                }).then(() => {
                    this.setState({saving: false});
                });
            }
        }
    };

    updateTemporaryPassword = (value, event) => {
        if(value === undefined) {
            value = event.currentTarget.getValue();
        }
        this.setState({temporaryPassword:value});
    };

    enableLinkWithPassword = () => {
        const {linkModel} = this.props;
        const {temporaryPasswordState} = this.state;
        if(!temporaryPasswordState){
            this.props.pydio.UI.displayMessage('ERROR', 'Invalid Password');
            return;
        }
        linkModel.setCreatePassword(this.state.temporaryPassword);
        try{
            linkModel.save();
        } catch(e){
            this.props.pydio.UI.displayMessage('ERROR', e.message)
        }
        this.setState({showTemporaryPassword:false, temporaryPassword:null});
    };

    render() {

        const {linkModel, pydio, compositeModel, toggleOnly, additionalPanes} = this.props;
        const {showTemporaryPassword, temporaryPassword, saving} = this.state;
        const authorizations = ShareHelper.getAuthorizations();
        const nodeLeaf = compositeModel.getNode().isLeaf();
        const canEnable = (nodeLeaf && authorizations.file_public_link) || (!nodeLeaf && authorizations.folder_public_link);
        const dividerStyle={backgroundColor:'#eee'}

        let publicLinkPanes, publicLinkField;
        let linkEnabled;
        if(linkModel.getLinkUuid()) {
            let disableLink;
            if(!(this.props.isReadonly() || saving || !linkModel.isEditable() || (!linkModel.getLinkUuid() && !canEnable))){
                disableLink = () => this.toggleLink();
            }
            publicLinkField = (<PublicLinkField
                pydio={pydio}
                linkModel={linkModel}
                showMailer={this.props.showMailer}
                editAllowed={authorizations.editable_hash && linkModel.isEditable()}
                onDisableLink={disableLink}
                key="public-link"
            />);
            publicLinkPanes = [
                <Divider style={dividerStyle}/>,
                <PaneToggler {...PermissionsTitle(compositeModel, linkModel, this.props.getMessage)}>
                    <PublicLinkPermissions
                        compositeModel={compositeModel}
                        linkModel={linkModel}
                        pydio={pydio}
                        key="public-perm"
                    />
                </PaneToggler>
            ];
            if(linkModel.getLink().TargetUsers) {
                publicLinkPanes.push(<Divider style={dividerStyle}/>);
                publicLinkPanes.push(<TargetedUsers linkModel={linkModel} pydio={pydio}/>);
            }
            publicLinkPanes.push(<Divider style={dividerStyle}/>)
            publicLinkPanes.push(
                <PaneToggler {...SecureOptionsTitle(compositeModel, linkModel, this.props.getMessage)}>
                    <PublicLinkSecureOptions pydio={pydio} linkModel={linkModel}/>
                </PaneToggler>
            )

            if(additionalPanes) {
                additionalPanes.forEach(pane => {
                    publicLinkPanes.push(<Divider style={dividerStyle}/>)
                    publicLinkPanes.push(<PaneToggler title={pane.title} legend={pane.legend}>{pane.content}</PaneToggler>);
                })
            }

        }else if(showTemporaryPassword) {
            publicLinkField = (
                <div>
                    <div className="section-legend" style={{marginTop: 20}}>{this.props.getMessage('215')}</div>
                    <div style={{width: '100%'}}>
                        <ValidPassword
                            attributes={{label: this.props.getMessage('23')}}
                            value={temporaryPassword}
                            onChange={this.updateTemporaryPassword.bind(this)}
                            onValidStatusChange={(s) => this.setState({temporaryPasswordState: s})}
                            variant={"v2"}
                        />
                    </div>
                    <div style={{textAlign: 'center', marginTop: 20}}>
                        <RaisedButton label={this.props.getMessage('92')} secondary={true} onClick={this.enableLinkWithPassword.bind(this)} disabled={!this.state.temporaryPasswordState}/>
                    </div>
                </div>
            );
        } else if (!canEnable) {
            publicLinkField = (
                <div style={{fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16}}>
                    {this.props.getMessage(nodeLeaf ? '225' : '226')}
                </div>
            );
        }else{
            publicLinkField = (
                <div style={{fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16}}>{this.props.getMessage('190')}</div>
            );
        }


        return (
            <div style={this.props.style}>
                {!(linkModel.getLinkUuid() || showTemporaryPassword) &&
                    <div style={{padding: 16}}>
                    <Toggle
                        disabled={this.props.isReadonly() || saving || !linkModel.isEditable() || (!linkModel.getLinkUuid() && !canEnable)}
                        onToggle={this.toggleLink}
                        toggled={linkModel.getLinkUuid() || showTemporaryPassword}
                        label={this.props.getMessage('189')}
                        {...ModernStyles.toggleFieldV2}
                    />
                    </div>
                }
                {saving && <div style={{width: '100%', height: 300, display:'flex', alignItems:'center', justifyContent:'center'}}><CircularProgress/></div>}
                {!toggleOnly && !saving && <div style={{padding:16}}>{publicLinkField}</div>}
                {!toggleOnly && !saving && publicLinkPanes}
            </div>
        );
    }
}

PublicLinkPanel = ShareContextConsumer(PublicLinkPanel);
export {PublicLinkPanel as default}