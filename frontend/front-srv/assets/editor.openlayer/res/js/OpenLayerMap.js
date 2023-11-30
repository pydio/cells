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

// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import Feature from 'ol/Feature'
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import {transform, useGeographic} from 'ol/proj'
import Point from 'ol/geom/Point'
import {toStringXY} from 'ol/coordinate';

function OpenLayerMap({centerNode, onMapLoaded, style, features = []}) {

    // set intial state
    const [ map, setMap ] = useState()
    const [ selectedCoord , setSelectedCoord ] = useState()

    // pull refs
    const mapElement = useRef()

    // create state ref that can be accessed in OpenLayers onclick callback function
    //  https://stackoverflow.com/a/60643670
    const mapRef = useRef()
    mapRef.current = map

    let latitude,longitude;

    if (centerNode){
        let meta = centerNode.getMetadata();
        if(meta.has("GeoLocation")) {
            latitude = parseFloat(meta.get('GeoLocation')['lat']);
            longitude = parseFloat(meta.get('GeoLocation')['lon']);
        }
    }

    if(!latitude || !longitude) {
        if(typeof onMapLoaded === "function") {
            onMapLoaded(null, 'Could not find latitude / longitude')
        }
        return null;

    }

    // initialize map on first render - logic formerly put into componentDidMount
    useEffect( () => {

        useGeographic();
        const place = [longitude, latitude];
        const point = new Point(place)

        // create map
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),

                /*
                // USGS Topo
                new TileLayer({
                    source: new XYZ({
                        url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
                    })
                }),
                // Google Maps Terrain
                new TileLayer({
                  source: new XYZ({
                    url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
                  })
                }), */

                //initalFeaturesLayer
                new VectorLayer({
                    source: new VectorSource({
                        features: [new Feature(point)],
                    }),
                    style: {
                        'circle-radius': 5,
                        'circle-fill-color': 'red',
                    },
                }),
            ],
            view: new View({
                //projection: 'EPSG:3857',
                center: place,
                zoom: 15
            }),
            controls: []
        })

        // set map onclick handler
        initialMap.on('click', handleMapClick)

        // save map and vector layer references to state
        setMap(initialMap)

    },[])


    // map click handler
    const handleMapClick = (event) => {

        // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
        //  https://stackoverflow.com/a/60643670
        const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

        // transform coord to EPSG 4326 standard Lat Long
        const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

        // set React state
        setSelectedCoord( transormedCoord )

    }
    let height  = style && style.height || '100%'

    // render component
    return (
        <div style={{...style, width: '100%', height: height}}>

            <div ref={mapElement} style={{height: '100%', width: '100%'}} className="map-container"></div>

            <div className="clicked-coord-label">
                <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
            </div>

        </div>
    )

}

export default OpenLayerMap