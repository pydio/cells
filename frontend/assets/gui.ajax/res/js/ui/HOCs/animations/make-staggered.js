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
import { StaggeredMotion } from 'react-motion';
import {springify, buildTransform} from './utils';

let counter=0

const DEFAULT_ANIMATION={stiffness: 200, damping: 22, precision: 0.1}

const makeStaggered = (originStyles, targetStyles, animation) => {
    return (Target) => {
        class StaggeredGroup extends React.PureComponent {
            constructor(props) {
                super(props)

                this.state = {
                    styles: this.buildStyles(props)
                }
            }

            componentWillReceiveProps(nextProps) {
                this.setState({
                    styles: this.buildStyles(nextProps)
                });
            }

            buildStyles(props) {
                return React.Children
                    .toArray(props.children)
                    .filter(child => child) // Removing null values
                    .map(child => {
                        return originStyles
                    });
            }

            getStyles(prevStyles) {
                const endValue = React.Children
                    .toArray(this.props.children)
                    .filter(child => child) // Removing null values
                    .map((_, i) => {
                        return !this.props.ready
                            ? originStyles
                            : i === 0
                                ? springify(targetStyles, animation || DEFAULT_ANIMATION)
                                : prevStyles[i - 1]
                                    ? springify(prevStyles[i - 1], animation || DEFAULT_ANIMATION)
                                    : originStyles
                    })

                return endValue;
            }

            render() {
                // Making sure we fliter out properties
                const {ready, ...props} = this.props

                return (
                    <StaggeredMotion
                        defaultStyles={this.state.styles}
                        styles={(styles) => this.getStyles(styles)}
                        >
                        {styles =>
                            <Target {...props}>
                            {React.Children.toArray(props.children).filter(child => child).map((Child, i) => {
                                let style = styles[i] || {}

                                const itemProps = Child.props

                                const transform = buildTransform(style, {
                                    length: 'px', angle: 'deg'
                                });

                                return React.cloneElement(Child, {style: {
                                    ...itemProps.style,
                                    ...style,
                                    transform,
                                    transition: "none"
                                }})
                            })}
                            </Target>
                        }
                    </StaggeredMotion>
                );
            }
        }

        StaggeredGroup.propTypes = {
            ready: PropTypes.bool.isRequired
        }

        StaggeredGroup.defaultProps = {
            ready: true
        }

        return StaggeredGroup
    };
}

export default makeStaggered;
