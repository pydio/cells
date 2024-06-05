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
import PropTypes from 'prop-types'

OpenLayers.ImgPath = 'plug/editor.openlayer/openlayer/img/'

export default class OLMap extends React.Component {
    static get propTypes() {
        return {
            centerPoint: PropTypes.object,
            centerNode: PropTypes.instanceOf(AjxpNode),
            centerSRS: PropTypes.string,
            defaultControls: PropTypes.bool,

            onMapLoaded:PropTypes.func
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
            if(meta.has("GeoLocation")) {
                latitude = parseFloat(meta.get('GeoLocation')['lat']);
                longitude = parseFloat(meta.get('GeoLocation')['lon']);
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

            if (type === 'WMS') {
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
            }else if(type === 'OSM') {
                layer = new OpenLayers.Layer.OSM();
            }else if (type === 'Google') {
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
        const icon = new OpenLayers.Icon('plug/editor.openlayer/res/services.png',size,offset);
        markers.addMarker(new OpenLayers.Marker(projectedCenter,icon));
        try{
            map.setCenter(projectedCenter, 10);
        }catch(e){
            if(console) {
                console.error(e);
            }
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
            width:'100%',
            height:'100%',
            ...this.props.style
        };

        return <div style={style} ref="target"></div>;
    }
}
