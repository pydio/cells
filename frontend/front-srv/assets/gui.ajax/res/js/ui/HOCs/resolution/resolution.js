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

import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import { EditorActions, getDisplayName } from '../utils';
import { ResolutionURLProvider } from './';
import { mapStateToProps } from './utils';

const withResolution = (sizes, highResolution, lowResolution) => {
    return (Component) => {
        class WithResolution extends React.Component {
            static get displayName() {
                return `WithResolution(${getDisplayName(Component)})`
            }

            static get propTypes() {
                return {
                    node: PropTypes.instanceOf(AjxpNode).isRequired
                };
            }

            onHi() {
                const {tab} = this.props

                return highResolution(tab.node)
            }

            onLo() {
                const {tab} = this.props
                const viewportRef = (DOMUtils.getViewportHeight() + DOMUtils.getViewportWidth()) / 2;

                const thumbLimit = sizes.reduce((current, size) => {
                    return viewportRef > parseInt(size) && parseInt(size) || current
                }, 0);

                if (thumbLimit > 0) {
                    return lowResolution(tab.node, thumbLimit)
                }

                return highResolution(tab.node)
            }

            render() {
                const {resolution, ...remainingProps} = this.props

                return (
                    <ResolutionURLProvider
                        urlType={resolution}
                        onHi={() => this.onHi()}
                        onLo={() => this.onLo()}
                    >
                        {src =>
                            <Component
                                {...remainingProps}
                                src={src}
                            />
                        }
                    </ResolutionURLProvider>
                )
            }
        }

        return connect(mapStateToProps)(WithResolution)
    };
}

export {withResolution as default}
