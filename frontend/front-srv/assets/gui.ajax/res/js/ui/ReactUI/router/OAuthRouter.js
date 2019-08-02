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

const OAuthRouterWrapper = (pydio) => {
    class OAuthRouter extends React.PureComponent {
        
        constructor(props) {
            super(props)

            this.state = {
                jwt: "INITIAL"
            }

            this._handleAuthorizeChange = this.handleAuthorizeChange.bind(this)
        }

        componentDidMount(props) {
            this.handleAuthorizeChange()

            pydio.observe('user_logged', this._handleAuthorizeChange)
        }

        componentWillUnmount(props) {
            pydio.stopObserving('user_logged', this._handleAuthorizeChange)
        }

        handleAuthorizeChange() {
            PydioApi.getRestClient().getOrUpdateJwt().then(jwt => this.setState({
                jwt: jwt
            }))
        }

        /**
         * sends a request to the specified url from a form. this will change the window location.
         * @param {string} path the path to send the post request to
         * @param {object} params the paramiters to add to the url
         * @param {string} [method=post] the method to use on the form
         */

        post(path, params, method='post') {

            // The rest of this code assumes you are not using a library.
            // It can be made less wordy if you use one.
            const form = document.createElement('form');
            form.method = method;
            form.action = path;
        
            for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = key;
                hiddenField.value = params[key];
        
                form.appendChild(hiddenField);
            }
            }
        
            document.body.appendChild(form);
            form.submit();
        }

        render() {
            const {jwt} = this.state;

            if (jwt === "INITIAL") {
            } else if (jwt === "") {
                 pydio.getController().fireAction('login');
            } else {
                this.post('/oauth2/auth' + window.location.search + '&access_token=' + jwt, {
                    "scopes": ["openid", "profile", "email", "offline_access"]
                })
            }

            return (
                <div>
                    {this.props.children}
                </div>
            )
            
        }
    }

    return OAuthRouter;
}

export default OAuthRouterWrapper