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

import browserHistory from 'react-router/lib/browserHistory'

const PydioApi = require('pydio/http/api')
const queryString = require('query-string');

const LoginCallbackRouterWrapper = (pydio) => {
    return class extends React.PureComponent {
        render() {
            const values = queryString.parse(this.props.location.search)

            // Eventually find loginLanguage in sessionStorage
            const additionalInfo = {};
            const loginLanguage = sessionStorage.getItem('loginLanguage')
            if (loginLanguage){
                additionalInfo.lang = loginLanguage
            }
            sessionStorage.removeItem('loginLanguage');

            PydioApi.getRestClient().sessionLoginWithAuthCode(values.code, additionalInfo).then(() => {
                browserHistory.replace("/")

                const challenge = values.challenge
                if (challenge) {
                    PydioApi.getRestClient().jwtWithAuthInfo({type: "external", challenge: challenge})
                }

                PydioApi.getRestClient().getOrUpdateJwt()
                    .then(() => pydio.loadXmlRegistry(null, null, null))
                    .catch(() => {})
            })

            return <div></div>
        }
    }

}

export default LoginCallbackRouterWrapper