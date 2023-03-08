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
import Pydio from 'pydio'
import PydioApi from "pydio/http/api"
import createReactClass from 'create-react-class'
import {muiThemeable, getMuiTheme, darkBaseTheme} from 'material-ui/styles';
import {CircularProgress, TextField, MuiThemeProvider, FlatButton, Checkbox, FontIcon, MenuItem, SelectField, IconButton, IconMenu} from 'material-ui';
import {TokenServiceApi, RestResetPasswordRequest} from 'cells-sdk';
const {ValidPassword} = Pydio.requireLib('form')

const LanguagePicker = (props) => {
    const items = [];
    const pydio = Pydio.getInstance();
    const {onChange = ()=>{}} = props;
    
    pydio.listLanguagesWithCallback((key, label, current = 'en') => items.push(
        <MenuItem
            primaryText={label}
            value={key}
            rightIcon={current ? <FontIcon className="mdi mdi-check" style={{top:-1}}/> : null}
        />
    ));
    const {anchorOrigin, targetOrigin} = props;

    const iconStyles = {
        style:{
            width:38,
            height:38,
            padding:6,
            borderRadius:'50%'
        },
        hoveredStyle:{
            backgroundColor:'rgba(255,255,255,.1)'
        },
        iconStyle:{
            fontSize:20,
            color:'rgba(255,255,255,.87)'
        }
    };

    return (
        <IconMenu
            iconButtonElement={<IconButton tooltip={pydio.MessageHash[618]} iconClassName="mdi mdi-flag-outline" {...iconStyles}/>}
            onItemClick={(e,o) => {pydio.loadI18NMessages(o.props.value); onChange(o.props.value)}}
            desktop={true}
            anchorOrigin={anchorOrigin} targetOrigin={targetOrigin}
        >
            {items}
        </IconMenu>
    );
};

let LoginDialogMixin = {

    getInitialState(){
        const pydio = Pydio.getInstance();

        return {
            globalParameters: pydio.Parameters,
            authParameters: pydio.getPluginConfigs('auth'),
            errorId: null,
            loginLanguage: sessionStorage.getItem('loginLanguage') || undefined
        };
    },

    postLoginData(restClient){

        const pydio = Pydio.getInstance();
        const passwordOnly = this.state.globalParameters.get('PASSWORD_AUTH_ONLY');
        let login;
        if(passwordOnly){
            login = this.state.globalParameters.get('PRESET_LOGIN');
        }else{
            login = this.refs.login.getValue();
        }
        const {loginLanguage} = this.state;
        sessionStorage.removeItem('loginLanguage');

        return restClient.sessionLoginWithCredentials(login, this.refs.password.getValue(), loginLanguage)
            .then(() => this.dismiss())
            .then(() => restClient.getOrUpdateJwt().then(() => pydio.loadXmlRegistry(null, null, null)).catch(() => {}))
            .catch(e => {
                if (e && e.response && e.response.body) {
                    this.setState({errorId: e.response.body.Title});
                } else if (e && e.response && e.response.text) {
                    this.setState({errorId: e.response.text});
                } else if(e && e.message){
                    this.setState({errorId: e.message});
                } else {
                    this.setState({errorId: 'Login failed!'})
                }
            })
    }
};

