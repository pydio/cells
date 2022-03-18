import React from 'react';

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
import PropTypes from 'prop-types';

import Pydio from 'pydio'
import PassUtils from 'pydio/util/pass'
import {FlatButton, IconButton, DatePicker, Popover} from 'material-ui'
import ShareContextConsumer from '../ShareContextConsumer'
import LinkModel from './LinkModel'
import ShareHelper from '../main/ShareHelper'
const {ValidPassword} = Pydio.requireLib('form');
const {ModernTextField, ModernStyles} = Pydio.requireLib('hoc');
const {moment} = Pydio.requireLib('boot');

const globStyles = {
    iconButton:{
        style:{width:40, height: 40, padding: 6},
        iconStyle:{color: 'rgba(0,0,0,.5)', fontSize: 20}
    },
    leftIcon: {
        margin:'0 16px 0 4px',
        color: '#757575'
    }
};

export function SecureOptionsTitle(compositeModel, linkModel, getMessage) {
    let mainString = getMessage('link.secure.title')
    let perms = [];
    const link = linkModel.getLink()
    let warning;
    if(link.AccessEnd && parseInt(link.AccessEnd) !== 0){
        const expDate = new Date(parseInt(link.AccessEnd) * 1000)
        const now = new Date()
        let s = getMessage('link.secure.expires')
        if(expDate < now){
            s = getMessage('link.secure.expired')
            warning = <span className={"mdi mdi-alert"}/>
        }
        perms.push(s + ' ' + moment(expDate).fromNow())
    }
    if(link.PasswordRequired){
        perms.push(getMessage('link.secure.hasPassword'))
    }
    if(link.MaxDownloads > 0){
        perms.push( getMessage('link.secure.maxdownloads').replace('%d', link.MaxDownloads))
    }
    let legend;
    if(perms.length){
        legend = <React.Fragment>{warning}{perms.join(', ')}</React.Fragment>
    }
    return {title: getMessage('link.secure.title'), legend}
}


class PublicLinkSecureOptions extends React.Component {
    static propTypes = {
        linkModel: PropTypes.instanceOf(LinkModel).isRequired,
        style: PropTypes.object
    };

    state = {};

    updateDLExpirationField = (event) => {
        let newValue = event.currentTarget.value;
        if(parseInt(newValue) < 0) {
            newValue = - parseInt(newValue);
        }
        const {linkModel} = this.props;
        let link = linkModel.getLink();
        link.MaxDownloads = newValue;
        linkModel.updateLink(link);
    };

    updateDaysExpirationField = (event, newValue) => {
        if(!newValue){
            newValue = event.currentTarget.getValue();
        }
        const {linkModel} = this.props;
        let link = linkModel.getLink();
        link.AccessEnd = newValue;
        linkModel.updateLink(link);
    };

    onDateChange = (event, value) => {
        const date2 = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
        this.updateDaysExpirationField(event, Math.floor(date2/1000) + "");
    };

    resetPassword = () => {
        const {linkModel} = this.props;
        linkModel.setUpdatePassword('');
        linkModel.getLink().PasswordRequired = false;
        linkModel.notifyDirty();
    };

    setUpdatingPassword = (newValue) => {
        PassUtils.checkPasswordStrength(newValue, (ok, msg) =>{
            this.setState({updatingPassword: newValue, updatingPasswordValid: ok});
        })
    };

    changePassword = () => {
        const {linkModel} = this.props;
        const {updatingPassword} = this.state;
        linkModel.setUpdatePassword(updatingPassword);
        this.setState({pwPop: false, updatingPassword: "", updatingPasswordValid: false});
        linkModel.notifyDirty();
    };

    updatePassword = (newValue, oldValue) => {
        const {linkModel} = this.props;
        const {validPasswordStatus} = this.state;
        if (validPasswordStatus) {
            this.setState({invalidPassword: null, invalid: false}, () => {
                linkModel.setUpdatePassword(newValue);
            });
        } else {
            this.setState({invalidPassword: newValue, invalid: true});
        }
    };

