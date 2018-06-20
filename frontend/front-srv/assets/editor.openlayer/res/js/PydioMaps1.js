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

class OLMap extends Component {
    static get propTypes() {
        return {
            centerPoint: React.PropTypes.object,
            centerNode: React.PropTypes.instanceOf(AjxpNode),
            centerSRS: React.PropTypes.string,
            defaultControls: React.PropTypes.bool,

            onMapLoaded:React.PropTypes.func
        }
    }

    static get defaultProps() {
        return {
            centerSRS: 'EPSG:4326',
            defaultControls: true
        }
    }

    attachMap() {

        if (this.state && this.state.map) this.state.map.destroy()

        const {centerPoint, centerNode, centerSRS, onMapLoaded, useDefaultControls} = this.props

        // PARSE METADATA

        let layersDefinitions = [{type:'OSM'}], latitude, longitude;

        if(centerPoint) {
            ({latitude, longitude} = centerPoint)
        } else if (centerNode){
            let meta = centerNode.getMetadata();
            if(meta.has("COMPUTED_GPS-GPS_Latitude") && meta.has("COMPUTED_GPS-GPS_Longitude")) {
                latitude = parseFloat(meta.get("COMPUTED_GPS-GPS_Latitude").split('--').pop());
                longitude = parseFloat(meta.get("COMPUTED_GPS-GPS_Longitude").split('--').pop());
            }
        }

        if(!latitude || !longitude) {
            return typeof onMapLoaded === "function" && onMapLoaded(null, 'Could not find latitude / longitude')
        }

        let meta_center = new OpenLayers.LonLat(longitude, latitude);
        let meta_srs = centerSRS;

        // Check Google layer
        let googleRejected = false;
        let filteredDefinitions = layersDefinitions.filter(({type}) => type === 'Google' && ! (window.google && window.google.maps))

        if (filteredDefinitions !== layersDefinitions) {
            if (filteredDefinitions > 0) {
                meta_srs = 'EPSG:900913';
            } else {
                meta_srs = 'EPSG:4326';
            }
        }

        let options = {
            projection: meta_srs,
            controls: useDefaultControls ? [] : null
        };

        let map = new OpenLayers.Map(this.refs.target, options);
        let layers = [];

        layersDefinitions.map(({type, name, style, tile, wms_url, google_type}) => {
            let layer;

            if (type == 'WMS') {
                layer = new OpenLayers.Layer.WMS(
                    tile ? "Tiled" : "Single Tile",
                    wms_url, {
                        layers: name,
                        styles: style,
                        tiled: tile,
                        tilesOrigin: tile ? map.maxExtent.left + ',' + map.maxExtent.bottom : null
                    },
                    null
                );
            }else if(type == 'OSM') {
                layer = new OpenLayers.Layer.OSM();
            }else if (type == 'Google') {
                switch(google_type) {
                    case 'physical':
                        layer = new OpenLayers.Layer.Google(
                            "Google Physical",
                            {type: window.google.maps.MapTypeId.TERRAIN}
                        );
                        break;

                    case 'streets':
                        layer = new OpenLayers.Layer.Google(
                            "Google Streets", // the default
                            {numZoomLevels: 20}
                        );
                        break;

                    case 'hybrid':
                        layer = new OpenLayers.Layer.Google(
                            "Google Hybrid",
                            {type: global.google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
                        );
                        break;

                    case 'satellite':
                    default:
                        layer = new OpenLayers.Layer.Google(
                            "Google Satellite",
                            {type: global.google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
                        );
                        break;
                }
            }

            if(layer){
                map.addLayer(layer);
                layers.push(layer);
            }
        });

        let projectedCenter = meta_center.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());

        // Add Marker for center!
        const markers = new OpenLayers.Layer.Markers( "Markers" );
        map.addLayer(markers);
        const size = new OpenLayers.Size(22,22);
        const offset = new OpenLayers.Pixel(0, -size.h);
        const icon = new OpenLayers.Icon('plugins/editor.openlayer/res/services.png',size,offset);
        markers.addMarker(new OpenLayers.Marker(projectedCenter,icon));
        try{
            map.setCenter(projectedCenter, 10);
        }catch(e){
            if(console) console.error(e);
        }

        this.setState({
            map,
            layers
        });

        setTimeout(() => map.updateSize(), 300);

        typeof onMapLoaded === "function" && onMapLoaded(map)
    }

    componentDidMount() {
        this.attachMap();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.centerNode !== this.props.centerNode){
            this.attachMap();
        }
    }

    componentWillUnmount() {
        if(this.state && this.state.map){
            this.state.map.destroy();
        }
    }

    render() {

        let style = {
            ...this.props.style,
            width:'100%',
            height:'100%'
        };

        return <div style={style} ref="target"></div>;
    }
}

class Viewer extends React.Component {

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
            <ExtendedOLMap
                ref="mapObject"
                controls={[<ToolbarTitle text={<span ref={(input) => this.input = input} />} />]}
                error={this.state.error}
                centerNode={this.props.node}
                onMapLoaded={(map, error) => this.onMapLoaded(map, error)}
            />
        );
    }
}

const {withMenu, withLoader, withErrors, withControls} = PydioHOCs;

const ExtendedOLMap = compose(
    withMenu,
    withLoader,
    withErrors
)(OLMap)

OpenLayers.ImgPath = 'plugins/editor.openlayer/openlayer/img/'

global.PydioMaps = {
    Viewer: Viewer,
    OLMap: OLMap
};
