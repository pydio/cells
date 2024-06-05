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
import { TransitionMotion } from 'react-motion';
import {springify, buildTransform} from './utils';

let counter=0

const DEFAULT_ANIMATION={stiffness: 200, damping: 22, precision: 0.1}

const makeTransition = (originStyles, targetStyles, enter, leave) => {
    return (Target) => {
        class TransitionGroup extends React.PureComponent {

            constructor(props) {
                super(props);
                this.state = {
                    items: []
                };
            }

            componentDidMount() {
                this.setState({
                    items: [{key: 'a', style: springify(targetStyles, DEFAULT_ANIMATION)}]
                })
            }

            componentWillUnmount() {
                this.setState({
                    items: []
                })
            }

            willEnter(transitionStyle) {
                return {
                    ...originStyles
                };
            }

            willLeave(transitionStyle) {
                return springify(originStyles, DEFAULT_ANIMATION)
            }

            render() {

                // Making sure we fliter out properties
                const {ready, ...props} = this.props

                return (
                    <TransitionMotion
                        styles={this.state.items}
                        willLeave={this.willLeave.bind(this)}
                        willEnter={this.willEnter.bind(this)}
                        >
                        {styles => {
                            if (styles.length == 0) {
                                return null
                            }

                            const style = styles[0].style
                            const finished = Object.keys(style).reduce((current, key) => current && style[key] == targetStyles[key], true)

                            const transform = buildTransform(style, {
                                length: 'px', angle: 'deg'
                            })

                            return <Target {...props} style={{...props.style, transform, transition: 'none'}} transitionEnded={true} />
                        }}
                    </TransitionMotion>
                );
            }
        }

        TransitionGroup.propTypes = {
            ready: PropTypes.bool.isRequired
        }

        TransitionGroup.defaultProps = {
            ready: true
        }

        return TransitionGroup
    };
};

export default makeTransition;