let LoginPasswordDialog = createReactClass({

    mixins:[
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.SubmitButtonProviderMixin,
        LoginDialogMixin
    ],

    getDefaultProps(){
        return {
            dialogTitle: '', //pydio.MessageHash[163],
            dialogIsModal: true,
            dialogSize:'sm'
        };
    },

    getInitialState(){
        return {rememberChecked: false, loading: false};
    },

    submit(){
        let client = PydioApi.getRestClient();
        this.setState({loading: true}, () => {this._updater(this.makeButtons())})
        this.postLoginData(client).then(() => {
            this.setState({loading: false}, () => {this._updater(this.makeButtons())})
        });
    },

    fireForgotPassword(e){
        e.stopPropagation();
        Pydio.getInstance().getController().fireAction(this.state.authParameters.get("FORGOT_PASSWORD_ACTION"));
    },

    useBlur(){
        return true;
    },

    dialogBodyStyle(){
        if (this.state.globalParameters.get('PASSWORD_AUTH_ONLY')){
            return {};
        }
        return {minHeight: 250};
    },

    makeButtons() {
        const pydio = Pydio.getInstance();
        const {globalParameters, authParameters, loading} = this.state;
        const passwordOnly = globalParameters.get('PASSWORD_AUTH_ONLY');
        const secureLoginForm = passwordOnly || authParameters.get('SECURE_LOGIN_FORM');

        let enterButton
        if(loading) {
            enterButton = (
                <div style={{height: 36, padding: '8px 30px', display: 'inline-block', backgroundColor: 'rgba(153,153,153,.2)'}}>
                    <CircularProgress size={20} mode={"indeterminate"} color={"white"} thickness={2.5}/>
                </div>
            )
        } else {
            enterButton = (
                <FlatButton
                    id="dialog-login-submit"
                    default={true}
                    labelStyle={{color:'white'}}
                    key="enter"
                    disabled={loading}
                    label={pydio.MessageHash[617]}
                    onClick={() => this.submit()}/>
            );

        }
        let buttons = [];
        if(false && !secureLoginForm){
            buttons.push(
                <DarkThemeContainer key="remember" style={{flex:1, textAlign:'left', paddingLeft: 16}}>
                    <Checkbox label={pydio.MessageHash[261]} labelStyle={{fontSize:13}} onCheck={(e,c)=>{this.setState({rememberChecked:c})}}/>
                </DarkThemeContainer>
            );
            buttons.push(enterButton);
            return [<div style={{display:'flex',alignItems:'center'}}>{buttons}</div>];
        }else{
            return [enterButton];
        }
    },

    getButtons(updater){
        this._updater = updater;
        return this.makeButtons();
    },

    render(){
        const passwordOnly = this.state.globalParameters.get('PASSWORD_AUTH_ONLY');
        const secureLoginForm = passwordOnly || this.state.authParameters.get('SECURE_LOGIN_FORM');
        const forgotPasswordLink = this.state.authParameters.get('ENABLE_FORGOT_PASSWORD') && !passwordOnly;
        const pydio = Pydio.getInstance()

        let errorMessage;
        if(this.state.errorId){
            errorMessage = <div className="ajxp_login_error">{this.state.errorId}</div>;
        }
        let forgotLink;
        if(forgotPasswordLink){
            forgotLink = (
                <div className="forgot-password-link">
                    <a style={{cursor:'pointer'}} onClick={this.fireForgotPassword}>{pydio.MessageHash[479]}</a>
                </div>
            );
        }
        let additionalComponentsTop, additionalComponentsBottom;
        if(this.props.modifiers){
            let comps = {top: [], bottom: []};
            this.props.modifiers.map(function(m){
                m.renderAdditionalComponents(this.props, this.state, comps);
            }.bind(this));
            if(comps.top.length) {
                additionalComponentsTop = <div>{comps.top}</div>;
            }
            if(comps.bottom.length) {
                additionalComponentsBottom = <div>{comps.bottom}</div>;
            }
        }

        const custom = this.props.pydio.Parameters.get('customWording');
        let logoUrl = custom.icon;
        let loginTitle = pydio.MessageHash[passwordOnly ? 552 : 180];
        let loginLegend;
        if(custom.iconBinary){
            logoUrl = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + custom.iconBinary;
        }
        if (!passwordOnly){
            if(custom.loginTitle) {
                loginTitle = custom.loginTitle;
            }
            if(custom.loginLegend) {
                loginLegend = custom.loginLegend;
            }
        }

        const logoStyle = {
            backgroundSize: 'contain',
            backgroundImage: 'url('+logoUrl+')',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position:'absolute',
            top: -130,
            left: 0,
            width: 320,
            height: 120
        };

        return (
            <DarkThemeContainer>
                {logoUrl && <div style={logoStyle}></div>}
                <div className="dialogLegend" style={{fontSize: 22, paddingBottom: 12, lineHeight: '28px'}}>
                    {loginTitle}
                    <div style={{position:'absolute', bottom: 9, left:24}}>
                        <LanguagePicker
                            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                            targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                            onChange={(v) => {this.setState({loginLanguage: v}); sessionStorage.setItem('loginLanguage', v)}}
                        />
                    </div>
                </div>
                {loginLegend && <div>{loginLegend}</div>}
                {errorMessage}
                {additionalComponentsTop}
                <form autoComplete={secureLoginForm?"off":"on"}>
                    {!passwordOnly && <TextField
                        className="blurDialogTextField"
                        autoComplete={secureLoginForm?"off":"on"}
                        floatingLabelText={pydio.MessageHash[181]}
                        ref="login"
                        onKeyDown={this.submitOnEnterKey}
                        fullWidth={true}
                        id="application-login"
                    />}
                    <TextField
                        id="application-password"
                        className="blurDialogTextField"
                        autoComplete={secureLoginForm?"off":"on"}
                        type="password"
                        floatingLabelText={pydio.MessageHash[182]}
                        ref="password"
                        onKeyDown={this.submitOnEnterKey}
                        fullWidth={true}
                    />
                </form>
                {additionalComponentsBottom}
                {forgotLink}
            </DarkThemeContainer>
        );
    }

});

class DarkThemeContainer extends React.Component{

    render(){

        const {muiTheme, ...props} = this.props;
        let baseTheme = {...darkBaseTheme};
        baseTheme.palette.primary1Color = muiTheme.palette.accent1Color;
        const darkTheme = getMuiTheme(baseTheme);

        return (
            <MuiThemeProvider muiTheme={darkTheme}>
                <div {...props}/>
            </MuiThemeProvider>
        );

    }

}

DarkThemeContainer = muiThemeable()(DarkThemeContainer);

class Callbacks{

