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

import {Switch} from 'react-router-dom';
import Router from 'react-router/lib/Router';
import Route from 'react-router/lib/Route';
import IndexRoute from 'react-router/lib/IndexRoute';
import browserHistory from 'react-router/lib/browserHistory';

import MainRouter from './MainRouter';
import WorkspaceRouter from './WorkspaceRouter';
import PathRouter from './PathRouter';
import HomeRouter from './HomeRouter';
import OAuthRouter from './OAuthRouter';
import LoginRouter from './LoginRouter';
import LoginCallbackRouter from './LoginCallbackRouter';
import LogoutRouter from './LogoutRouter';

function getRoutes(pydio){
    const routes = (
        <Switch>
            <Route path="login">
                <IndexRoute component={LoginRouter(pydio)}/>
                <Route path="callback" component={LoginCallbackRouter(pydio)} />
            </Route>
            <Route path="logout" component={LogoutRouter(pydio)} />
            <Route path="authorize">
                <IndexRoute component={OAuthRouter(pydio)} />
            </Route> 
            <Route path="/" component={MainRouter(pydio)}>
                <Route path=":workspaceId" component={WorkspaceRouter(pydio)}>
                    <IndexRoute component={PathRouter(pydio)}/>
                    <Route path="*" component={PathRouter(pydio)}/>
                </Route>
            </Route>
        </Switch>
    )
    return routes;
}

const PydioRouter = ({pydio}) => {
    pydio.observe("login_required", () => {
        browserHistory.push("/login")
    });

    pydio.observe("logout_required", () => {
        browserHistory.push('/logout')
    })

    return (
        // Routes are defined as a constant to avoid warning about hot reloading
        <Router history={browserHistory} routes={getRoutes(pydio)} />
    )
}

export default PydioRouter;
