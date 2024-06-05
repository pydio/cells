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
import React, {createRef} from 'react';
import Pydio from 'pydio'
import PropTypes from 'prop-types';
import ShareContextConsumer from '../ShareContextConsumer'
//import TargetedUsers from './TargetedUsers'
import {TextField, Paper} from 'material-ui'
import QRCode from 'qrcode.react'
import Clipboard from 'clipboard'
import ActionButton from '../main/ActionButton'
import PathUtils from 'pydio/util/path'
import LangUtils from 'pydio/util/lang'
import {muiThemeable} from 'material-ui/styles'
import ShareHelper from '../main/ShareHelper'
import ResourcesManager from 'pydio/http/resources-manager'
const {ThemedModernStyles} = Pydio.requireLib('hoc')
const {Tooltip} = Pydio.requireLib("boot");

import LinkModel from './LinkModel'

class PublicLinkField extends React.Component {
    static propTypes = {
        linkModel: PropTypes.instanceOf(LinkModel),
        editAllowed: PropTypes.bool,
        onChange: PropTypes.func,
        showMailer:PropTypes.func
    };

    state = {editLink: false, copyMessage:'', showQRCode: false};

    constructor(props) {
        super(props);
        this.copyButton = createRef();
        this.publicLinkField = createRef();
        ResourcesManager.loadClass('PydioActivityStreams').then(as => {
            this.setState({asLib: as})
        })
    }

    toggleEditMode = () => {
        const {linkModel, pydio, getMessage} = this.props;
        const {editLink, customLink} = this.state;
        if(editLink && customLink){
            const auth = ShareHelper.getAuthorizations();
            if(auth.hash_min_length && customLink.length < auth.hash_min_length){
                pydio.UI.displayMessage('ERROR', getMessage('223').replace('%s', auth.hash_min_length));
                return;
            }
            linkModel.setCustomLink(customLink);
            linkModel.save();
        }
        this.setState({editLink: !editLink, customLink: undefined});
    };

    changeLink = (event) => {
        let value = event.target.value;
        value = LangUtils.computeStringSlug(value);
        this.setState({customLink: value});
    };

    clearCopyMessage = () => {
        setTimeout(function(){
            this.setState({copyMessage:''});
        }.bind(this), 5000);
    };

    attachClipboard = () => {
        const {linkModel, pydio, getMessage} = this.props;
        this.detachClipboard();
        if(this.copyButton.current){
            this._clip = new Clipboard(this.copyButton.current, {
                text: function(trigger) {
                    return ShareHelper.buildPublicUrl(pydio, linkModel.getLink());
                }.bind(this)
            });
            this._clip.on('success', function(){
                this.setState({copyMessage:getMessage('192')}, () => this.clearCopyMessage());
            }.bind(this));
            this._clip.on('error', function(){
                let copyMessage;
                if( global.navigator.platform.indexOf("Mac") === 0 ){
                    copyMessage = getMessage('144');
                }else{
                    copyMessage = getMessage('143');
                }
                this.publicLinkField.current.focus();
                this.setState({copyMessage:copyMessage}, () => this.clearCopyMessage());
            }.bind(this));
        }
    };

    detachClipboard = () => {
        if(this._clip){
            this._clip.destroy();
        }
    };

    componentDidUpdate(prevProps, prevState) {
        this.attachClipboard();
    }

    componentDidMount() {
        this.attachClipboard();
    }

    componentWillUnmount() {
        this.detachClipboard();
    }

    openMailer = () => {
        this.props.showMailer(this.props.linkModel);
    };

    toggleQRCode = () => {
        this.setState({showQRCode:!this.state.showQRCode});
    };

    confirmDisable() {
        const {onDisableLink, getMessage} = this.props;
        if (confirm(getMessage('dialog.link.confirm.remove'))){
            onDisableLink()
        }
    }

