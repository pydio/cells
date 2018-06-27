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

const Loadingbar = (style) => {
    return <PydioReactUI.Loader style={{...style, position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 0}}/>
}

const loader = (Component) => {
    class Loader extends React.Component {
        constructor(props) {
            super(props)

            this.state = {loading: true}

            this.onLoad = (...args) => {

                this.setState({loading: false})

                if (typeof props.onLoad === 'function') {
                    props.onLoad(...args)
                    this.cancelAutomaticLoad()
                }
            }
        }

        automaticLoad() {
            // Making sure the loader disappears after a while
            this.timeout = window.setTimeout(this.onLoad, 100)
        }

        cancelAutomaticLoad() {
            window.clearTimeout(this.timeout)
            this.timeout = null
        }

        componentDidMount() {
            this.automaticLoad()
        }

        componentWillUnmount() {
            this.cancelAutomaticLoad()
        }

        render() {
            const {loading} = this.state
            const {noLoader, onLoad, loaderStyle, ...remainingProps} = this.props

            if (noLoader) {
                return <Component {...remainingProps} onLoad={this.onLoad} />
            }

            let style = loading ? {position:"relative", zIndex: "-1", top: "-3000px"} : {}

            if (loading) {
                return <Loadingbar style={{...style, ...loaderStyle}} />
            }

            return (
                <Component {...remainingProps} onLoad={this.onLoad} />
            )
        }
    }

    Loader.propTypes = {
        noLoader: React.PropTypes.bool,
        onLoad: React.PropTypes.func,
        loaderStyle: React.PropTypes.object
    }

    return Loader;
}

export {loader as default}
