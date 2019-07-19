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

        render() {
            const {jwt} = this.state;

            if (jwt === "INITIAL") {
            } else if (jwt === "") {
                 pydio.getController().fireAction('login');
            } else {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", '/oauth2/auth' + window.location.search + '&access_token=' + jwt, true);
        
                //Send the proper header information along with the request
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        
                xhr.onreadystatechange = function() { // Call a function when the state changes.
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                        window.location.href = this.responseURL
                    }
                }
        
                xhr.send("scopes=openid&scopes=profile&scopes=email&scopes=offline_access");
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