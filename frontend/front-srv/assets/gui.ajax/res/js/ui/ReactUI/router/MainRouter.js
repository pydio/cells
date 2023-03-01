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

import _ from 'lodash';
import browserHistory from 'react-router/lib/browserHistory';

const MainRouterWrapper = (pydio) => {
    class MainRouter extends React.PureComponent {
        componentDidMount() {
            this.ctxObs = _.debounce(() => this.reset(), 1000, {'leading': true, 'trailing': false})

            pydio.getContextHolder().observe("context_changed", this.ctxObs);
            pydio.getContextHolder().observe("repository_list_refreshed", this.ctxObs);
            pydio.observeOnce('user_logged', () => {
                if(localStorage.getItem('loginOrigin')) {
                    browserHistory.replace(localStorage.getItem('loginOrigin'));
                    localStorage.removeItem('loginOrigin');
                }
            })
        }

        componentWillUnmount() {
            pydio.getContextHolder().stopObserving("context_changed", this.ctxObs);
            pydio.getContextHolder().stopObserving("repository_list_refreshed", this.ctxObs);
        }

        reset() {
            const list =  pydio.user ? pydio.user.getRepositoriesList() : new Map()
            const active = pydio.user ? pydio.user.getActiveRepository() : ""
            const path = pydio.user ? pydio.getContextNode().getPath() : ""
            const searchNode = pydio.getContextHolder().getSearchNode();
            const repo = list.get(active);
            const slug = repo ? repo.getSlug() : "";
            const reserved = ['homepage', 'settings'];
            const prefix = repo && reserved.indexOf(repo.getAccessType()) === -1 ? "ws-" : "";
            let uri = `/${prefix}${slug}${path.replace('%', '%25').replace('#','%23')}`;
            if(pydio.user && pydio.getContextNode() === searchNode && searchNode.getMetadata().get('search_values')) {
                const values = encodeURIComponent(JSON.stringify(searchNode.getMetadata().get('search_values')));
                uri += `?search=${values}`
            }

            if (this.props.location.action === 'POP') {
                browserHistory.replace(uri)
            } else {
                browserHistory.push(uri)
            }
        }

        startObservers() {
            pydio.getContextHolder().observe("context_changed", this.ctxObs);
            pydio.getContextHolder().observe("repository_list_refreshed", this.ctxObs);
        }

        stopObservers() {
            pydio.getContextHolder().stopObserving("context_changed", this.ctxObs);
            pydio.getContextHolder().stopObserving("repository_list_refreshed", this.ctxObs);
        }

        render() {
            return (
                <div>
                    {this.props.children}
                </div>
            )
        }
    }

    return MainRouter
}

export default MainRouterWrapper