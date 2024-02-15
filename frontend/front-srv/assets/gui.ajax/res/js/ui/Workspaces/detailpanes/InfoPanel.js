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

import PropTypes from 'prop-types';
import React from 'react';
import Pydio from 'pydio'
import XMLUtils from 'pydio/util/xml'
import {Paper} from "material-ui";
import {muiThemeable} from 'material-ui/styles'

const {withVerticalScroll} = Pydio.requireLib('hoc')
const {EmptyStateView} = Pydio.requireLib('components')
const {AsyncComponent} = Pydio.requireLib('boot')


// We keep this as a legacy component to retrieve the scrollArea context
class InfoPanel extends React.Component {

    render() {

        const {displayData, mainEmptyStateProps, onContentChange, style, switches, muiTheme, ...subProps} = this.props;
        const styles = muiTheme.buildFSTemplate({}).infoPanel;

        let dataTemplates = [...displayData.TEMPLATES];

        if(switches) {
            // Apply registered switches
            switches.forEach(({source, target}) => {
                const srcIndex = dataTemplates.findIndex(t => t.COMPONENT === source)
                const targetIndex = dataTemplates.findIndex(t => t.COMPONENT === target)
                if(srcIndex > -1 && targetIndex > -1) {
                    const temp = dataTemplates[targetIndex]
                    dataTemplates[targetIndex] = dataTemplates[srcIndex]
                    dataTemplates[srcIndex] = temp;
                }
            });
        }

        let scrollAreaProps = {}
        if(this.context && this.context.scrollArea)(
            scrollAreaProps = this.context.scrollArea
        )

        let templates = dataTemplates.map((tpl, i) => {
            const component = tpl.COMPONENT;
            const [namespace, name] = component.split('.', 2);

            return (
                <AsyncComponent
                    {...displayData.DATA}
                    {...subProps}
                    key={"ip_" + component}
                    namespace={namespace}
                    componentName={name}
                    scrollAreaProps={scrollAreaProps}
                />
            );
        });
        if(!templates.length && mainEmptyStateProps) {
            templates.push(<EmptyStateView {...mainEmptyStateProps}/>)
        }
        return (
            <Paper zDepth={0} rounded={false} style={{backgroundColor:'transparent', ...styles.contentContainer, ...style}}>{templates}</Paper>
        );
    }
}

InfoPanel.propTypes = {
    dataModel: PropTypes.instanceOf(PydioDataModel).isRequired,
    pydio:PropTypes.instanceOf(Pydio).isRequired,
    style: PropTypes.object
}

InfoPanel.contextTypes = {
    scrollArea: PropTypes.object
};

const InfoPanelNoScroll = muiThemeable()(InfoPanel);
InfoPanel = withVerticalScroll(InfoPanel, {id: "info_panel"})
InfoPanel = muiThemeable()(InfoPanel)

export {InfoPanel as default};
export {InfoPanelNoScroll};