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

import browserHistory from 'react-router/lib/browserHistory';

const MainRouterWrapper = (pydio) => {
    class MainRouter extends React.PureComponent {

        constructor(props) {
            super(props)

            this.state = this.getState()

            this._ctxObs = (e) => {
                this.setState(this.getState())
            }
        }

        getState() {
            const list =  pydio.user ? pydio.user.getRepositoriesList() : new Map()
            const active = pydio.user ? pydio.user.getActiveRepository() : ""
            const path = pydio.user ? pydio.getContextNode().getPath() : ""
            const uri = this.getURI({list, active, path})

            return {
                uri
            }
        }

        getURI({list, active, path}) {
            const repo = list.get(active);
            const slug = repo ? repo.getSlug() : "";
            const reserved = ['homepage', 'settings'];
            const prefix = repo && reserved.indexOf(repo.getAccessType()) === -1 ? "ws-" : "";

            return `/${prefix}${slug}${path}`
        }

        componentDidMount() {
            pydio.getContextHolder().observe("context_changed", this._ctxObs);
            pydio.getContextHolder().observe("repository_list_refreshed", this._ctxObs);
        }

        componentWillUnmount() {
            pydio.getContextHolder().stopObserving("context_changed", this._ctxObs);
            pydio.getContextHolder().stopObserving("repository_list_refreshed", this._ctxObs);
        }

        render() {
            const {uri} = this.state

            if (pydio.user && uri !== this.props.location.pathname) {
                browserHistory.replace(uri)
            }

            return (
                <div>
                    {this.props.children}
                </div>
            );
        }
    };

    return MainRouter;
};

export {MainRouterWrapper as default}
