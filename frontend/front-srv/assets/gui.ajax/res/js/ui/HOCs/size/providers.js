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
import {CircularProgress} from 'material-ui';
import ContainerDimensions from 'react-container-dimensions';
import { getDisplayName, getBoundingRect } from '../utils';
import _ from 'lodash';

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
            const {containerWidth, containerHeight} = this.state;

            return (
                <ContainerDimensions>
                    { ({ width, height }) => <Component containerWidth={width} containerHeight={height} {...this.props} /> }
                </ContainerDimensions>
            )
        }
    }
}

export const withImageSize = (Component) => {
    return class extends React.PureComponent {
        static get propTypes() {
            return {
                url: React.PropTypes.string.isRequired,
                node: React.PropTypes.instanceOf(AjxpNode).isRequired,
                children: React.PropTypes.func.isRequired
            }
        }

        constructor(props) {
            super(props)

            const {node} = this.props
            const meta = node.getMetadata()

            this.state = {
                imgWidth: meta.has('image_width') && parseInt(meta.get('image_width')) || 200,
                imgHeight: meta.has('image_height') && parseInt(meta.get('image_height')) || 200
            }

            this.updateSize = (imgWidth, imgHeight) => this.setState({imgWidth, imgHeight})
            this.getImageSize = _.throttle(DOMUtils.imageLoader, 100)
        }

        static get displayName() {
            return `WithImageResize(${getDisplayName(Component)})`
        }

        componentWillReceiveProps(nextProps) {
            const {url, node} = nextProps
            const meta = node.getMetadata()

            const update = this.updateSize

            this.getImageSize(url, function() {
                if (!meta.has('image_width')){
                    meta.set("image_width", this.width);
                    meta.set("image_height", this.height);
                }

                update(this.width, this.height)
            }, function() {
                if (meta.has('image_width')) {
                    update(meta.get('image_width'), meta.get('image_height'))
                }
            })
        }

        componentDidMount() {
            const test = ReactDOM.findDOMNode(this)
        }

        render() {
            return (
                <Component imgWidth={width} imgHeight={height} {...this.props} />
            )
        }
    }
}
