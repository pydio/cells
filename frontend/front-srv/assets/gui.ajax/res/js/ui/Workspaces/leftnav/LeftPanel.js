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

const React = require('react')
const Pydio = require('pydio')
const {muiThemeable} = require('material-ui/styles')
import UserWidget from './UserWidget'
import WorkspacesList from '../wslist/WorkspacesList'

let LeftPanel = ({muiTheme, style={}, userWidgetProps, workspacesListProps, pydio}) => {

        const palette = muiTheme.palette;
        const Color = require('color');
        const colorHue = Color(palette.primary1Color).hsl().array()[0];
        const lightBg = new Color({h:colorHue,s:35,l:98});

        style = {
            backgroundColor: lightBg.toString(),
            ...style
        };
        const widgetStyle = {
            backgroundColor: Color(palette.primary1Color).darken(0.2).toString(),
            width:'100%'
        };
        const wsListStyle = {
            backgroundColor     : lightBg.toString(),
            color               : Color(palette.primary1Color).darken(0.1).alpha(0.87).toString()
        };
        const wsSectionTitleStyle = {
            color    : Color(palette.primary1Color).darken(0.1).alpha(0.50).toString()
        };
        const uWidgetProps = userWidgetProps || {};
        const wsListProps = workspacesListProps || {};

        return (
            <div className="left-panel vertical_fit vertical_layout" style={style}>
                <UserWidget
                    pydio={pydio}
                    style={widgetStyle}
                    {...uWidgetProps}
                />
                <WorkspacesList
                    className={"vertical_fit"}
                    style={wsListStyle}
                    sectionTitleStyle={wsSectionTitleStyle}
                    pydio={pydio}
                    showTreeForWorkspace={pydio.user?pydio.user.activeRepository:false}
                    {...wsListProps}
                />
            </div>
        );
};

LeftPanel.propTypes = {
    pydio               : React.PropTypes.instanceOf(Pydio).isRequired,
    userWidgetProps     : React.PropTypes.object,
    workspacesListProps : React.PropTypes.object,
    style               : React.PropTypes.object
};

LeftPanel = muiThemeable()(LeftPanel);

export {LeftPanel as default}
