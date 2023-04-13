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
import { TransitionMotion, spring, presets } from 'react-motion';

// const ANIMATION={stiffness: 200, damping: 22, precision: 1}
const ANIMATION={stiffness: 150, damping: 15, precision: 1}
const TRANSLATEY_ORIGIN=800
const TRANSLATEY_TARGET=0

const makeEditorOpen = (Target) => {
    return class extends React.Component {
        getStyle() {
            return {
                y: spring(TRANSLATEY_TARGET, ANIMATION)
            }
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
                    styles={this.getStyle()}
                    willLeave={this.willLeave}
                    willEnter={this.willEnter}
                >
                    {({y}) =>
                        <Target {...this.props} style={{
                            ...this.props.style,
                            transform: `${transform} translateY(${y}px)`
                        }} />
                    }
                </TransitionMotion>
            );
        }
    }
};

export default makeEditorOpen;
