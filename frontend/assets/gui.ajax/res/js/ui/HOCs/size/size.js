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
import {connect} from 'react-redux';
import {mapStateToProps} from './utils';
import {withContainerSize, withImageSize} from './providers';
import {EditorActions, getDisplayName, getRatio} from '../utils';

export const withResize = (Component) => {
    return @withImageSize
    @withContainerSize
    @connect(mapStateToProps)
    // @panAndZoomHoc
    class ComponentWithResize extends React.Component {
        static get displayName() {
            return `WithResize(${getDisplayName(Component)})`
        }

        static get propTypes() {
            return {
                size: PropTypes.oneOf(["contain", "cover", "auto"]).isRequired,
                containerWidth: PropTypes.number.isRequired,
                containerHeight: PropTypes.number.isRequired,
                width: PropTypes.number.isRequired,
                height: PropTypes.number.isRequired
            };
        }

        componentDidMount() {
            this.loadSize(this.props)
        }

        componentWillReceiveProps(nextProps) {
            const {src, scale, size, containerWidth, width, containerHeight, height} = nextProps

            if (
                src !== this.props.src ||
                size !== this.props.size ||
                width !== this.props.width ||
                height !== this.props.height ||
                containerWidth !== this.props.containerWidth ||
                containerHeight !== this.props.containerHeight
            ) {
                this.loadSize(nextProps)
            }
        }

        loadSize(props) {
            const {scale = 1, size = "contain", dispatch, containerWidth, width, containerHeight, height} = props

            const state = {
                size,
                scale: getRatio[size]({
                    scale,
                    widthRatio: containerWidth / width,
                    heightRatio: containerHeight / height
                })
            }

            dispatch(EditorActions.editorModify(state))
        }

        render() {
            const {scale, dispatch, ...remainingProps} = this.props

            return (
                <Component
                    {...remainingProps}
                    scale={scale}
                />
            )
        }
    };
}
