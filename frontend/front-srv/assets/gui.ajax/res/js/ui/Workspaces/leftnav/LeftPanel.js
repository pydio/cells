/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
const PropTypes = require('prop-types');
const Pydio = require('pydio')
const {muiThemeable} = require('material-ui/styles')
import UserWidget from './UserWidget'
import WorkspacesList from '../wslist/WorkspacesList'
const {TasksPanel} = Pydio.requireLib("boot");
import Color from 'color'

let LeftPanel = ({muiTheme, style={}, userWidgetProps, workspacesListProps = {}, pydio, onClick, onMouseOver}) => {

        const palette = muiTheme.palette;
        const colorHue = Color(palette.primary1Color).hsl().array()[0];
        const lightBg = new Color({h:colorHue,s:35,l:98});
        const taskBg = new Color({h:colorHue,s:30,l:96});

        style = {
            backgroundColor: lightBg.toString(),
            ...style
        };

        let uWidgetProps = {...userWidgetProps};
        uWidgetProps.style = {
            backgroundColor: Color(palette.primary1Color).darken(0.2).toString(),
            width:'100%',
            ...uWidgetProps.style
        };

        const wsListStyle = {
            backgroundColor     : lightBg.toString(),
            color               : Color(palette.primary1Color).darken(0.1).alpha(0.87).toString(),
            borderRight         : '1px solid #e0e0e0'
        };
        const wsSectionTitleStyle = {
            color    : Color(palette.primary1Color).darken(0.1).alpha(0.50).toString()
        };

        return (
            <div className="left-panel vertical_fit vertical_layout" style={style} onClick={onClick} onMouseOver={onMouseOver}>
                <UserWidget
                    pydio={pydio}
                    controller={pydio.getController()}
                    toolbars={["aUser", "user", "zlogin"]}
                    {...uWidgetProps}
                />
                <WorkspacesList
                    className={"vertical_fit"}
                    style={wsListStyle}
                    sectionTitleStyle={wsSectionTitleStyle}
                    pydio={pydio}
                    showTreeForWorkspace={pydio.user?pydio.user.activeRepository:false}
                    {...workspacesListProps}
                />
                <TasksPanel pydio={pydio} mode={"flex"} panelStyle={{...wsListStyle, backgroundColor: taskBg.toString()}}/>
            </div>
        );
};

LeftPanel.propTypes = {
    pydio               : PropTypes.instanceOf(Pydio).isRequired,
    userWidgetProps     : PropTypes.object,
    workspacesListProps : PropTypes.object,
    style               : PropTypes.object
};

LeftPanel = muiThemeable()(LeftPanel);

export {LeftPanel as default}