    static sessionLogout(){

        const pydio = Pydio.getInstance();

        if(pydio.Parameters.get("PRELOG_USER")){
            return;
        }
        const url = pydio.getFrontendUrl();
        const target = `${url.protocol}//${url.host}/logout`;

        PydioApi.getRestClient().sessionLogout()
            .then(() => pydio.loadXmlRegistry(null, null, null))
            .catch((e) => {
                window.location.href = target;
            });

    }

    static loginPassword(manager, args = []) {

        const pydio = Pydio.getInstance();
        if(pydio.Parameters.get("PRELOG_USER")){
            return;
        }

        const {...props} = args[0] || {};

        pydio.UI.openComponentInModal('AuthfrontCoreActions', 'LoginPasswordDialog', {...props, blur: true});
        
    }

}

const ResetPasswordRequire = createReactClass({

    mixins: [
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.SubmitButtonProviderMixin,
        PydioReactUI.CancelButtonProviderMixin
    ],

    statics: {
        open : () => {
            Pydio.getInstance().UI.openComponentInModal('AuthfrontCoreActions', 'ResetPasswordRequire', {blur: true});
        }
    },

    getDefaultProps(){
        return {
            dialogTitle: Pydio.getInstance().MessageHash['gui.user.1'],
            dialogIsModal: true,
            dialogSize:'sm'
        };
    },

    useBlur(){
        return true;
    },

    cancel(){
        Pydio.getInstance().Controller.fireAction('login');
    },

    submit(){
        const valueSubmitted = this.state && this.state.valueSubmitted;
        if(valueSubmitted){
            this.cancel();
        }
        const value = this.refs.input && this.refs.input.getValue();
        if(!value) {
            return;
        }

        const api = new TokenServiceApi(PydioApi.getRestClient());
        api.resetPasswordToken(value, {}).then(() => {
            this.setState({valueSubmitted: true});
        });
    },

    render(){
        const mess = this.props.pydio.MessageHash;
        const valueSubmitted = this.state && this.state.valueSubmitted;
        return (
            <div>
                {!valueSubmitted &&
                    <div>
                        <div className="dialogLegend">{mess['gui.user.3']}</div>
                        <TextField
                            className="blurDialogTextField"
                            ref="input"
                            fullWidth={true}
                            floatingLabelText={mess['gui.user.4']}
                        />
                    </div>
                }
                {valueSubmitted &&
                    <div>{mess['gui.user.5']}</div>
                }
            </div>
        );

    }


});

const ResetPasswordDialog = createReactClass({

    mixins: [
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.SubmitButtonProviderMixin
    ],

    statics: {
        open : () => {
            Pydio.getInstance().UI.openComponentInModal('AuthfrontCoreActions', 'ResetPasswordDialog', {blur:true});
        }
    },

    getDefaultProps(){
        return {
            dialogTitle: Pydio.getInstance().MessageHash['gui.user.1'],
            dialogIsModal: true,
            dialogSize:'sm'
        };
    },

    getInitialState(){
        return {valueSubmitted: false, formLoaded: false, passValue:null, userId:null};
    },

    useBlur(){
        return true;
    },


    submit(){
        const {pydio} = this.props;

        if(this.state.valueSubmitted){
            this.props.onDismiss();
            const url = pydio.getFrontendUrl();
            window.location.href = `${url.protocol}//${url.host}/login`;
            return;
        }

        const mess = pydio.MessageHash;
        const api = new TokenServiceApi(PydioApi.getRestClient());
        const request = new RestResetPasswordRequest();
        request.UserLogin = this.state.userId;
        request.ResetPasswordToken = pydio.Parameters.get('USER_ACTION_KEY');
        request.NewPassword = this.state.passValue;
        api.resetPassword(request).then(() => {
            this.setState({valueSubmitted: true});
        }).catch(e => {
            pydio.UI.displayMessage('ERROR', mess[240]);
        });
    },

    componentDidMount(){
        Promise.resolve(Pydio.requireLib('form', true)).then(()=>{
            this.setState({formLoaded: true});
        });
    },

    onPassChange(newValue, oldValue){
        this.setState({passValue: newValue});
    },

    onUserIdChange(event, newValue){
        this.setState({userId: newValue});
    },

    render(){
        const mess = this.props.pydio.MessageHash;
        const {valueSubmitted, formLoaded, passValue, userId} = this.state;
        if(!valueSubmitted && formLoaded){

            return (
                <div>
                    <div className="dialogLegend">{mess['gui.user.8']}</div>
                    <TextField
                        className="blurDialogTextField"
                        value={userId}
                        floatingLabelText={mess['gui.user.4']}
                        onChange={this.onUserIdChange.bind(this)}
                    />
                    <ValidPassword
                        className="blurDialogTextField"
                        onChange={this.onPassChange.bind(this)}
                        attributes={{name:'password',label:mess[198]}}
                        value={passValue}
                        dialogField={true}
                    />
                </div>

            );

        }else if(valueSubmitted){

            return (
                <div>{mess['gui.user.6']}</div>
            );

        }else{
            return <PydioReactUI.Loader/>
        }

    }


});

export {Callbacks, LoginPasswordDialog, ResetPasswordRequire, ResetPasswordDialog, LanguagePicker}