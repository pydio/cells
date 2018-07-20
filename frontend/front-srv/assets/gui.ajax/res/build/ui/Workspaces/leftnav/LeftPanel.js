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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _UserWidget = require('./UserWidget');

var _UserWidget2 = _interopRequireDefault(_UserWidget);

var _wslistWorkspacesList = require('../wslist/WorkspacesList');

var _wslistWorkspacesList2 = _interopRequireDefault(_wslistWorkspacesList);

var React = require('react');
var Pydio = require('pydio');

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var LeftPanel = function LeftPanel(_ref) {
    var muiTheme = _ref.muiTheme;
    var _ref$style = _ref.style;
    var style = _ref$style === undefined ? {} : _ref$style;
    var userWidgetProps = _ref.userWidgetProps;
    var workspacesListProps = _ref.workspacesListProps;
    var pydio = _ref.pydio;

    var palette = muiTheme.palette;
    var Color = require('color');
    var colorHue = Color(palette.primary1Color).hsl().array()[0];
    var lightBg = new Color({ h: colorHue, s: 35, l: 98 });

    style = _extends({
        backgroundColor: lightBg.toString()
    }, style);
    var widgetStyle = {
        backgroundColor: Color(palette.primary1Color).darken(0.2).toString(),
        width: '100%'
    };
    var wsListStyle = {
        backgroundColor: lightBg.toString(),
        color: Color(palette.primary1Color).darken(0.1).alpha(0.87).toString()
    };
    var wsSectionTitleStyle = {
        color: Color(palette.primary1Color).darken(0.1).alpha(0.50).toString()
    };
    var uWidgetProps = userWidgetProps || {};
    var wsListProps = workspacesListProps || {};

    return React.createElement(
        'div',
        { className: 'left-panel vertical_fit vertical_layout', style: style },
        React.createElement(_UserWidget2['default'], _extends({
            pydio: pydio,
            style: widgetStyle
        }, uWidgetProps)),
        React.createElement(_wslistWorkspacesList2['default'], _extends({
            className: "vertical_fit",
            style: wsListStyle,
            sectionTitleStyle: wsSectionTitleStyle,
            pydio: pydio,
            showTreeForWorkspace: pydio.user ? pydio.user.activeRepository : false
        }, wsListProps))
    );
};

LeftPanel.propTypes = {
    pydio: React.PropTypes.instanceOf(Pydio).isRequired,
    userWidgetProps: React.PropTypes.object,
    workspacesListProps: React.PropTypes.object,
    style: React.PropTypes.object
};

exports['default'] = LeftPanel = muiThemeable()(LeftPanel);

exports['default'] = LeftPanel;
module.exports = exports['default'];
