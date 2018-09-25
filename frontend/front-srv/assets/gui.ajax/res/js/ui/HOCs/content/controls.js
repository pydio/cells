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

import { connect } from 'react-redux';
import { mapStateToProps } from './utils';
import { handler } from '../utils';

export const withContentEditionControls = (check) => {
    return (Component) => {
        return (
            @connect(mapStateToProps)
            class ContentControls extends React.Component {
                render() {
                    if (!check(this.props)) {
                        return (
                            <Component
                                {...this.props}
                            />
                        )
                    }

                    const fnSave = handler("onSave", this.props)
                    const fnUndo = handler("onUndo", this.props)
                    const fnRedo = handler("onRedo", this.props)
                    const fnToggleLineNumbers = handler("onToggleLineNumbers", this.props)
                    const fnToggleLineWrapping = handler("onToggleLineWrapping", this.props)

                    return (
                        <Component
                            onContentSave={() => fnSave()}
                            onContentUndo={() => fnUndo()}
                            onContentRedo={() => fnRedo()}
                            onContentToggleLineNumbers={() => fnToggleLineNumbers()}
                            onContentToggleLineWrapping={() => fnToggleLineWrapping()}
                            {...this.props}
                        />
                    )
                }
            }
        )
    }
}

export const withContentSearchControls = (check) => {
    return (Component) => {
        return (
            @connect(mapStateToProps)
            class ContentControls extends React.Component {
                render() {
                    if (!check(this.props)) {
                        return (
                            <Component
                                {...this.props}
                            />
                        )
                    }

                    const fnSearch = handler("onSearch", this.props)
                    const fnJumpTo = handler("onJumpTo", this.props)

                    return (
                        <Component
                            onContentSearch={(value) => fnSearch(value)}
                            onContentJumpTo={(value) => fnJumpTo(value)}
                            {...this.props}
                        />
                    )
                }
            }
        )
    }
}
