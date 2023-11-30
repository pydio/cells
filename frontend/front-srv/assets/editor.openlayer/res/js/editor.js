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
import Pydio from 'pydio'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import OpenLayerMap from "./OpenLayerMap";
const {EditorActions} = Pydio.requireLib('hoc')

@connect(null, EditorActions)
export default class Editor extends Component {

    constructor(props) {
        super(props)

        this.state = {}
    }

    componentDidMount() {
        const {editorModify} = this.props;
        if (this.props.isActive) {
            editorModify({fixedToolbar: false})
        }
    }

    componentWillReceiveProps(nextProps) {
        const {editorModify} = this.props;
        if (nextProps.isActive) {
            editorModify({fixedToolbar: false})
        }
    }

    onMapLoaded(map, error = null) {
        if(error){
            this.setState({error: error});
        }else{
            /*
            map.addControl(new OpenLayers.Control.PanZoomBar({
                position: new OpenLayers.Pixel(5, 5)
            }));
            map.addControl(new OpenLayers.Control.Navigation());
            map.addControl(new OpenLayers.Control.ScaleLine());
            map.addControl(new OpenLayers.Control.MousePosition({element: this.input, numDigits:4, prefix: `${MessageHash['openlayer.3']}: `}));

             */
        }
    }

    render() {
        const {error} = this.state;
        const {style, node} = this.props;

        if(error) {
            const cont = {
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1
            };
            return (
                <div style={cont}>
                    <div style={{margin:'auto', color:'white'}}>{error}</div>
                </div>
            );
        } else {
            return <OpenLayerMap style={style} features={[]} centerNode={node}/>
            /*
            return (
                <Map
                    ref="mapObject"
                    style={style}
                    centerNode={node}
                    onMapLoaded={(map, error) => this.onMapLoaded(map, error)}
                />
            );

             */
        }
    }
}
