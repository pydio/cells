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

import { TransitionMotion, spring, presets } from 'react-motion';

const ANIMATION={stiffness: 200, damping: 22, precision: 1}
const TRANSLATEY_ORIGIN=800
const TRANSLATEY_TARGET=0

const makeEditorOpen = (Target) => {
    return class extends React.Component {
        getStyles() {
            if (!this.props.children) return []

            let counter = 0;

            return React.Children
                .toArray(this.props.children)
                .filter(child => child) // Removing null values
                .map(child => {
                    return {
                        key: `t${counter++}`,
                        data: {element: child},
                        style: {
                            y: spring(TRANSLATEY_TARGET * counter, ANIMATION)
                        }
                    }
                });
        }

        willEnter() {
            return {
                y: TRANSLATEY_ORIGIN
            };
        }

        willLeave() {
            return {
                y: TRANSLATEY_ORIGIN
            }
        }

        render() {
            return (
                <TransitionMotion
                    styles={this.getStyles()}
                    willLeave={this.willLeave}
                    willEnter={this.willEnter}
                    >
                    {styles =>
                        <Target {...this.props}>
                        {styles.map(({key, style, data}) => {
                            // During the transition, we handle the style
                            if (style.y !== TRANSLATEY_TARGET) {

                                // Retrieve previous transform
                                const transform = data.element.props.style.transform || ""

                                return React.cloneElement(data.element, {
                                    key: key,
                                    translated: false,
                                    style: {
                                        ...data.element.props.style,
                                        transition: "none",
                                        transformOrigin: "none",
                                        transform: `${transform} translateY(${style.y}px)`
                                    }
                                })
                            }

                            return React.cloneElement(data.element, {
                                key: key,
                                translated: true
                            })
                        })}
                        </Target>
                    }
                </TransitionMotion>
            );
        }
    }
};

export default makeEditorOpen;
