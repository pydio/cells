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
import { Motion, spring, presets } from 'react-motion';

const ANIMATION={stifness: 500, damping: 20}
const ORIGIN = -720
const TARGET = 0

const makeRotate = (Target) => {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                rotate: false
            };
        }

        componentWillReceiveProps(nextProps) {
            this.setState({
                rotate: nextProps.open
            })
        }

        render() {
            const style = {
                rotate: this.state.rotate ? ORIGIN : TARGET
            };
            return (
                <Motion style={style}>
                    {({rotate}) => {
                        let rotated = rotate === ORIGIN

                        return (
                            <Target
                                {...this.props}
                                rotated={rotated}
                                style={{
                                    ...this.props.style,
                                    transform: `${this.props.style.transform} rotate(${rotate}deg)`
                                }}
                            />
                        )
                    }}
                </Motion>
            );
        }
    }
};

export default makeRotate;
