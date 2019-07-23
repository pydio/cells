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
    const LoginCallbackRouter = (props) => {
        console.log("Routing called")
        const params = queryString.parse(props.location.search);

        PydioApi.getRestClient().jwtFromAuthorizationCode(params.code)
            .then(() => browserHistory.push("/"))
            .catch(e => browserHistory.push("/login"))

        pydio.observe("user_logged", (user) => user && browserHistory.push("/"))

        return <div></div>
    }

    return LoginCallbackRouter;
}

export default LoginCallbackRouterWrapper