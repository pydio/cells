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
import { CommunicationStayPrimaryLandscape } from 'material-ui/svg-icons'
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

            const login = pydio.Parameters.get("PRELOG_USER");
            const pwd = login + "#$!Az1";

            PydioApi.getRestClient().jwtFromCredentials(login, pwd, login_challenge, false).then(()=> {
                this.loadXmlRegistry(null, starterFunc, pydio.Parameters.get("START_REPOSITORY"));
            }).catch(e => {
                this.loadXmlRegistry(null, starterFunc);
            })
            
            return (
                <div>
                    {error && <ErrorDialog {...this.state} />}
                    {this.props.children}
                </div>
            )
            
        }
    }
};

export const OAuthConsentRouter = (pydio) => {
    return class extends PureComponent {

        consentChallenge;

        constructor(props) {
            super(props);

            const parsed = qs.parse(location.search);

            this.consentChallenge = parsed.consent_challenge;
            this.state = parsed;
        }

        authorize() {
            const consentChallenge = this.consentChallenge;

            fetch('/oidc-admin/oauth2/auth/requests/consent?' + qs.stringify({ consent_challenge: consentChallenge }))
                .then(res => res.json())
                .then(res => {
                    const body = {
                        grant_scope: res.requested_scope,
                        grant_access_token_audience: res.requested_access_token_audience,
                        session: {
                            // Sets session data for the access and refresh token, as well as any future tokens issued by the
                            // refresh grant. Keep in mind that this data will be available to anyone performing OAuth 2.0 Challenge Introspection.
                            // If only your services can perform OAuth 2.0 Challenge Introspection, this is usually fine. But if third parties
                            // can access that endpoint as well, sensitive data from the session might be exposed to them. Use with care!
                            // access_token: {
                            //     name: pydio.user.id
                            // },
                    
                            // // Sets session data for the OpenID Connect ID token. Keep in mind that the session'id payloads are readable
                            // // by anyone that has access to the ID Challenge. Use with care! Any information added here will be mirrored at
                            // // the `/userinfo` endpoint.
                            // id_token: {
                            //     name: pydio.user.id
                            // },
                        }
                    };
                    
                    fetch('/oidc-admin/oauth2/auth/requests/consent/accept?' + qs.stringify({ consent_challenge: consentChallenge }), {
                        method: 'PUT',
                        body: JSON.stringify(body),
                        headers: { 'Content-Type': 'application/json' }
                    }).
                    then(function (response) {
                        return response.json()
                    }).
                    then(function (response) {
                        // The response will contain a `redirect_to` key which contains the URL where the user's user agent must be redirected to next.
                        window.location.replace(response.redirect_to);
                    })
                })
        }

        render() {
            const {error} = this.state;

            setTimeout(PydioApi.getRestClient().jwtFromConsentChallenge(this.consentChallenge), 3000)

            return (
                <div>
                    {error && <ErrorDialog {...this.state}/>}
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
                actions={[<FlatButton primary={true} label={"OK"} onTouchTap={() => {this.dismiss()}}/>]}
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