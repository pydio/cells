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
import { Motion } from 'react-motion';
import {springify, buildTransform} from './utils';

let counter=0

const DEFAULT_ANIMATION={stiffness: 120, damping: 22, precision: 0.01}

const makeMotion = (originStyle, targetStyle, options = {}) => {

    const {check = () => true, style: transformStyle = () => {} } = options

    return (Target) => {
        return class extends React.PureComponent {
            constructor(props) {
                super(props)

                this.state = {
                    ended: false
                }
            }

            render() {

                // Making sure we fliter out properties
                const {...props} = this.props
                const {ended} = this.state

                if (!check(props)) {
                    return <Target {...props} />
                }


                return (
                    <Motion
                        defaultStyle={originStyle}
                        style={springify(targetStyle, DEFAULT_ANIMATION)}
                    >
                        {style => {
                            const transform = buildTransform(style, {
                                length: 'px', angle: 'deg'
                            })

                            return <Target {...props} style={{...props.style, transform, ...transformStyle(props)}} motionEnded={ended} />
                        }}
                    </Motion>
                );
            }
        }
    }
};

export default makeMotion;
