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

const WorkspaceRouterWrapper = (pydio) => {

    class WorkspaceRouter extends React.PureComponent {
        _handle({params, location}) {
            // Making sure we redirect to the right workspace based on initial url
            const slug = params.workspaceId.replace("ws-", "")
            const splat = params.splat || ""
            const repositories = pydio.user ? pydio.user.getRepositoriesList() : new Map()
            const active = pydio.user ? pydio.user.getActiveRepository() : null

            if (!pydio.user) {
                let origin = location.pathname || ""
                localStorage.setItem("loginOrigin", origin.replace(new RegExp('starting.html$|maintenance.html$'), ''));
            }

            let switchRepo = false;
            repositories.forEach((repository) => {
                if(repository.slug === slug && active !== repository.getId()) {
                    pydio._initLoadRep = "/" + splat;
                    pydio.triggerRepositoryChange(repository.getId());
                    switchRepo = true;
                }
            })

            if(!switchRepo && location.search && location.search.indexOf('?search=') === 0) {
                const searchNode = pydio.getContextHolder().getSearchNode();
                try {
                    const s = location.search;
                    const values = JSON.parse(decodeURIComponent(s.replace('?search=', '')));
                    searchNode.getMetadata().set('popped_values', values);
                } catch(e) {}
                pydio.getContextHolder().setContextNode(pydio.getContextHolder().getSearchNode());
            }

        }

        componentWillMount() {
            this._handle(this.props)
        }

        componentWillReceiveProps(nextProps) {
            this._handle(nextProps)
        }

        render() {
            return (
                <div>
                    {this.props.children}
                </div>
            );
        }
    };

    return WorkspaceRouter;
}

export default WorkspaceRouterWrapper
