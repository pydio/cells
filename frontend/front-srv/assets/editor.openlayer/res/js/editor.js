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



import React, {Component} from 'react'
import {compose} from 'redux'
import {ToolbarTitle} from 'material-ui'
import Map from './map'

export default class Editor extends React.Component {

    constructor(props) {
        super(props)

        this.state = {}
    }

    onMapLoaded(map, error = null) {
        if(error){
            this.setState({error: error});
        }else{
            map.addControl(new OpenLayers.Control.PanZoomBar({
                position: new OpenLayers.Pixel(5, 5)
            }));
            map.addControl(new OpenLayers.Control.Navigation());
            map.addControl(new OpenLayers.Control.ScaleLine());
            map.addControl(new OpenLayers.Control.MousePosition({element: this.input, numDigits:4, prefix: `${MessageHash['openlayer.3']}: `}));
        }
    }

    render() {
        return (
            <Map
                ref="mapObject"
                style={this.props.style}
                //controls={[<ToolbarTitle text={<span ref={(input) => this.input = input} />} />]}
                error={this.state.error}
                centerNode={this.props.node}
                onMapLoaded={(map, error) => this.onMapLoaded(map, error)}
            />
        );
    }
}
