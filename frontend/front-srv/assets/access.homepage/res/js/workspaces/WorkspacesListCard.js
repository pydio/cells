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
const {WorkspacesListMaterial} = require('pydio').requireLib('workspaces')
import {Style, Paper, CardTitle} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

class ThemeableTitle extends React.Component{

    render(){
        const {pydio, filterByType, muiTheme} = this.props;
        const messages = pydio.MessageHash;
        const bgColor = filterByType === 'entries' ? muiTheme.palette.primary1Color : Style.colors.teal500;
        const title = messages[filterByType==='entries'?468:469];
        const cardTitleStyle = {backgroundColor:bgColor, color: 'white', padding: 16, fontSize: 24, lineHeight:'36px'};

        return <Paper zDepth={0} rounded={false} style={cardTitleStyle}>{title}</Paper>;
    }

}

ThemeableTitle = muiThemeable()(ThemeableTitle);

class WorkspacesListCard extends React.Component {
    render() {
        const {pydio, filterByType} = this.props;
        let props = {...this.props};
        if(props.style){
            props.style = {...props.style, overflowY:'auto', zIndex: 1};
        }

        const blackAndWhiteTitle = <CardTitle title={pydio.MessageHash[filterByType==='entries'?468:469]}/>;
        const themedTitle = <ThemeableTitle {...this.props}/>;


        return (
            <Paper zDepth={1} {...props} transitionEnabled={false} rounded={false}>
                {this.props.closeButton}
                <div  style={{height: '100%', display:'flex', flexDirection:'column'}}>
                    <WorkspacesListMaterial
                        className={"vertical_fit filter-" + filterByType}
                        pydio={pydio}
                        workspaces={pydio.user ? pydio.user.getRepositoriesList() : []}
                        showTreeForWorkspace={false}
                        filterByType={this.props.filterByType}
                        sectionTitleStyle={{display:'none'}}
                        style={{flex:1, overflowY: 'auto'}}
                    />
                </div>
            </Paper>
        );
    }
}

export {WorkspacesListCard as default}