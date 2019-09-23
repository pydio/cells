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

import PydioApi from 'pydio/http/api'
import qs from 'query-string'

export const OAuthLoginRouter = (pydio) => {
    return class extends React.PureComponent {

        loginChallenge;

        constructor(props) {
            super(props)

            const parsed = qs.parse(location.search);

            this.loginChallenge = parsed.login_challenge
        }

        authorize() {

            const loginChallenge = this.loginChallenge

            PydioApi.getRestClient().getOrUpdateJwt().then((jwt) => {
                const body = {
                    subject: pydio.user.id,
                }
                
                fetch('/oidc/admin/oauth2/auth/requests/login/accept?' + qs.stringify({ login_challenge: loginChallenge }), {
                    method: 'PUT',
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' }
                }).
                then(function (response) {
                    console.log("Response is ", response)
                    return response.json()
                }).
                then(function (response) {
                    // The response will contain a `redirect_to` key which contains the URL where the user's user agent must be redirected to next.
                    window.location.replace(response.redirect_to);
                })
            })
        }

        render() {
            if (pydio.user) {
                this.authorize()
                return null
            }

            pydio.observe('user_logged', (u) => u && this.authorize())
            
            return (
                <div>
                    {this.props.children}
                </div>
            )
            
        }
    }
}

export const OAuthConsentRouter = (pydio) => {
    return class extends React.PureComponent {

        consentChallenge;

        constructor(props) {
            super(props)

            const parsed = qs.parse(location.search);

            this.consentChallenge = parsed.consent_challenge
        }

        authorize() {

            const consentChallenge = this.consentChallenge

            PydioApi.getRestClient().getOrUpdateJwt().then((jwt) => {
                const body = {
                    // A list of permissions the user granted to the OAuth 2.0 Client. This can be fewer permissions that initially requested, but are rarely more or other permissions than requested.
                    grant_scope: ["openid", "profile", "email", "pydio", "offline"],
                
                    // Sets the audience the user authorized the client to use. Should be a subset of `requested_access_token_audience`.
                    // grant_access_token_audience: ["cells-sync"],
                
                    // The session allows you to set additional data in the access and ID tokens.
                    session: {
                        // Sets session data for the access and refresh token, as well as any future tokens issued by the
                        // refresh grant. Keep in mind that this data will be available to anyone performing OAuth 2.0 Challenge Introspection.
                        // If only your services can perform OAuth 2.0 Challenge Introspection, this is usually fine. But if third parties
                        // can access that endpoint as well, sensitive data from the session might be exposed to them. Use with care!
                        access_token: {
                            name: pydio.user.id
                        },
                
                        // Sets session data for the OpenID Connect ID token. Keep in mind that the session'id payloads are readable
                        // by anyone that has access to the ID Challenge. Use with care! Any information added here will be mirrored at
                        // the `/userinfo` endpoint.
                        id_token: {
                            name: pydio.user.id
                        },
                    }
                }
                
                fetch('/oidc/admin/oauth2/auth/requests/consent/accept?' + qs.stringify({ consent_challenge: consentChallenge }), {
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
            if (pydio.user) {
                this.authorize()
                return null
            }

            pydio.observe('user_logged', (u) => u && this.authorize())
            
            return (
                <div>
                    {this.props.children}
                </div>
            )
            
        }
    }
}