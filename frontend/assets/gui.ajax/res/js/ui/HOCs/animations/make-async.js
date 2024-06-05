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

let counter=0

const makeAsync = (WrappedComponent) => {
    return class AsyncGroup extends React.PureComponent {
        constructor(props) {
            super(props)

            this.state = {
                ...this.buildPromises(props)
            }
        }

        componentDidMount() {
            this.waitAndSee()
        }

        waitAndSee() {
            Promise.all(this.state.promises).then((values) => this.setState({ready: true}))
        }

        buildPromises(props) {
            let onloads = []
            let promises = React.Children
                .toArray(props.children)
                .filter(child => child)
                .map(child => new Promise((resolve, reject) => {
                    if (typeof child.props.onLoad !== "function") return resolve()

                    let timeout = setTimeout(resolve, 3000);

                    onloads.push(() => {
                        window.clearTimeout(timeout)

                        child.props.onLoad()

                        setTimeout(resolve, 1000)
                    })
                }));

            return {
                promises,
                onloads,
                ready: false
            }
        }

        render() {
            const {...props} = this.props

            //console.log("Make Async", this.state.ready)
             //, {onLoad: this.state.onloads[i]}))}

            return (
                <WrappedComponent {...props} ready={this.state.ready}>
                    {React.Children.toArray(props.children).filter(child => child).map((Child, i) => React.cloneElement(Child, {onLoad: () => {}}))}
                </WrappedComponent>
            );
        }
    }
};

export default makeAsync;
