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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _materialUi = require('material-ui');

OpenLayers.ImgPath = 'plug/editor.openlayer/openlayer/img/';

var OLMap = (function (_React$Component) {
    _inherits(OLMap, _React$Component);

    function OLMap() {
        _classCallCheck(this, OLMap);

        _get(Object.getPrototypeOf(OLMap.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(OLMap, [{
        key: 'attachMap',
        value: function attachMap() {

            if (this.state && this.state.map) this.state.map.destroy();

            var _props = this.props;
            var centerPoint = _props.centerPoint;
            var centerNode = _props.centerNode;
            var centerSRS = _props.centerSRS;
            var onMapLoaded = _props.onMapLoaded;
            var useDefaultControls = _props.useDefaultControls;

            // PARSE METADATA

            var layersDefinitions = [{ type: 'OSM' }],
                latitude = undefined,
                longitude = undefined;

            if (centerPoint) {
                latitude = centerPoint.latitude;
                longitude = centerPoint.longitude;
            } else if (centerNode) {
                var meta = centerNode.getMetadata();
                if (meta.has("COMPUTED_GPS-GPS_Latitude") && meta.has("COMPUTED_GPS-GPS_Longitude")) {
                    latitude = parseFloat(meta.get("COMPUTED_GPS-GPS_Latitude").split('--').pop());
                    longitude = parseFloat(meta.get("COMPUTED_GPS-GPS_Longitude").split('--').pop());
                }
            }

            if (!latitude || !longitude) {
                return typeof onMapLoaded === "function" && onMapLoaded(null, 'Could not find latitude / longitude');
            }

            var meta_center = new OpenLayers.LonLat(longitude, latitude);
            var meta_srs = centerSRS;

            // Check Google layer
            var googleRejected = false;
            var filteredDefinitions = layersDefinitions.filter(function (_ref) {
                var type = _ref.type;
                return type === 'Google' && !(window.google && window.google.maps);
            });

            if (filteredDefinitions !== layersDefinitions) {
                if (filteredDefinitions > 0) {
                    meta_srs = 'EPSG:900913';
                } else {
                    meta_srs = 'EPSG:4326';
                }
            }

            var options = {
                projection: meta_srs,
                controls: useDefaultControls ? [] : null
            };

            var map = new OpenLayers.Map(this.refs.target, options);
            var layers = [];

            layersDefinitions.map(function (_ref2) {
                var type = _ref2.type;
                var name = _ref2.name;
                var style = _ref2.style;
                var tile = _ref2.tile;
                var wms_url = _ref2.wms_url;
                var google_type = _ref2.google_type;

                var layer = undefined;

                if (type == 'WMS') {
                    layer = new OpenLayers.Layer.WMS(tile ? "Tiled" : "Single Tile", wms_url, {
                        layers: name,
                        styles: style,
                        tiled: tile,
                        tilesOrigin: tile ? map.maxExtent.left + ',' + map.maxExtent.bottom : null
                    }, null);
                } else if (type == 'OSM') {
                    layer = new OpenLayers.Layer.OSM();
                } else if (type == 'Google') {
                    switch (google_type) {
                        case 'physical':
                            layer = new OpenLayers.Layer.Google("Google Physical", { type: window.google.maps.MapTypeId.TERRAIN });
                            break;

                        case 'streets':
                            layer = new OpenLayers.Layer.Google("Google Streets", // the default
                            { numZoomLevels: 20 });
                            break;

                        case 'hybrid':
                            layer = new OpenLayers.Layer.Google("Google Hybrid", { type: global.google.maps.MapTypeId.HYBRID, numZoomLevels: 20 });
                            break;

                        case 'satellite':
                        default:
                            layer = new OpenLayers.Layer.Google("Google Satellite", { type: global.google.maps.MapTypeId.SATELLITE, numZoomLevels: 22 });
                            break;
                    }
                }

                if (layer) {
                    map.addLayer(layer);
                    layers.push(layer);
                }
            });

            var projectedCenter = meta_center.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());

            // Add Marker for center!
            var markers = new OpenLayers.Layer.Markers("Markers");
            map.addLayer(markers);
            var size = new OpenLayers.Size(22, 22);
            var offset = new OpenLayers.Pixel(0, -size.h);
            var icon = new OpenLayers.Icon('plugins/editor.openlayer/res/services.png', size, offset);
            markers.addMarker(new OpenLayers.Marker(projectedCenter, icon));
            try {
                map.setCenter(projectedCenter, 10);
            } catch (e) {
                if (console) console.error(e);
            }

            this.setState({
                map: map,
                layers: layers
            });

            setTimeout(function () {
                return map.updateSize();
            }, 300);

            typeof onMapLoaded === "function" && onMapLoaded(map);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.attachMap();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.centerNode !== this.props.centerNode) {
                this.attachMap();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.state && this.state.map) {
                this.state.map.destroy();
            }
        }
    }, {
        key: 'render',
        value: function render() {

            var style = _extends({
                width: '100%',
                height: '100%'
            }, this.props.style);

            return _react2['default'].createElement('div', { style: style, ref: 'target' });
        }
    }], [{
        key: 'propTypes',
        get: function get() {
            return {
                centerPoint: _react2['default'].PropTypes.object,
                centerNode: _react2['default'].PropTypes.instanceOf(AjxpNode),
                centerSRS: _react2['default'].PropTypes.string,
                defaultControls: _react2['default'].PropTypes.bool,

                onMapLoaded: _react2['default'].PropTypes.func
            };
        }
    }, {
        key: 'defaultProps',
        get: function get() {
            return {
                centerSRS: 'EPSG:4326',
                defaultControls: true
            };
        }
    }]);

    return OLMap;
})(_react2['default'].Component);

exports['default'] = OLMap;
module.exports = exports['default'];
