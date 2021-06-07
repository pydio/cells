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
import PropTypes from 'prop-types'
import Media from './Media';

class Player extends React.Component {

    static get styles() {
        return {
            container: {
                position: "relative",
                display: "flex",
                flex: 1,
                padding: 0,
                margin: 0,
                overflow:'hidden',
                backgroundColor:'#424242'
            }
        }
    }

    onReady() {
        typeof this.props.onReady ==='function' && this.props.onReady()
    }

    render() {
        let options = {
            preload: 'auto',
            autoplay: false,
            controls: true,
            techOrder: ["html5"]
        }

        return (
            <div style={Player.styles.container}>
                <Media options={options} src={this.props.url} resize={true} onReady={() => this.onReady}></Media>
            </div>
        )
    }
}

Player.propTypes = {
    url: PropTypes.string.isRequired,

    onReady: PropTypes.func
}

export default Player;
