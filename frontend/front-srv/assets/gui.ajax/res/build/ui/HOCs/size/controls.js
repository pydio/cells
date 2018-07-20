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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _materialUi = require('material-ui');

var _materialUiSvgIconsActionAspectRatio = require('material-ui/svg-icons/action/aspect-ratio');

var _materialUiSvgIconsActionAspectRatio2 = _interopRequireDefault(_materialUiSvgIconsActionAspectRatio);

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _utils2 = require('../utils');

var styles = {
    sliderContainer: {
        width: "100%",
        height: 150,
        display: "flex",
        justifyContent: "center"
    },
    slider: {
        margin: 0
    }
};

var AspectRatio = _reactRedux.connect(_utils.mapStateToProps)(function (props) {
    return React.createElement(
        _materialUi.IconButton,
        { onClick: function () {
                return _utils2.handler("onSizeChange", props)({ size: "contain" });
            } },
        React.createElement(_materialUiSvgIconsActionAspectRatio2['default'], null)
    );
});

exports.AspectRatio = AspectRatio;
var Scale = _reactRedux.connect(_utils.mapStateToProps)(function (props) {
    return React.createElement(
        _materialUi.DropDownMenu,
        null,
        React.createElement(_materialUi.MenuItem, { primaryText: parseInt(props.scale * 100) + '%' }),
        React.createElement(_materialUi.Slider, {
            axis: 'y',
            style: styles.sliderContainer,
            sliderStyle: styles.slider,
            value: props.scale,
            min: 0.01,
            max: 4,
            onChange: function (_, scale) {
                return _utils2.handler("onSizeChange", props)({ size: "auto", scale: scale });
            } })
    );
});
exports.Scale = Scale;