    resetDownloads = () => {
        if(window.confirm(this.props.getMessage('106'))){
            const {linkModel} = this.props;
            linkModel.getLink().CurrentDownloads = "0";
            linkModel.notifyDirty();
        }
    };

    resetExpiration = () => {
        const {linkModel} = this.props;
        linkModel.getLink().AccessEnd = "0";
        linkModel.notifyDirty();
    };

    renderPasswordContainer = () => {
        const {linkModel} = this.props;
        const link = linkModel.getLink();
        const auth = ShareHelper.getAuthorizations();
        let passwordField, resetPassword, updatePassword;
        if(link.PasswordRequired){
            if (!this.props.isReadonly() && linkModel.isEditable() && !auth.password_mandatory) {
                resetPassword = (
                    <IconButton
                        iconClassName={"mdi mdi-close-circle"}
                        onClick={this.resetPassword}
                        tooltip={this.props.getMessage('174')}
                        {...globStyles.iconButton}
                    />
                );
            }
            if(!this.props.isReadonly() && linkModel.isEditable()){
                updatePassword = (
                    <div>
                        <IconButton
                            iconClassName={"mdi mdi-pencil"}
                            onClick={(e)=> {this.setState({pwPop:true, pwAnchor:e.currentTarget})}}
                            tooltip={this.props.getMessage('181')}
                            {...globStyles.iconButton}
                        />
                        <Popover
                            open={this.state.pwPop}
                            anchorEl={this.state.pwAnchor}
                            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            targetOrigin={{horizontal: 'right', vertical: 'top'}}
                            onRequestClose={() => {this.setState({pwPop: false})}}
                        >
                            <div style={{width: 380, padding: 8}}>
                                <ValidPassword
                                    name={"update"}
                                    ref={"pwdUpdate"}
                                    attributes={{label:this.props.getMessage('23')}}
                                    value={this.state.updatingPassword ? this.state.updatingPassword : ""}
                                    onChange={(v) => {this.setUpdatingPassword(v)}}
                                    onValidStatusChange={(s) => this.setState({updatingPasswordDiffer: !s})}
                                    variant={"v2"}
                                />
                                <div style={{paddingTop:20, textAlign:'right'}}>
                                    <FlatButton label={Pydio.getMessages()['54']} onClick={()=>{this.setState({pwPop:false,updatingPassword:''})}}/>
                                    <FlatButton style={{minWidth:60}} label={Pydio.getMessages()['48']} onClick={()=>{this.changePassword()}} disabled={!this.state.updatingPassword || !this.state.updatingPasswordValid || this.state.updatingPasswordDiffer}/>
                                </div>
                            </div>
                        </Popover>
                    </div>
                );
            }
            passwordField = (
                <ModernTextField
                    floatingLabelText={this.props.getMessage('23')}
                    disabled={true}
                    value={'********'}
                    fullWidth={true}
                    variant={"v2"}
                />
            );
        }else if(!this.props.isReadonly() &&  linkModel.isEditable()){
            passwordField = (
                <ValidPassword
                    name="share-password"
                    ref={"pwd"}
                    attributes={{label:this.props.getMessage('23')}}
                    value={this.state.invalidPassword? this.state.invalidPassword : linkModel.updatePassword}
                    onChange={this.updatePassword.bind(this)}
                    onValidStatusChange={(v) => {this.setState({validPasswordStatus:v})}}
                    variant={"v2"}
                />
            );
        }
        if(passwordField){
            return (
                <div className="password-container" style={{display:'flex', alignItems:'baseline', width:'100%', position:'relative'}}>
                    <div style={{width:'100%', display:'inline-block'}}>
                        {passwordField}
                    </div>
                    {(resetPassword || updatePassword) &&
                        <div style={{position:'absolute', right: 0, bottom: 0, display: 'flex'}}>{updatePassword}{resetPassword}</div>
                    }
                </div>
            );
        }else{
            return null;
        }
    };

