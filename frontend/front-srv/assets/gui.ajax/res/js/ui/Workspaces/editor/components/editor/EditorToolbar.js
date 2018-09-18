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

import { connect } from 'react-redux';
import { ToolbarGroup, IconButton } from 'material-ui';

const { ModalAppBar } = PydioComponents
const { makeTransitionHOC, EditorActions } = Pydio.requireLib('hoc');

// Display components
// TODO - should be two motions for appearing and disappearing, based on a condition in the props
@makeTransitionHOC({translateY: -60, opacity: 0}, {translateY: 0, opacity: 1})
@connect(mapStateToProps, EditorActions)
export default class EditorToolbar extends React.Component {

    onClose() {
        const {tabDeleteAll} = this.props

        tabDeleteAll()
    }

    onMinimise() {
        const {editorModify} = this.props

        editorModify({isMinimised: true})
    }

    render() {
        const {title, className, style} = this.props

        const innerStyle = {color: "#FFFFFF", fill: "#FFFFFF"}

        return (
            <ModalAppBar
                className={className}
                style={style}
                title={<span>{title}</span>}
                titleStyle={innerStyle}
                iconElementLeft={<IconButton iconClassName="mdi mdi-close" iconStyle={innerStyle} touch={true} onTouchTap={() => this.onClose()}/>}
                iconElementRight={
                    <ToolbarGroup>
                        <IconButton iconClassName="mdi mdi-window-minimize" iconStyle={innerStyle} touch={true} onTouchTap={() => this.onMinimise()}/>
                    </ToolbarGroup>
                }
            />
        )
    }
}

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    const { editor = {}, tabs = [] } = state
    const { activeTabId = -1} = editor

    const activeTab = tabs.filter(tab => tab.id === activeTabId)[0]

    return  {
        ...ownProps,
        title: activeTab.title
    }
}
