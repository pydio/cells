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
                        successText={"You were succesfully authenticated. Please copy and paste the code to your command line terminal"}
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

    dismiss() {
        this.setState({open: false});
        browserHistory.push('/login');
    }

    render(){
        const {error, error_description, error_hint, successText, copyText} = this.props;
        let open = true;
        if(this.state && this.state.open !== undefined){
            open = this.state.open;
        }
        return (
            <Dialog
                open={open}
                modal={false}
                title={error ? "Authentication Error" : "Authentication Success"}
                actions={[<FlatButton primary={true} label={"OK"} onClick={() => {this.dismiss()}}/>]}
            >
                <div>
                    {successText && <div>{successText}</div>}
                    {copyText && <ModernTextField value={copyText} fullWidth={true} focusOnMount={true}/>}
                    {error && <div>{error_description}</div>}
                    {error_hint && <div style={{fontSize:12, marginTop: 8}}>{error_hint}</div>}
                </div>
            </Dialog>
        );
    }
}