    formatDate = (dateObject) => {
        const dateFormatDay = this.props.getMessage('date_format', '').split(' ').shift();
        return dateFormatDay
            .replace('Y', dateObject.getFullYear())
            .replace('m', dateObject.getMonth() + 1)
            .replace('d', dateObject.getDate());
    };

    render() {

        const {linkModel} = this.props;
        const link = linkModel.getLink();

        const passContainer = this.renderPasswordContainer();
        const crtLinkDLAllowed = linkModel.hasPermission('Download') && !linkModel.hasPermission('Preview') && !linkModel.hasPermission('Upload');
        let dlLimitValue = parseInt(link.MaxDownloads);
        const expirationDateValue = parseInt(link.AccessEnd);

        let calIcon;
        let expDate, maxDate, dlCounterString, dateExpired = false, dlExpired = false;
        const today = new Date();

        const auth = ShareHelper.getAuthorizations();
        if(parseInt(auth.max_expiration) > 0){
            maxDate = new Date();
            maxDate.setDate(today.getDate() + parseInt(auth.max_expiration));
        }
        if(parseInt(auth.max_downloads) > 0){
            dlLimitValue = Math.max(1, Math.min(dlLimitValue, parseInt(auth.max_downloads)));
        }

        if(expirationDateValue){
            if(expirationDateValue < 0){
                dateExpired = true;
            }
            expDate = new Date(expirationDateValue * 1000);
            if(!parseInt(auth.max_expiration)){
                calIcon = (
                    <IconButton
                        iconStyle={globStyles.iconButton.iconStyle}
                        style={{...globStyles.iconButton.style, position:'absolute', right: 0, bottom: 0, zIndex: 1}}
                        iconClassName="mdi mdi-close-circle"
                        onClick={this.resetExpiration.bind(this)}
                    />)
                ;
            }
        }
        if(dlLimitValue){
            const dlCounter = parseInt(link.CurrentDownloads) || 0;
            let resetLink;
            if(dlCounter) {
                resetLink = <a style={{cursor:'pointer'}} onClick={this.resetDownloads.bind(this)} title={this.props.getMessage('17')}>({this.props.getMessage('16')})</a>;
                if(dlCounter >= dlLimitValue){
                    dlExpired = true;
                }
            }
            dlCounterString = <span className="dlCounterString">{dlCounter+ '/'+ dlLimitValue} {resetLink}</span>;
        }
        return (
            <div>
                {passContainer}
                <div style={{display:'flex', alignItems:'baseline', position:'relative'}} className={dateExpired?'limit-block-expired':null}>
                    <DatePicker
                        ref="expirationDate"
                        key="start"
                        value={expDate}
                        minDate={new Date()}
                        maxDate={maxDate}
                        autoOk={true}
                        disabled={this.props.isReadonly() || !linkModel.isEditable()}
                        onChange={this.onDateChange}
                        showYearSelector={true}
                        floatingLabelText={this.props.getMessage(dateExpired?'21b':'21')}
                        mode="landscape"
                        formatDate={this.formatDate}
                        fullWidth={true}
                        {...ModernStyles.textFieldV2}
                        style={{flex: 1}}
                        textFieldStyle={{...ModernStyles.textFieldV2.style, flex: 1}}
                    />
                    {calIcon}
                </div>
                <div style={{alignItems:'baseline', display:crtLinkDLAllowed?'flex':'none', position:'relative'}} className={dlExpired?'limit-block-expired':null}>
                    <ModernTextField
                        type="number"
                        disabled={this.props.isReadonly() || !linkModel.isEditable()}
                        floatingLabelText={this.props.getMessage(dlExpired?'22b':'22')}
                        value={dlLimitValue > 0 ? dlLimitValue : ''}
                        onChange={this.updateDLExpirationField}
                        fullWidth={true}
                        style={{flex: 1}}
                        variant={"v2"}
                    />
                    <span style={{position: 'absolute', right: 10, top: 14, fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.43)'}}>{dlCounterString}</span>
                </div>
            </div>
        );
    }
}

PublicLinkSecureOptions = ShareContextConsumer(PublicLinkSecureOptions);
export {PublicLinkSecureOptions as default}