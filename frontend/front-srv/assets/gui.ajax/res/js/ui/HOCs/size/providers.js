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

import React from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import ContainerDimensions from 'react-container-dimensions';
import {getBoundingRect, getDisplayName} from '../utils';

export class ContainerSizeProvider extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {}

        this._observer = (e) => this.resize();
    }

    resize() {
        const node = ReactDOM.findDOMNode(this)
        const dimensions = node && getBoundingRect(node) || {}

        this.setState({
            containerWidth: parseInt(dimensions.width),
            containerHeight: parseInt(dimensions.height)
        })
    }

    componentDidMount() {
        DOMUtils.observeWindowResize(this._observer);

        this.resize()
    }

    componentWillUnmount() {
        DOMUtils.stopObservingWindowResize(this._observer);
    }

    render() {
        return this.props.children(this.state)
    }
}

export const withContainerSize = (Component) => {
    return class extends React.PureComponent {
        constructor(props) {
            super(props)

            this.state = {}

            this._observer = (e) => this.resize();
        }

        static get displayName() {
            return `WithContainerResize(${getDisplayName(Component)})`
        }

        resize() {
            const node = ReactDOM.findDOMNode(this)
            const dimensions = node && getBoundingRect(node) || {}

            this.setState({
                top: parseInt(dimensions.top),
                bottom: parseInt(dimensions.bottom),
                left: parseInt(dimensions.left),
                right: parseInt(dimensions.right),
                width: parseInt(dimensions.width),
                height: parseInt(dimensions.height),
                documentWidth: document.documentElement.clientWidth,
                documentHeight: document.documentElement.clientHeight,
            })
        }

        componentDidMount() {
            DOMUtils.observeWindowResize(this._observer);

            this.resize()
        }

        componentWillReceiveProps() {
            this.resize()
        }

        componentWillUnmount() {
            DOMUtils.stopObservingWindowResize(this._observer);
        }

        render() {
            const {top, bottom, left, right, width, height, documentWidth, documentHeight} = this.state;

            return (
                <ContainerDimensions>
                    { ({ top: containerTop, bottom: containerBottom, left: containerLeft, right: containerRight, width: containerWidth, height: containerHeight }) => (
                        <Component
                            documentWidth={documentWidth}
                            documentHeight={documentHeight}
                            containerTop={containerTop}
                            containerBottom={containerBottom}
                            containerLeft={containerLeft}
                            containerRight={containerRight}
                            containerWidth={containerWidth}
                            containerHeight={containerHeight}
                            top={top}
                            bottom={bottom}
                            left={left}
                            right={right}
                            width={width}
                            height={height}
                            {...this.props}
                        />
                    )}
                </ContainerDimensions>
            )
        }
    }
}

export const withImageSize = (Component) => {
    return class extends React.PureComponent {
        static get propTypes() {
            return {
                src: PropTypes.string.isRequired,
                node: PropTypes.instanceOf(AjxpNode).isRequired,
                children: PropTypes.func.isRequired
            };
        }

        constructor(props) {
            super(props)

            const {node} = this.props
            const meta = node.getMetadata()
            const width = meta.has('image_width') && parseInt(meta.get('image_width')) || 200
            const height = meta.has('image_height') && parseInt(meta.get('image_height')) || 200 

            this.state = {
                imgWidth: width,
                imgHeight: height
            }

            this.updateSize = (imgWidth, imgHeight) => this.setState({imgWidth, imgHeight})
        }

        static get displayName() {
            return `WithImageResize(${getDisplayName(Component)})`
        }

        reset() {
            const {node} = this.props
            const meta = node.getMetadata()
            const update = this.updateSize

            if (!meta.has('image_width')) {
                DOMUtils.imageLoader(this.props.src, function() {
                    update(this.width, this.height)
                }, function () {
                })
                
                return
            }
            
            const width = meta.has('image_width') && parseInt(meta.get('image_width')) || 200
            const height = meta.has('image_height') && parseInt(meta.get('image_height')) || 200

            update(width, height)
        }

        componentDidMount() {
            this.reset()
        }

        componentDidUpdate() {
            this.reset()
        }

        render() {
            const {imgWidth, imgHeight} = this.state
            return (
                <Component width={imgWidth} height={imgHeight} {...this.props} />
            )
        }
    };
}
