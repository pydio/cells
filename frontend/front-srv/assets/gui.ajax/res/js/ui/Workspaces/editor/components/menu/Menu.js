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

import React from 'react'
import Pydio from 'pydio';
import { connect } from 'react-redux';
import MainButton from './MainButton';
import MenuGroup from './MenuGroup';
import MenuItem from './MenuItem';

const { EditorActions } = Pydio.requireLib('hoc');

// Components
class Menu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ready: false
        }

        const {editorModify} = props

        this.toggle = () => editorModify({isMenuActive: !this.props.isActive})
    }

    renderChild() {

        const {isActive, tabs} = this.props

        if (!isActive) return null

        return tabs.map((tab) => {
            const style = {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transition: "transform 0.3s ease-in"
            }

            return <MenuItem key={tab.id} id={tab.id} style={{...style}} />
        })
    }

    render() {
        const {style, isActive} = this.props

        return (
            <div>
                <MenuGroup style={style}>
                    {this.renderChild()}
                </MenuGroup>
                <MainButton ref="button" open={isActive} style={style} onClick={this.toggle} />
            </div>
        );
    }
};

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    const { editor, tabs } = state

    const activeTab = tabs.filter(tab => tab.id === editor.activeTabId)[0]

    return  {
        ...editor,
        activeTab: activeTab,
        tabs,
        isActive: editor.isMenuActive
    }
}
const ConnectedMenu = connect(mapStateToProps, EditorActions)(Menu)

// EXPORT
export default ConnectedMenu;