    render() {
        const {linkModel, compositeModel, pydio, getMessage, muiTheme} = this.props;
        const publicLink = ShareHelper.buildPublicUrl(pydio, linkModel.getLink());
        const auth = ShareHelper.getAuthorizations();
        const editAllowed = this.props.editAllowed && auth.editable_hash && !this.props.isReadonly() && linkModel.isEditable();
        const {editLink, customLink} = this.state;
        if(editLink && editAllowed){
            const crtValue = customLink === undefined ? linkModel.getLink().LinkHash : customLink
            const crtValueTooShort = customLink !== undefined && customLink.length < auth.hash_min_length
            const legendColor = crtValueTooShort && muiTheme.palette.mui3 && muiTheme.palette.mui3.error
            return (
                <div>
                    <div style={{display:'flex', alignItems:'center', padding: 6, borderRadius: 2}}>
                        <span style={{fontSize:16, display: 'inline-block', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{PathUtils.getDirname(publicLink) + '/ '}</span>
                        <TextField style={{flex:1, marginRight: 10, marginLeft: 10}} autoFocus={true} onChange={this.changeLink} value={crtValue} errorText={crtValueTooShort?" ":null}/>
                        <ActionButton mdiIcon="check" callback={() => this.toggleEditMode()} disabled={crtValueTooShort} />
                    </div>
                    <div style={{textAlign:'center', fontSize:13, paddingTop: 10, color: legendColor}}>{crtValueTooShort?getMessage('223').replace('%s', auth.hash_min_length):getMessage('194')}</div>
                </div>
            );
        }else{
            const {copyMessage, linkTooltip, asLib} = this.state;
            let actionLinks = [], qrCode;
            const {muiTheme} = this.props;
            const copyButton = (
                <div
                    key={"copy"}
                    ref={this.copyButton}
                    style={{position: 'absolute', right: 0, bottom: 7, width:30, height:30, padding:4, backgroundColor:'transparent', fontSize:16, cursor:'pointer'}}
                    onMouseOver={()=>{this.setState({linkTooltip:true})}}
                    onMouseOut={()=>{this.setState({linkTooltip:false})}}
                >
                    <Tooltip
                        label={copyMessage ? copyMessage : getMessage('191')}
                        horizontalPosition={"left"}
                        verticalPosition={"bottom"}
                        show={linkTooltip}
                    />
                    <span className="copy-link-button mdi mdi-content-copy" style={{color: muiTheme.palette.mui3.primary}}/>
                </div>
            )

            if(this.props.showMailer){
                actionLinks.push(<ActionButton key="outline" callback={this.openMailer} mdiIcon="email-outline" messageId="45"/>);
            }
            if(editAllowed){
                actionLinks.push(<ActionButton key="pencil" callback={this.toggleEditMode} mdiIcon="pencil" messageId={"193"}/>);
            }
            if(ShareHelper.qrcodeEnabled()){
                actionLinks.push(<ActionButton key="qrcode" callback={this.toggleQRCode} mdiIcon="qrcode" messageId={'94'}/>);
            }
            if(asLib){
                const {WatchSelectorMui3} = asLib
                actionLinks.push(
                    <WatchSelectorMui3
                        animatedButton={true}
                        pydio={pydio}
                        nodes={[compositeModel.getNode()]}
                        fullWidth={false}
                        readPermissionOnly={!linkModel.hasPermission('Upload')}
                    />
                )
            }
            if(this.props.onDisableLink) {
                actionLinks.push(<ActionButton key="delete" destructive={true} callback={() => this.confirmDisable()} mdiIcon="link-off" messageId="link.disable"/>);
            }
            if(actionLinks.length){
                actionLinks = (
                    <div style={{display:'flex', marginTop:10}}><span style={{flex:1}}/>{actionLinks}<span style={{flex:1}}/></div>
                ) ;
            }else{
                actionLinks = null;
            }
            if(this.state.showQRCode){
                qrCode = <Paper zDepth={1} style={{width:120, paddingTop:10, overflow:'hidden', margin:'0 auto', height:120, textAlign:'center'}}><QRCode size={100} value={publicLink} level="Q"/></Paper>;
            } else {
                qrCode = <Paper zDepth={0} style={{width:120, overflow:'hidden', margin:'0 auto', height:0, textAlign:'center'}}></Paper>
            }
            return (
                <div className="public-link-container">
                    <div style={{marginTop:-8, position:'relative'}}>
                        <TextField
                            floatingLabelText={getMessage("link.floatingLabel")}
                            floatingLabelFixed={true}
                            type="text"
                            name="Link"
                            ref={this.publicLinkField}
                            value={publicLink}
                            onFocus={e => {e.target.select()}}
                            fullWidth={true}
                            {...ThemedModernStyles(muiTheme).textFieldV2}
                        />
                        {copyButton}
                    </div>
                    {actionLinks}
                    {qrCode}
                </div>
            );
        }
    }
}

PublicLinkField = muiThemeable()(PublicLinkField);
PublicLinkField = ShareContextConsumer(PublicLinkField)
export {PublicLinkField as default};