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
import { Motion, spring} from 'react-motion';

const {Utils} = Pydio.requireLib('hoc')
const {getDisplayName} = Utils;

const ANIMATION={stiffness: 400, damping: 30}
const TARGET=100

const makeMaximise = (Target) => {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {maximised: props.maximised};
        }

        componentWillReceiveProps(nextProps) {
            this.setState({
                maximised: nextProps.maximised
            })
        }

        static get displayName() {
            return `MakeMaximise(${getDisplayName(Target)})`
        }

        render() {
            const {style = {}} = this.props
            const {width = "0", height = "0"} = style

            const {maximised} = this.state
            const motionStyle = {
                width: maximised ? spring(TARGET, ANIMATION) : spring(parseInt(width.replace(/%$/, '')), ANIMATION),
                height: maximised ? spring(TARGET, ANIMATION) : spring(parseInt(height.replace(/%$/, '')), ANIMATION)
            };

            return (
                <Motion style={motionStyle}>
                    {({width, height}) => {
                        return (
                            <Target
                                {...this.props}
                                style={{
                                    ...style,
                                    width: `${width}%`,
                                    height: `${height}%`,
                                    transition: "none"
                                }}
                            />
                        )
                    }}
                </Motion>
            );
        }
    }
};

export default makeMaximise;
