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
import { StaggeredMotion, spring, presets } from 'react-motion';

//Constants

const NUM_CHILDREN=1
// How far away from the main button does the child buttons go
const FLY_OUT_RADIUS = 80,
  SEPARATION_ANGLE = 40, //degrees
  FAN_ANGLE = (NUM_CHILDREN - 1) * SEPARATION_ANGLE, //degrees
  BASE_ANGLE = ((180 - FAN_ANGLE) / 2); // degrees

// Utility functions
function toRadians(degrees) {
    return degrees * (Math.PI / 180)
}

function finalChildDeltaPositions(index) {
    let angle = BASE_ANGLE + (index * SEPARATION_ANGLE);
    return {
        deltaX: FLY_OUT_RADIUS * Math.cos(toRadians(angle)),
        deltaY: FLY_OUT_RADIUS * Math.sin(toRadians(angle))
    };
}

const makeMenuAnimate = (Target) => {

    return class extends React.Component {

        constructor(props) {
            super(props)
            this.state = {open: false}
        }

        componentWillReceiveProps(nextProps) {
            this.setState({
                open: nextProps.open
            })
        }

        openingStartStyle() {
            return {
                top: 0,
                left: 0,
                rotate: -180
            };
        }

        openingEndStyle(index) {
            let { deltaX, deltaY } = finalChildDeltaPositions(index);
            return {
                top: spring(0 - deltaY, presets.gentle),
                left: spring(0 + deltaX, presets.gentle),
                rotate: spring(0, presets.gentle)
            };
        }

        closingStartStyle(index) {
            let { deltaX, deltaY } = finalChildDeltaPositions(index);
            return {
                top: 0 - deltaY,
                left: 0 + deltaX,
                rotate: 0
            };
        }

        closingEndStyle() {
            return {
                top: spring(0, presets.gentle),
                left: spring(0, presets.gentle),
                rotate: spring(-180, presets.gentle)
            };
        }

        render() {
            let { open } = this.state;

            let defaultStyles = React.Children.map(this.props.children, (child, i) => {
                return open ? this.openingStartStyle() : this.closingStartStyle(i)
            });

            // StaggeredMotion now takes an Array of object
            defaultStyles = Object.keys(defaultStyles).map(key => defaultStyles[key]);

            const targetStyles = React.Children.map(this.props.children, (child, i) => {
                return open ? this.openingEndStyle(i) : this.closingEndStyle()
            });

            let styles = prevFrameStyles => prevFrameStyles.map((_, i) => {
                return targetStyles[i]
            });

            return (
                <Target style={this.props.style}>
                    <StaggeredMotion defaultStyles={defaultStyles} styles={styles}>
                        {buttons => (
                            <div>
                                {buttons.map(({left, rotate, top}, i) => {
                                    let style = {
                                        position: i === 0 ? "relative" : "absolute",
                                        left,
                                        top
                                    }

                                    return <div key={i} style={style}>{this.props.children[i]}</div>
                                })}
                            </div>
        				)}
                    </StaggeredMotion>
                </Target>
            );
        }
    }
}

export default makeMenuAnimate;
