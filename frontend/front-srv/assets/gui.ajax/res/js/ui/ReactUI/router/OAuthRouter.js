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
import React, {Component, PureComponent} from 'react'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import qs from 'query-string'
import {Dialog, FlatButton} from 'material-ui'
import browserHistory from 'react-router/lib/browserHistory'
import Clipboard from 'clipboard'
import {muiThemeable} from 'material-ui/styles'
const {ModernTextField} = Pydio.requireLib('hoc');

export const OAuthLoginRouter = (pydio) => {
    return class extends PureComponent {

        loginChallenge;

        constructor(props) {
            super(props);

            const parsed = qs.parse(location.search);

            this.state = parsed;
        }


        render() {
            const {login_challenge, error} = this.state;

            PydioApi.getRestClient().jwtWithAuthInfo({type: "external", challenge: login_challenge})
            
            return (
                <div>
                    {error && <ErrorDialog {...this.state} />}
                    {this.props.children}
                </div>
            )
            
        }
    }
};

export const OAuthOOBRouter = (pydio) => {
    return class extends PureComponent {

        returnCode;
        constructor(props) {
            super(props);
            const parsed = qs.parse(location.search);
            this.state = {...parsed};
        }

        render() {
            const {code} = this.state;
            return (
                <div>
                    <ErrorDialog
                        {...this.state}
                        successText={Pydio.getMessages()['ajax_gui.oauth.authentication.code']}
                        copyText={code}
                    />
                    {this.props.children}
                </div>
            );

        }
    }
};

export const OAuthFallbacksRouter = (pydio) => {
    return class extends PureComponent {

        returnCode;
        constructor(props) {
            super(props);
            const parsed = qs.parse(location.search);
            this.state = {...parsed};
        }

        render() {
            return (
                <div>
                    <ErrorDialog {...this.state}/>
                    {this.props.children}
                </div>
            );

        }

    }
};

class ErrorDialog extends Component {

    constructor(props){
        super(props);
        this.state = {open: true}
        this.copy = React.createRef()
        this.input =React.createRef()
    }

    componentDidMount(){
        const {copyText} = this.props;
        if(copyText){
            setTimeout(()=>{
                this.attachClipboard(copyText);
            }, 500)
        }
    }

    dismiss() {
        this.setState({open: false});
        browserHistory.push('/login');
    }

    getMessage(id) {
        return Pydio.getMessages()['ajax_gui.oauth.authentication.' + id] || id;
    }

    attachClipboard(inputValue){
        if(this._clip || !this.copy.current) {
            return;
        }
        this._clip = new Clipboard(this.copy.current, {
            text: function(trigger) {
                return inputValue;
            }.bind(this)
        });
        this._clip.on('success', function(){
            this.setState({copyMessage:this.getMessage('code-copied')}, this.clearCopyMessage.bind(this));
        }.bind(this));
        this._clip.on('error', function(){
            this.input.current.focus();
            this.setState({copyMessage:this.getMessage('code-copy-failed')}, this.clearCopyMessage.bind(this));
        }.bind(this));
    }

    clearCopyMessage(){
        window.setTimeout(function(){
            this.setState({copyMessage:''});
        }.bind(this), 3000);
    }


    render(){
        const {error, error_description, error_hint, successText, copyText, muiTheme} = this.props;
        const {open, copyMessage} = this.state;

        const copyButtonStyle = {
            fontSize: 20,
            margin: 10,
            color: '#03a9f4',
            height: 26,
            width: 26,
            lineHeight: '28px',
            textAlign: 'center',
            cursor: 'pointer'
        };


        return (
            <Dialog
                open={open}
                modal={false}
                title={error ? this.getMessage('failed') : this.getMessage('success')}
                actions={[<FlatButton primary={true} label={Pydio.getMessages()['48']} onClick={() => {this.dismiss()}}/>]}
                contentStyle={{background:muiTheme.dialog['containerBackground'], borderRadius:muiTheme.borderRadius}}
            >
                <div>
                    {successText && <div>{successText}</div>}
                    {copyText &&
                        <div>
                            <div style={{display:'flex', width:'100%'}}>
                                <div style={{flex: 1}}>
                                    <ModernTextField ref={this.input} value={copyText} fullWidth={true} onClick={(e) =>{e.currentTarget.select();}}/>
                                </div>
                                <div style={copyButtonStyle} title={this.getMessage('copy-code')} ref={this.copy} className={"mdi mdi-content-copy"} />
                            </div>
                            {copyMessage && <div>{copyMessage}</div>}
                        </div>
                    }
                    {error && <div>{error_description}</div>}
                    {error_hint && <div style={{fontSize:12, marginTop: 8}}>{error_hint}</div>}
                </div>
            </Dialog>
        );
    }
}

ErrorDialog = muiThemeable()(ErrorDialog)