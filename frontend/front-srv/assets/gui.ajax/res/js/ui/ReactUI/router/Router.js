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
import {Switch} from 'react-router-dom';
import {Router, Route} from 'react-router';
import IndexRoute from 'react-router/lib/IndexRoute';
import browserHistory from 'react-router/lib/browserHistory';

import MainRouter from './MainRouter';
import HomepageRouter from './HomepageRouter';
import WorkspaceRouter from './WorkspaceRouter';
import PathRouter from './PathRouter';
import {OAuthLoginRouter, OAuthOOBRouter, OAuthFallbacksRouter} from './OAuthRouter';
import LoginRouter from './LoginRouter';
import LoginCallbackRouter from './LoginCallbackRouter';
import LogoutRouter from './LogoutRouter';
import LogoutCallbackRouter from './LogoutCallbackRouter';

function getRoutes(pydio){
    return (
        <Switch>
            <Route path="/login">
                <IndexRoute component={LoginRouter(pydio)}/>
                <Route path="callback" component={LoginCallbackRouter(pydio)} />
            </Route>
            <Route path="/logout" component={LogoutRouter(pydio)} />
            <Route path="/oauth2">
                <Route path="login" component={OAuthLoginRouter(pydio)} />
                <Route path="oob" component={OAuthOOBRouter(pydio)}/>
                <Route path="logout/callback" component={LogoutCallbackRouter(pydio)} />
                <Route path="fallbacks/error" component={OAuthFallbacksRouter(pydio)}/>
            </Route>
            <Route path="/" component={MainRouter(pydio)}>
                <IndexRoute component={HomepageRouter(pydio)}/>
                <Route path=":workspaceId" component={WorkspaceRouter(pydio)}>
                    <IndexRoute component={PathRouter(pydio)}/>
                    <Route path="*" component={PathRouter(pydio)}/>
                </Route>
            </Route>
        </Switch>
    );
}

class PydioRouter extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            renderOnce: true
        }
    }

    render() {
        return (
            // Routes are defined as a constant to avoid warning about hot reloading
            <Router history={browserHistory} routes={getRoutes(this.props.pydio)} />
        )
    }
}

export default PydioRouter;
