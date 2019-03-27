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

import Router from 'react-router/lib/Router';
import Route from 'react-router/lib/Route';
import IndexRoute from 'react-router/lib/IndexRoute';
import browserHistory from 'react-router/lib/browserHistory';

import MainRouter from './MainRouter';
import WorkspaceRouter from './WorkspaceRouter';
import PathRouter from './PathRouter';
import HomeRouter from './HomeRouter';

function getRoutes(pydio){
    const routes = (
        <Route path="/" component={MainRouter(pydio)}>
            <IndexRoute component={HomeRouter}/>
            <Route path=":workspaceId" component={WorkspaceRouter(pydio)}>
                <IndexRoute component={PathRouter(pydio)}/>
                <Route path="*" component={PathRouter(pydio)}/>
            </Route>
        </Route>
    )
    return routes;
}

class PydioRouter extends React.PureComponent {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            // Routes are defined as a constant to avoid warning about hot reloading
            <Router history={browserHistory} routes={getRoutes(this.props.pydio)} />
        );
    }
}


export default PydioRouter;
