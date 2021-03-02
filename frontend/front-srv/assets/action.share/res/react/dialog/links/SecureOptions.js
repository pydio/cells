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
import {FlatButton, IconButton, FontIcon, DatePicker, Popover} from 'material-ui'
import ShareContextConsumer from '../ShareContextConsumer'
import LinkModel from './LinkModel'
import ShareHelper from '../main/ShareHelper'
const {ValidPassword} = Pydio.requireLib('form');
const {ModernTextField, ModernStyles} = Pydio.requireLib('hoc');

const globStyles = {
    leftIcon: {
        margin:'0 16px 0 4px',
        color: '#757575'
    }
};

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
            resetPassword = (
                <FlatButton
                    disabled={this.props.isReadonly() || !linkModel.isEditable() || auth.password_mandatory}
                    secondary={true}
                    onClick={this.resetPassword}
                    label={this.props.getMessage('174')}
                />
            );
            updatePassword = (
                <div>
                    <FlatButton
                        disabled={this.props.isReadonly() || !linkModel.isEditable()}
                        secondary={true}
                        onClick={(e)=> {this.setState({pwPop:true, pwAnchor:e.currentTarget})}}
                        label={this.props.getMessage('181')}
                    />
                    <Popover
                        open={this.state.pwPop}
                        anchorEl={this.state.pwAnchor}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                        onRequestClose={() => {this.setState({pwPop: false})}}
                    >
                        <div style={{width: 280, padding: 8}}>
                            <ValidPassword
                                name={"update"}
                                ref={"pwdUpdate"}
                                attributes={{label:this.props.getMessage('23')}}
                                value={this.state.updatingPassword ? this.state.updatingPassword : ""}
                                onChange={(v) => {this.setUpdatingPassword(v)}}
                                onValidStatusChange={(s) => this.setState({updatingPasswordDiffer: !s})}
                            />
                            <div style={{paddingTop:20, textAlign:'right'}}>
                                <FlatButton label={Pydio.getMessages()['54']} onClick={()=>{this.setState({pwPop:false,updatingPassword:''})}}/>
                                <FlatButton style={{minWidth:60}} label={Pydio.getMessages()['48']} onClick={()=>{this.changePassword()}} disabled={!this.state.updatingPassword || !this.state.updatingPasswordValid || this.state.updatingPasswordDiffer}/>
                            </div>
                        </div>
                    </Popover>
                </div>
            );
            passwordField = (
                <ModernTextField
                    floatingLabelText={this.props.getMessage('23')}
                    disabled={true}
                    value={'********'}
                    fullWidth={true}
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
                    onValidStatusChange={(v) => {console.log(v); this.setState({validPasswordStatus:v})}}
                />
            );
        }
        if(passwordField){
            return (
                <div className="password-container" style={{display:'flex', alignItems:'center'}}>
                    <FontIcon className="mdi mdi-file-lock" style={globStyles.leftIcon}/>
                    <div style={{width:resetPassword ? '40%' : '100%', display:'inline-block'}}>
                        {passwordField}
                    </div>
                    {resetPassword &&
                        <div style={{width: '60%', display: 'flex'}}>
                            {resetPassword} {updatePassword}
                    </div>
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

        let calIcon = <FontIcon className="mdi mdi-calendar-clock" style={globStyles.leftIcon}/>;
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
                calIcon = <IconButton iconStyle={{color:globStyles.leftIcon.color}} style={{marginLeft: -8, marginRight: 8}} iconClassName="mdi mdi-close-circle" onClick={this.resetExpiration.bind(this)}/>;
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
            <div style={{padding:10, ...this.props.style}}>
                <div style={{fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.43)'}}>{this.props.getMessage('24')}</div>
                <div style={{paddingRight: 10}}>
                {passContainer}
                <div style={{flex:1, display:'flex', alignItems:'baseline', position:'relative'}} className={dateExpired?'limit-block-expired':null}>
                    {calIcon}
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
                        hintText={this.props.getMessage(dateExpired?'21b':'21')}
                        mode="landscape"
                        formatDate={this.formatDate}
                        style={{flex: 1}}
                        fullWidth={true}
                        {...ModernStyles.textField}
                    />
                </div>
                <div style={{flex:1, alignItems:'baseline', display:crtLinkDLAllowed?'flex':'none', position:'relative'}} className={dlExpired?'limit-block-expired':null}>
                    <FontIcon className="mdi mdi-download" style={globStyles.leftIcon}/>
                    <ModernTextField
                        type="number"
                        disabled={this.props.isReadonly() || !linkModel.isEditable()}
                        floatingLabelText={this.props.getMessage(dlExpired?'22b':'22')}
                        value={dlLimitValue > 0 ? dlLimitValue : ''}
                        onChange={this.updateDLExpirationField}
                        fullWidth={true}
                        style={{flex: 1}}
                    />
                    <span style={{position: 'absolute', right: 10, top: 14, fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.43)'}}>{dlCounterString}</span>
                </div>
                </div>
            </div>
        );
    }
}

PublicLinkSecureOptions = ShareContextConsumer(PublicLinkSecureOptions);
export {PublicLinkSecureOptions as default}