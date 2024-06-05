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
import React from 'react'
import { TransitionMotion, spring } from 'react-motion';

const OPACITY_ORIGIN=0
const OPACITY_TARGET=1
const TRANSLATEY_ORIGIN=0
const TRANSLATEY_TARGET=70
const ANIMATION={stifness: 500, damping: 20}

const makeMenuTransition = (Target) => {
    return class extends React.Component {
        getStyles() {
            if (!this.props.children) return []

            let counter = 0
            return React.Children.map(
                this.props.children,
                child => ({
                    key: `t${counter++}`,
                    data: {element: child},
                    style: {
                        opacity: spring(OPACITY_TARGET, ANIMATION),
                        y: spring(TRANSLATEY_TARGET * counter, ANIMATION)
                    }
                }));
        }

        willEnter() {
            return {
                opacity: OPACITY_ORIGIN,
                y: TRANSLATEY_ORIGIN
            };
        }

        willLeave() {
            return {
                opacity: spring(OPACITY_ORIGIN, ANIMATION),
                y: spring(TRANSLATEY_ORIGIN, ANIMATION)
            }
        }

        render() {
            return (
                <TransitionMotion
                    styles={this.getStyles()}
                    willLeave={this.willLeave}
                    willEnter={this.willEnter}>
                    {styles =>
                        <Target {...this.props}>
                        {styles.map(({key, style, data}) => {
                            let loaded = style.opacity === 1 || style.opacity === 0

                            let childStyle = {
                                position: "absolute",
                                opacity: style.opacity,
                                transition: "none",
                                transform: `translate3d(-50%, -50%, 0) translateY(-${style.y}px)`
                            }

                            let child = React.cloneElement(data.element, {key: key, loaded: loaded, style: childStyle})

                            return child
                        })}
                        </Target>
                    }
                </TransitionMotion>
            );
        }
    }
};

export default makeMenuTransition;
